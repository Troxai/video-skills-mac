// Loads ~/goc-nhin/config/env into process.env (values already set in the environment win).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const f = path.join(os.homedir(), 'goc-nhin', 'config', 'env');
if (fs.existsSync(f)) for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '').replace(/^~(?=\/|$)/, os.homedir());
}
