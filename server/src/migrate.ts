import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sql } from './db.js';

// Applies every .sql file in ../migrations on startup, in filename order.
// All migrations are written to be idempotent (IF NOT EXISTS / guarded enum
// creation), so re-running them on each boot is a no-op once applied. This keeps
// self-hosted deploys dead simple — no separate migration step to remember.
export async function runMigrations() {
  const here = dirname(fileURLToPath(import.meta.url));
  const migrationsDir = join(here, '..', 'migrations');

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const content = await readFile(join(migrationsDir, file), 'utf8');
    try {
      await sql.unsafe(content).simple();
      console.log(`migration applied: ${file}`);
    } catch (err) {
      console.error(`migration failed: ${file}`);
      throw err;
    }
  }
}
