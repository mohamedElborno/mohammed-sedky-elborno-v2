import { canonical, sha256 } from './io.mjs';

export const textOf = block => (block.children || []).map(c => c.text || '').join('');
const escape = s => s.replace(/([\\`*_[\]<>])/g, '\\$1');
export function portableText(value, issue = () => {}, field = '', translatedBlocks) {
  if (typeof value === 'string') return value;
  const blocks = Array.isArray(value) ? value : value?._type === 'block' ? [value] : null;
  if (!blocks) { issue('error', 'invalid_text', field); return ''; }
  let previousList = false;
  return blocks.map((b, index) => {
    if (b._type !== 'block' || !Array.isArray(b.children)) { issue('error', 'unsupported_portable_block', `${field}[${index}]`, b._type); return JSON.stringify(b); }
    let text;
    if (translatedBlocks) {
      text = translatedBlocks[index];
      if (typeof text !== 'string') { issue('error', 'missing_block_translation', `${field}[${index}]`); text = ''; }
      // Translation is per complete paragraph; retain all annotation destinations.
      const links = (b.markDefs || []).filter(m => m.href).map(m => m.href);
      if (links.length) text += ' (' + links.join('; ') + ')';
    } else {
      text = b.children.map(c => {
        if (c._type !== 'span' || typeof c.text !== 'string') { issue('error', 'unsupported_inline_object', field, c._type); return JSON.stringify(c); }
        let s = escape(c.text);
        for (const mark of c.marks || []) {
          if (mark === 'strong') s = `**${s}**`;
          else if (mark === 'em') s = `*${s}*`;
          else if (mark === 'code') s = '`' + c.text.replace(/`/g, '\\`') + '`';
          else {
            const def = (b.markDefs || []).find(m => m._key === mark);
            if (def?.href && /^(https?:|mailto:)/i.test(def.href)) s += ` (${def.href})`;
            else if (['underline', 'strike-through'].includes(mark)) issue('warning', 'flattened_decoration', field, mark);
            else issue('error', 'unsupported_annotation', field, def || mark);
          }
        }
        return s;
      }).join('');
    }
    const list = Boolean(b.listItem);
    let prefix = '';
    if (/^h[1-6]$/.test(b.style || '')) prefix = '#'.repeat(Number(b.style[1])) + ' ';
    else if (b.style === 'blockquote') prefix = '> ';
    else if (b.style && b.style !== 'normal') issue('warning', 'flattened_style', field, b.style);
    if (list) {
      if (!['bullet', 'number'].includes(b.listItem)) issue('error', 'unsupported_list', field, b.listItem);
      prefix = '  '.repeat(Math.max(0, (b.level || 1) - 1)) + (b.listItem === 'number' ? '1. ' : '- ');
    }
    const separator = index ? (previousList && list ? '\n' : '\n\n') : '';
    previousList = list;
    return separator + prefix + text.replace(/\n/g, '  \n');
  }).join('');
}

export function transform(docs, target, manifest, translations, options = {}) {
  const issues = [];
  const issue = (severity, code, field, detail) => issues.push({ severity, code, field, ...(detail === undefined ? {} : { detail }) });
  const published = docs.filter(d => !d._id.startsWith('drafts.') && !d._id.startsWith('versions.'));
  const books = published.filter(d => d._type === 'books').sort((a,b) => a._id.localeCompare(b._id));
  const assets = Object.fromEntries(published.filter(d => d._type === 'sanity.imageAsset').map(d => [d._id,d]));
  const requiredAssets = new Set();
  const empty = (field, kind = 'missing_text') => {
    issue(options.allowMissingText ? 'warning' : 'error', kind, field, 'No source value; represented as an empty string, never fabricated.'); return '';
  };
  function string(value, field, nonempty = false) {
    if (value === undefined || value === null || value === '') {
      if (nonempty) issue('error', 'required_value_missing', field);
      return empty(field);
    }
    if (typeof value !== 'string') { issue('error', 'invalid_string', field); return ''; }
    return value;
  }
  function translated(ar, key, language) {
    if (!ar.trim()) return '';
    const item = translations?.[key];
    if (!item || item.sourceText !== ar || typeof item[language] !== 'string' || !item[language].trim()) {
      issue('error', 'translation_missing_or_stale', `${key}.${language}`); return '';
    }
    return item[language];
  }
  function localized(value, field, rich = false) {
    const result = {};
    const raw = value?.ar;
    if (rich && Array.isArray(raw)) {
      result.ar = portableText(raw, issue, `${field}.ar`);
      for (const lang of ['tr','en']) result[lang] = translations
        ? portableText(raw, issue, `${field}.${lang}`, raw.map((b,i) => translated(textOf(b), `${field}.blocks.${i}`, lang)))
        : value?.[lang] ? portableText(value[lang], issue, `${field}.${lang}`) : empty(`${field}.${lang}`);
    } else {
      result.ar = string(raw, `${field}.ar`);
      for (const lang of ['tr','en']) {
        if (translations) result[lang] = translated(result.ar, field, lang);
        else result[lang] = string(value?.[lang], `${field}.${lang}`);
      }
    }
    return result;
  }
  function image(value, field) {
    if (value == null) { issue('warning','missing_image',field); return null; }
    const ref = value.asset?._ref;
    if (!ref || !assets[ref] || !manifest.assets[ref]) { issue('error', 'missing_asset',field,ref || value); return null; }
    requiredAssets.add(ref);
    if (value.crop || value.hotspot) issue('warning', 'crop_hotspot_in_backup_only', field);
    if (!manifest.assets[ref].originalVerified) issue('warning','cdn_rendition',field,'Downloaded public CDN image; original metadata/hash differ. Bytes saved and SHA-256 verified.');
    return { $asset: ref };
  }
  function date(value, field) {
    const s = string(value, field);
    if (s && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s)) || new Date(s).toISOString().slice(0,10) !== s)) issue('error', 'invalid_date', field, s);
    return s;
  }
  function url(value, field) {
    const s = string(value, field);
    if (s) { try { const u = new URL(s); if (!['http:','https:'].includes(u.protocol) || u.username || u.password) throw Error(); } catch { issue('error','invalid_url',field); } }
    return s;
  }
  function array(value, field) { if (!Array.isArray(value)) { issue('error','missing_array',field); return []; } return value; }
  const mappedBooks = books.map(b => {
    if (!b.title?.ar?.trim()) issue('error','required_arabic_title',`${b._id}.title.ar`);
    if (typeof b.order !== 'number' || !Number.isFinite(b.order)) issue('error', 'missing_order', `${b._id}.order`);
    return { sourceId: b._id, data: {
      title: localized(b.title, `${b._id}.title`), description: localized(b.description, `${b._id}.description`),
      url: url(b.url,`${b._id}.url`), slug: string(b.slug?.current,`${b._id}.slug`,true),
      order: typeof b.order === 'number' ? b.order : null,
      coverImage: image(b.coverImage,`${b._id}.coverImage`), date: date(b.date,`${b._id}.date`),
    }};
  });
  if (!books.length) issue('error','no_books','books');
  const slugs = new Set();
  for (const b of mappedBooks) { if (slugs.has(b.data.slug)) issue('error','duplicate_slug',b.sourceId,b.data.slug); slugs.add(b.data.slug); }
  const singleton = type => {
    const list = published.filter(d => d._type === type);
    if (list.length !== 1) { issue('error','singleton_count',type,list.length); return null; }
    return list[0];
  };
  const bio = singleton('biography'); const lp = singleton('lessonsPage');
  const biography = bio ? {
    description: localized(bio.description,`${bio._id}.description`,true),
    card: {
      image: image(bio.card?.image,`${bio._id}.card.image`),
      name: localized(bio.card?.name,`${bio._id}.card.name`),
      birthDate: date(bio.card?.birthDate,`${bio._id}.card.birthDate`), deathDate: date(bio.card?.deathDate,`${bio._id}.card.deathDate`),
      birthPlace: localized(bio.card?.birthPlace,`${bio._id}.card.birthPlace`),
      majorEducationalInstitution: localized(bio.card?.majorEducationalInstitution,`${bio._id}.card.majorEducationalInstitution`),
      publishedWorks: array(bio.card?.publishedWorks,`${bio._id}.card.publishedWorks`).map(r => {
        if (!books.some(b => b._id === r._ref)) issue('error','unresolved_book_reference',bio._id,r._ref);
        return r._ref || '';
      }),
    },
    timeline: array(bio.timeline,`${bio._id}.timeline`).map((item,i) => ({
      title: localized(item.title,`${bio._id}.timeline.${i}.title`), date: date(item.date,`${bio._id}.timeline.${i}.date`),
      ...(item.image ? { image: image(item.image,`${bio._id}.timeline.${i}.image`) } : {}),
    })),
  } : null;
  const lessonsPage = lp ? {
    image: image(lp.image,`${lp._id}.image`), url: url(lp.url,`${lp._id}.url`),
    lessons: array(lp.lessons,`${lp._id}.lessons`).map((item,i) => ({
      title: localized(item.title,`${lp._id}.lessons.${i}.title`), description: localized(item.description,`${lp._id}.lessons.${i}.description`),
      image: image(item.image,`${lp._id}.lessons.${i}.image`), url: url(item.url,`${lp._id}.lessons.${i}.url`),
    })),
  } : null;
  const extras = [bio,lp].filter(Boolean).map(d => ({sourceId:d._id, fields:Object.fromEntries(['title','subtitle','description'].filter(f => f !== 'description' || d._type === 'lessonsPage').filter(f => d[f]).map(f => [f, localized(d[f],`${d._id}.${f}`)]))}));
  for (const d of published.filter(d => d._type === 'book')) issue('warning','legacy_book_not_in_schema',d._id,'Raw document is backed up; _type=book is not the supplied books schema.');
  if (manifest.sourceVisibility.startsWith('public-only')) issue('warning','public_only_backup','source','Published public content only. Private documents and drafts require a Sanity read token.');
  if (manifest.assetErrors.length) issue('error','backup_asset_failures','assets',manifest.assetErrors);
  if (options.mode !== 'replace-test-data' && Object.values(target).some(rows => rows.length)) issue('error','existing_target_data','target','Default mode refuses to modify populated tables.');
  const payload = { version:1, mode:options.mode || 'insert-only', config:manifest.config, sourceSha256:manifest.sourceSha256, expectedState:canonical(target), books:mappedBooks, biography, lessonsPage, assets:Object.fromEntries([...requiredAssets].sort().map(id => [id,manifest.assets[id]])) };
  if (Buffer.byteLength(canonical(payload)) > 700000 || books.length > 200) issue('error','transaction_size_limit','plan');
  return { payload, extras, issues, counts:{books:books.length, lessons:lessonsPage?.lessons.length || 0, timeline:biography?.timeline.length || 0, images:requiredAssets.size}, planId:sha256(canonical(payload)) };
}
