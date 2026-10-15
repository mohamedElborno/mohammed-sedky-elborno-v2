import path from 'node:path';
import { readFile, writeFile, open } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { config, publicConfig, json, save, canonical, sha256, snapshot, cli, call } from './io.mjs';
import { transform } from './transform.mjs';

export async function prepare(directory, opts) {
  const manifest = await json(path.join(directory,'manifest.json'));
  const raw = await readFile(path.join(directory,'sanity.ndjson'));
  const target = await json(path.join(directory,'target.json'));
  if (sha256(raw) !== manifest.sourceSha256 || sha256(canonical(target)) !== manifest.targetSha256) throw Error('Backup integrity mismatch');
  const docs = raw.toString('utf8').split(/\r?\n/).filter(s => s.trim()).map(JSON.parse);
  const translations = opts.translations ? await json(path.resolve(opts.translations)) : null;
  const corrections = opts.corrections ? await json(path.resolve(opts.corrections)) : [];
  for (const correction of corrections) {
    const doc=docs.find(d=>d._id===correction.sourceId);
    const block=doc?.description?.ar?.[correction.block];
    if(!block || block.children.map(c=>c.text || '').join('')!==correction.originalText || !correction.reason)throw Error('Stale or invalid editorial correction');
    for(const child of block.children)child.text=child.text.replace(correction.find,correction.replace);
    if(block.children.map(c=>c.text || '').join('')!==correction.replacementText)throw Error('Correction would discard or alter unapproved text');
  }
  const plan = transform(docs,target,manifest,translations,opts);
  plan.payload.editorialCorrections=corrections;
  plan.planId=sha256(canonical(plan.payload));
  await save(path.join(directory,'plan.json'),plan,true);
  await save(path.join(directory,'page-texts-review.json'),plan.extras,true);
  const errors = plan.issues.filter(i=>i.severity==='error');
  const counts = Object.entries(plan.counts).map(([k,v])=>`- ${k}: ${v}`).join('\n');
  const report = `# تقرير الترحيل — Dry-run\n\nالهدف: ${manifest.config.deployment}\n\nالوضع: ${plan.payload.mode}\n\nالحالة: ${errors.length ? 'متوقف — أخطاء تحتاج مراجعة' : 'جاهز للاستيراد بعد الموافقة'}\n\n${counts}\n\nبصمة الموافقة: \`${plan.planId}\`\n\nالنسخة تشمل بيانات Sanity المتاحة والصور وملف Convex ZIP مع Storage. النصوص القديمة محفوظة في النسخة الأصلية.\n\n## الملاحظات\n\n${plan.issues.map(i=>`- **${i.severity} / ${i.code}** — ${i.field}${i.detail ? ': '+JSON.stringify(i.detail) : ''}`).join('\n')}\n`;
  await writeFile(path.join(directory,'report.md'),report,{flag:'wx'});
  return {planId:plan.planId,counts:plan.counts,errors:errors.length,warnings:plan.issues.length-errors.length};
}
async function verifiedBytes(directory, asset) {
  const filename=path.resolve(directory,asset.file);
  if (!filename.startsWith(path.resolve(directory)+path.sep)) throw Error('Asset path escapes backup directory');
  const bytes=await readFile(filename);
  if(sha256(bytes)!==asset.sha256||bytes.length!==asset.bytes) throw Error('Local asset integrity mismatch');
  return bytes;
}
async function upload(c,bytes,type) {
  const url=await call(c,'sanityMigration:generateUploadUrl');
  const u=new URL(url);
  if(u.origin!==c.convexUrl || !u.pathname.startsWith('/api/storage/upload')) throw Error('Unexpected upload destination');
  const res=await fetch(u,{method:'POST',headers:{'Content-Type':type},body:bytes,redirect:'error',signal:AbortSignal.timeout(120000)});
  if(!res.ok) throw Error(`Upload failed: HTTP ${res.status}`);
  const data=await res.json();
  if(typeof data.storageId!=='string') throw Error('Missing storage ID');
  return data.storageId;
}
function materialize(payload,uploads,bookIds) {
  function images(v) {
    if(Array.isArray(v)) return v.map(images);
    if(v&&typeof v==='object') { if(v.$asset) return uploads[v.$asset]; return Object.fromEntries(Object.entries(v).map(([k,val])=>[k,images(val)])); }
    return v;
  }
  const books=payload.books.map(b=>images(b.data));
  const biography=images(payload.biography);
  biography.card.publishedWorks=biography.card.publishedWorks.map(id=>bookIds[id]);
  return {books,biography:[biography],lessonsPage:[images(payload.lessonsPage)]};
}
export async function verify(directory,c,plan,journal,receipt) {
  const actual=await snapshot(c);
  const expected=materialize(plan.payload,journal.uploads,receipt.bookIds);
  const clean=rows=>rows.map(d=>Object.fromEntries(Object.entries(d).filter(([k])=>!k.startsWith('_')))).sort((a,b)=>canonical(a).localeCompare(canonical(b)));
  for(const t of ['books','biography','lessonsPage']) if(canonical(clean(actual[t]))!==canonical(clean(expected[t]))) throw Error(`Post-import verification failed: ${t}`);
  for(const [assetId,id] of Object.entries(journal.uploads)) {
    const info=await call(c,'sanityMigration:fileInfo',{id});
    const a=plan.payload.assets[assetId];
    if(!info||info.sha256!==Buffer.from(a.sha256,'hex').toString('base64')||info.size!==a.bytes) throw Error('Stored image verification failed');
  }
  await save(path.join(directory,'verification.json'),{verifiedAt:new Date().toISOString(),planId:plan.planId,counts:plan.counts,exactDocumentMatch:true,imagesVerified:true});
  await save(path.join(directory,'after.json'),actual);
  return {status:'verified',...plan.counts};
}
export async function apply(directory,approved) {
  const plan=await json(path.join(directory,'plan.json'));
  if(plan.planId!==approved||sha256(canonical(plan.payload))!==approved) throw Error('Pass the exact reviewed plan hash with --approve');
  if(plan.issues.some(i=>i.severity==='error')) throw Error('Dry-run contains blocking errors');
  const c=await config();
  if(canonical(publicConfig(c))!==canonical(plan.payload.config)) throw Error('Environment changed since dry-run');
  if(plan.payload.mode==='replace-test-data' && c.deployment!=='cheerful-horse-763') throw Error('Replacement only permitted on reviewed development deployment');
  const manifest=await json(path.join(directory,'manifest.json'));
  if(sha256(await readFile(path.join(directory,'convex.zip')))!==manifest.convexZipSha256 || sha256(await readFile(path.join(directory,'sanity.ndjson')))!==manifest.sourceSha256) throw Error('Backup integrity mismatch');
  const lock=await open(path.join(directory,'apply.lock'),'wx');
  try {
    let journal;
    try{journal=await json(path.join(directory,'uploads.json'));}catch(e){if(e.code!=='ENOENT')throw e;journal={planId:approved,uploads:{}};}
    if(journal.planId!==approved)throw Error('Upload journal belongs to another plan');
    let receipt;
    try{receipt=await json(path.join(directory,'receipt.json'));}catch(e){if(e.code!=='ENOENT')throw e;}
    if(receipt) return verify(directory,c,plan,journal,receipt);
    if(await call(c,'sanityMigration:version')!==1)throw Error('Deploy the reviewed migration helpers first');
    const current=await snapshot(c);
    // After an interrupted commit, retry only the saved bundle; the server detects
    // exact completion or rejects a changed target without touching any rows.
    if(canonical(current)!==plan.payload.expectedState && !journal.bundleId)throw Error('Target changed since dry-run');
    for(const [assetId,a] of Object.entries(plan.payload.assets)) {
      const bytes=await verifiedBytes(directory,a);
      if(!journal.uploads[assetId]) {
        const same=Object.keys(journal.uploads).find(id=>plan.payload.assets[id].sha256===a.sha256);
        journal.uploads[assetId]=same?journal.uploads[same]:await upload(c,bytes,a.mimeType);
        await save(path.join(directory,'uploads.json'),journal);
      }
      const info=await call(c,'sanityMigration:fileInfo',{id:journal.uploads[assetId]});
      if(!info||info.sha256!==Buffer.from(a.sha256,'hex').toString('base64')||info.size!==a.bytes)throw Error('Uploaded image differs from backup');
    }
    if(!journal.bundleId) {
      // Fresh full backup immediately before any content deletion.
      await cli(c,['export','--include-file-storage','--path',path.join(directory,`convex-pre-apply-${Date.now()}.zip`)]);
      if(canonical(await snapshot(c))!==plan.payload.expectedState)throw Error('Target changed during upload; no content imported');
      journal.bundleId=await upload(c,Buffer.from(JSON.stringify({payload:plan.payload,uploads:journal.uploads})),'application/json');
      await save(path.join(directory,'uploads.json'),journal);
    }
    receipt=await call(c,'sanityMigration:applyUploadedPlan',{bundleId:journal.bundleId,approvedPlanId:approved});
    await save(path.join(directory,'receipt.json'),receipt);
    return verify(directory,c,plan,journal,receipt);
  } finally { await lock.close(); const {unlink}=await import('node:fs/promises'); await unlink(path.join(directory,'apply.lock')); }
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const {values}=parseArgs({options:{run:{type:'string'},translations:{type:'string'},corrections:{type:'string'},'replace-test-data':{type:'boolean'},'allow-missing-text':{type:'boolean'},apply:{type:'boolean'},approve:{type:'string'}}});
    if(!values.run)throw Error('--run BACKUP_DIRECTORY is required');
    const dir=path.resolve(values.run);
    const result=values.apply?await apply(dir,values.approve):await prepare(dir,{translations:values.translations,corrections:values.corrections,mode:values['replace-test-data']?'replace-test-data':'insert-only',allowMissingText:values['allow-missing-text']||false});
    console.log(JSON.stringify(result,null,2));
    if(result.errors)process.exitCode=2;
  }catch(e){console.error(e.message);process.exitCode=1;}
}
