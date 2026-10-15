import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { root, config, backup } from './io.mjs';
const directory = path.join(root, '.migration-runs', new Date().toISOString().replace(/[:.]/g, '-'));
await mkdir(path.dirname(directory), { recursive: true });
try {
  const m = await backup(await config(), directory);
  console.log(JSON.stringify({ directory, sourceDocuments: m.sourceDocuments, assets: Object.keys(m.assets).length, assetErrors: m.assetErrors, targetCounts: m.counts, sourceVisibility: m.sourceVisibility }, null, 2));
} catch(e) { console.error(e.message); process.exitCode = 1; }
