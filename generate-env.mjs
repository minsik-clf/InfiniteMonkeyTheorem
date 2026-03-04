import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const branch = process.env.WORKERS_CI_BRANCH || '';
const isProduction = branch === 'live';

const lines = [`NEXT_PUBLIC_IS_PRODUCTION=${isProduction ? 'true' : 'false'}`];

const envPath = resolve(process.cwd(), '.env');
writeFileSync(envPath, `${lines.join('\n')}\n`);

console.log(`Generated .env at ${envPath} (branch: ${branch || 'none'})`);
