import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseEnv } from 'node:util';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const canonical = (value) => JSON.stringify(sort(value));
function sort(value) {
  if (Array.isArray(value)) return value.map(sort);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])]));
  return value;
}
export async function json(file) { return JSON.parse(await readFile(file, 'utf8')); }
export async function save(file, value, exclusive = false) {
  await mkdir(path.dirname(file), { recursive: true });
  const body = JSON.stringify(value, null, 2) + '\n';
  if (exclusive) return writeFile(file, body, { flag: 'wx', mode: 0o600 });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, body, { flag: 'wx', mode: 0o600 });
  await rename(temporary, file);
}
export async function config() {
  const env = {};
  for (const f of ['.env.sanity', '.env.local', '.env.migration']) {
    try { Object.assign(env, parseEnv(await readFile(path.join(root, f), 'utf8'))); }
    catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  Object.assign(env, process.env);
  const projectId = env.SANITY_PROJECT_ID || env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.SANITY_DATASET || env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = env.SANITY_API_VERSION || env.NEXT_PUBLIC_SANITY_API_VERSION;
  const deployment = env.MIGRATION_CONVEX_DEPLOYMENT || env.CONVEX_DEPLOYMENT?.split(':').at(-1);
  const convexUrl = env.MIGRATION_CONVEX_URL || env.NEXT_PUBLIC_CONVEX_URL;
  if (!/^[a-z0-9]+$/.test(projectId || '') || !/^[a-z0-9_-]+$/.test(dataset || '') || !/^\d{4}-\d{2}-\d{2}$/.test(apiVersion || '')) throw Error('Invalid or missing Sanity configuration');
  if (!/^[a-z0-9-]+$/.test(deployment || '')) throw Error('An explicit Convex deployment name is required');
  const u = new URL(convexUrl);
  if (u.protocol !== 'https:' || !u.hostname.endsWith('.convex.cloud') || u.hostname.split('.')[0] !== deployment || u.username || u.password || u.pathname !== '/' || u.search || u.hash) throw Error('Convex URL must identify the explicitly named cloud deployment');
  return { projectId, dataset, apiVersion, deployment, convexUrl: u.origin, token: env.SANITY_READ_TOKEN || env.SANITY_API_TOKEN || '' };
}
export function publicConfig(c) { return Object.fromEntries(Object.entries(c).filter(([key]) => key !== 'token')); }
const exec = promisify(execFile);
export async function cli(c, args) {
  // argv array, no shell. Never deploy implicitly and never print CLI output containing content/secrets.
  try {
    const { stdout } = await exec(process.execPath, [path.join(root, 'node_modules/convex/bin/main.js'), ...args, '--deployment', c.deployment], {
      cwd: root, windowsHide: true, timeout: 600000, maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, CI: '1', NO_COLOR: '1', FORCE_COLOR: '0' },
    });
    return stdout.trim();
  } catch { throw Error(`Convex ${args[0]} failed; check CLI login, deployment permissions and connectivity (raw output suppressed)`); }
}
export async function snapshot(c) {
  const code = 'JSON.stringify({books: await ctx.db.query("books").collect(), biography: await ctx.db.query("biography").collect(), lessonsPage: await ctx.db.query("lessonsPage").collect()})';
  return JSON.parse(JSON.parse(await cli(c, ['run', '--inline-query', code])));
}
export async function call(c, name, args = {}) { return JSON.parse(await cli(c, ['run', name, JSON.stringify(args)])); }
export async function getBytes(url, options = {}, max = 256 * 1024 * 1024) {
  const r = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(120000) });
  if (!r.ok) throw Error(`Read failed: HTTP ${r.status} from ${new URL(url).hostname}`);
  if (Number(r.headers.get('content-length')) > max) throw Error('Response exceeds configured safety limit');
  const chunks = []; let size = 0;
  for await (const chunk of r.body) { size += chunk.length; if (size > max) { await r.body.cancel().catch(() => {}); throw Error('Response exceeds safety limit'); } chunks.push(chunk); }
  return { bytes: Buffer.concat(chunks), type: r.headers.get('content-type')?.split(';')[0] };
}
export function assetUrl(doc, c) {
  const u = new URL(doc.url);
  if (u.protocol !== 'https:' || u.hostname !== 'cdn.sanity.io' || u.username || u.password || u.search || u.hash || !u.pathname.startsWith(`/${doc._type === 'sanity.imageAsset' ? 'images' : 'files'}/${c.projectId}/${c.dataset}/`)) throw Error(`Untrusted asset URL for ${doc._id}`);
  return u.href;
}
export async function backup(c, directory) {
  await mkdir(directory, { recursive: false });
  const headers = c.token ? { Authorization: `Bearer ${c.token}` } : {};
  const { bytes } = await getBytes(`https://${c.projectId}.api.sanity.io/v${c.apiVersion}/data/export/${c.dataset}`, { headers });
  // A truncated stream, errors, duplicate IDs or cursor pagination must never appear complete.
  const docs = bytes.toString('utf8').split(/\r?\n/).filter(x => x.trim()).map(x => JSON.parse(x));
  const seen = new Set();
  for (const d of docs) { if (!d._id || !d._type || seen.has(d._id)) throw Error('Incomplete or duplicate Sanity export'); seen.add(d._id); }
  await writeFile(path.join(directory, 'sanity.ndjson'), bytes, { flag: 'wx', mode: 0o600 });
  const assets = {}; const assetErrors = [];
  await mkdir(path.join(directory, 'assets'));
  for (const d of docs.filter(d => ['sanity.imageAsset', 'sanity.fileAsset'].includes(d._type))) {
    try {
      // dlRaw requires authentication. Only send the read token to a validated,
      // same-project Sanity CDN URL; never follow redirects with credentials.
      const url = new URL(assetUrl(d, c));
      if (c.token) url.searchParams.set('dlRaw', 'original');
      const { bytes: body, type } = await getBytes(url.href, c.token ? { headers } : {}, 64 * 1024 * 1024);
      if (d._type === 'sanity.imageAsset' && !type?.startsWith('image/')) throw Error('Asset response is not an image');
      const originalVerified = Boolean(d.sha1hash && createHash('sha1').update(body).digest('hex') === d.sha1hash && (d.size === undefined || body.length === d.size));
      if (c.token && !originalVerified) throw Error('Original asset verification failed');
      const hash = sha256(body); const filename = `assets/${hash}.bin`;
      await writeFile(path.join(directory, filename), body, { mode: 0o600 });
      assets[d._id] = { file: filename, sha256: hash, bytes: body.length, mimeType: type || d.mimeType, url: d.url, originalVerified };
    } catch (e) { assetErrors.push({ id: d._id, message: e.message }); }
  }
  await cli(c, ['export', '--include-file-storage', '--path', path.join(directory, 'convex.zip')]);
  const target = await snapshot(c);
  await save(path.join(directory, 'target.json'), target, true);
  const manifest = { version: 1, createdAt: new Date().toISOString(), config: publicConfig(c), sourceVisibility: c.token ? 'token-visible documents' : 'public-only; drafts/private content not backed up', sourceSha256: sha256(bytes), targetSha256: sha256(canonical(target)), convexZipSha256: sha256(await readFile(path.join(directory, 'convex.zip'))), counts: Object.fromEntries(Object.entries(target).map(([k,v]) => [k,v.length])), sourceDocuments: docs.length, assets, assetErrors };
  await save(path.join(directory, 'manifest.json'), manifest, true);
  return manifest;
}
