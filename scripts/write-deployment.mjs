import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Reject a partial catalogue export before publishing.
execFileSync(process.execPath, ['scripts/validate-prepared-catalogue.mjs'], { stdio: 'inherit' });

// Vercel Git builds provide the exact deployed commit. Local CLI builds can use Git.
let revision = process.env.VERCEL_GIT_COMMIT_SHA;
if (!revision) {
  try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
  catch { revision = null; }
}
writeFileSync('dist/deployment.json', JSON.stringify({ revision }) + '\n');
