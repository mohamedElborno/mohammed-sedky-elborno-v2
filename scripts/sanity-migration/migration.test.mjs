import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { portableText, transform } from './transform.mjs';
import { canonical, root } from './io.mjs';
import path from 'node:path';

const localized = {ar:'عنوان',en:'Title',tr:'Başlık'};
const book = {title:localized,description:localized,url:'https://example.com/book',slug:'book',order:1,coverImage:'storage1',date:'2000-01-01'};
const biography = {description:localized,card:{image:null,name:localized,birthDate:'1931-11-01',deathDate:'2025-03-26',birthPlace:localized,majorEducationalInstitution:localized,publishedWorks:['source1']},timeline:[]};
const lessonsPage = {image:null,url:'https://example.com',lessons:[]};
const bundle = await build({entryPoints:[path.join(root,'convex/sanityMigration.ts')],bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
const backend = await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
function database(initial={books:[],biography:[],lessonsPage:[]}) {
  let state=structuredClone(initial); let next=0; const writes=[];
  const ctx={db:{query:t=>({collect:async()=>structuredClone(state[t])}),system:{get:async id=>id==='storage1'?{_id:id}:null},delete:async id=>{writes.push(['delete',id]);for(const t of Object.keys(state))state[t]=state[t].filter(d=>d._id!==id);},insert:async(t,data)=>{const id=`${t}-${++next}`;writes.push(['insert',id]);state[t].push({...structuredClone(data),_id:id,_creationTime:next});return id;}}};
  return {ctx,writes,get state(){return state;},async transact(args){const before=structuredClone(state);try{return await backend.commit._handler(ctx,args);}catch(e){state=before;throw e;}}};
}
const args = (state, mode='replace-test-data')=>({mode,expectedState:canonical(state),books:[{sourceId:'source1',data:book}],biography,lessonsPage});
test('Portable Text preserves headings, nested lists, newlines and link destinations',()=>{
  const p=[{_type:'block',style:'h2',children:[{_type:'span',text:'Heading',marks:[]}]},{_type:'block',style:'normal',listItem:'bullet',level:2,markDefs:[{_key:'a',_type:'link',href:'https://example.com'}],children:[{_type:'span',text:'Text\nNext',marks:['a']}]}];
  const issues=[];const text=portableText(p,(...a)=>issues.push(a));
  assert.match(text,/#\# Heading/);assert.match(text,/  - Text  \nNext \(https:\/\/example.com\)/);assert.equal(issues.length,0);
});
test('Unknown Portable Text objects block import rather than silently losing content',()=>{
  const issues=[];const text=portableText([{_type:'custom',caption:'keep me'}],(...a)=>issues.push(a));
  assert.match(text,/keep me/);assert.equal(issues[0][0],'error');
});
test('Target drift is rejected before any write',async()=>{
  const db=database();const a=args(db.state);db.state.books.push({_id:'concurrent',_creationTime:1,...book});
  await assert.rejects(db.transact(a),/Target changed/);assert.equal(db.writes.length,0);
});
test('Insert-only mode preserves populated tables',async()=>{
  const db=database({books:[{_id:'old',_creationTime:1,...book}],biography:[],lessonsPage:[]});
  await assert.rejects(db.transact(args(db.state,'insert-only')),/contains data/);assert.equal(db.writes.length,0);
});
test('All book references resolve to inserted IDs and retry does not duplicate data',async()=>{
  const db=database({books:[{_id:'old',_creationTime:1,...book,slug:'old'}],biography:[],lessonsPage:[]});
  const a=args(db.state);const first=await db.transact(a);const count=db.writes.length;
  assert.deepEqual(db.state.biography[0].card.publishedWorks,[first.bookIds.source1]);
  assert.equal(db.state.books.length,1);assert.equal(db.state.books[0].slug,'book');
  const retry=await db.transact(a);assert.equal(retry.status,'already-applied');assert.equal(db.writes.length,count);
});
test('Broken book references and missing storage fail before deletion',async()=>{
  const db=database();const a=args(db.state);a.biography=structuredClone(biography);a.biography.card.publishedWorks=['missing'];
  await assert.rejects(db.transact(a),/Unresolved/);assert.equal(db.writes.length,0);
  a.biography=biography;a.books=[{sourceId:'source1',data:{...book,coverImage:'missing'}}];
  await assert.rejects(db.transact(a),/Missing uploaded/);assert.equal(db.writes.length,0);
});
test('Duplicate slugs fail before writes',async()=>{
  const db=database();const a=args(db.state);a.books.push({sourceId:'source2',data:book});
  await assert.rejects(db.transact(a),/Duplicate/);assert.equal(db.writes.length,0);
});
test('Source validation blocks missing languages, absent numeric order and orphan references',()=>{
  const docs=[{_id:'source1',_type:'books',title:{ar:'عنوان'},slug:{current:'book'}},{_id:'bio',_type:'biography',description:{ar:[]},card:{publishedWorks:[{_ref:'missing'}]},timeline:[]},{_id:'lp',_type:'lessonsPage',lessons:[]}];
  const manifest={config:{},sourceSha256:'x',sourceVisibility:'token-visible documents',assets:{},assetErrors:[]};
  const p=transform(docs,{books:[],biography:[],lessonsPage:[]},manifest,null);
  for(const code of ['missing_text','missing_order','unresolved_book_reference'])assert.ok(p.issues.some(i=>i.code===code&&i.severity==='error'));
});
test('Stale translations cannot be reused against changed Arabic text',()=>{
  const docs=[{_id:'source1',_type:'books',title:{ar:'new source'},slug:{current:'book'},order:1}];
  const p=transform(docs,{books:[],biography:[],lessonsPage:[]},{config:{},sourceVisibility:'token',assets:{},assetErrors:[]},{'source1.title':{sourceText:'old source',en:'Old',tr:'Eski'}},{allowMissingText:true});
  assert.ok(p.issues.some(i=>i.code==='translation_missing_or_stale'&&i.severity==='error'));
});
test('Uploaded bundle requires the exact approval digest',async()=>{
  const ctx={storage:{get:async()=>new Blob([JSON.stringify({payload:{},uploads:{}})])}};
  await assert.rejects(backend.applyUploadedPlan._handler(ctx,{bundleId:'x',approvedPlanId:'bad'}),/Approval hash/);
});
