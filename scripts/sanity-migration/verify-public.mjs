import path from 'node:path';
import assert from 'node:assert/strict';
import {config,json,save} from './io.mjs';

const directory=path.resolve(process.argv[2] || '');
const plan=await json(path.join(directory,'plan.json'));
const receipt=await json(path.join(directory,'receipt.json'));
const c=await config();
const urls=new Set();
const checks=[];
async function query(name,locale) {
  const r=await fetch(`${c.convexUrl}/api/query`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:name,args:{locale},format:'json'}),signal:AbortSignal.timeout(30000)});
  const d=await r.json();if(!r.ok||d.status!=='success')throw Error(`Public query failed: ${name}/${locale}`);return d.value;
}
for(const locale of ['ar','tr','en']) {
  const [books,bio,lessons]=await Promise.all([query('content:getBooks',locale),query('content:getBiography',locale),query('content:getLessons',locale)]);
  assert.equal(books.length,plan.counts.books);
  for(const source of plan.payload.books) {
    const b=books.find(b=>b._id===receipt.bookIds[source.sourceId]);
    assert.ok(b);assert.equal(b.title,source.data.title[locale]);assert.equal(b.description,source.data.description[locale]);
    assert.equal(b.url,source.data.url);assert.equal(b.slug,source.data.slug);assert.ok(b.coverImage);urls.add(b.coverImage);
  }
  assert.equal(bio.description,plan.payload.biography.description[locale]);
  assert.equal(bio.card.birthDate,'1931-11-01');
  assert.deepEqual(bio.card.publishedWorks.map(x=>x._id),plan.payload.biography.card.publishedWorks.map(id=>receipt.bookIds[id]));
  assert.equal(bio.timeline.length,plan.counts.timeline);
  for(let i=0;i<bio.timeline.length;i++)assert.equal(bio.timeline[i].title,plan.payload.biography.timeline[i].title[locale]);
  assert.equal(lessons.lessons.length,plan.counts.lessons);
  for(let i=0;i<lessons.lessons.length;i++){
    assert.equal(lessons.lessons[i].title,plan.payload.lessonsPage.lessons[i].title[locale]);
    assert.equal(lessons.lessons[i].url,plan.payload.lessonsPage.lessons[i].url);
    if(lessons.lessons[i].image)urls.add(lessons.lessons[i].image);
  }
  if(bio.card.image)urls.add(bio.card.image);if(lessons.image)urls.add(lessons.image);
  checks.push({locale,books:books.length,lessons:lessons.lessons.length,timeline:bio.timeline.length,bookReferences:bio.card.publishedWorks.length});
}
for(const url of urls){const r=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(30000)});assert.ok(r.ok,`Image unavailable: ${r.status}`);assert.ok(r.headers.get('content-type')?.startsWith('image/'));}
const result={checkedAt:new Date().toISOString(),checks,imageUrlsVerified:urls.size};
await save(path.join(directory,'public-verification.json'),result);
console.log(JSON.stringify(result,null,2));
