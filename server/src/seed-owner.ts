import { eq, isNull } from 'drizzle-orm';
import { db, sql } from './db.js';
import {
  users, recipes, batches, fermentationLogEntries,
  f2VariantBatches, starterLog, botanicalInfusions,
} from './schema.js';
import { runMigrations } from './migrate.js';
import { hashPassword } from './auth.js';

// One-off: create the owner account and adopt all pre-existing (single-user)
// rows into it. Reads credentials from the environment so no password is ever
// committed:
//
//   OWNER_USERNAME=hippotion OWNER_PASSWORD='...' node dist/seed-owner.js
//
// Safe to run more than once — the user is only created if missing and only
// orphaned rows (user_id IS NULL) are backfilled.
async function main() {
  const username = process.env.OWNER_USERNAME;
  const password = process.env.OWNER_PASSWORD;
  if (!username || !password) {
    console.error('Set OWNER_USERNAME and OWNER_PASSWORD environment variables.');
    process.exit(1);
  }

  await runMigrations();

  let [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user) {
    const password_hash = await hashPassword(password);
    [user] = await db.insert(users).values({ username, password_hash, onboarded: true }).returning();
    console.log(`created owner account: ${username}`);
  } else {
    console.log(`owner account already exists: ${username}`);
  }

  const owner = user.id;
  await db.update(recipes).set({ user_id: owner }).where(isNull(recipes.user_id));
  await db.update(batches).set({ user_id: owner }).where(isNull(batches.user_id));
  await db.update(fermentationLogEntries).set({ user_id: owner }).where(isNull(fermentationLogEntries.user_id));
  await db.update(f2VariantBatches).set({ user_id: owner }).where(isNull(f2VariantBatches.user_id));
  await db.update(starterLog).set({ user_id: owner }).where(isNull(starterLog.user_id));
  await db.update(botanicalInfusions).set({ user_id: owner }).where(isNull(botanicalInfusions.user_id));
  console.log('backfilled all existing rows to the owner account.');

  await sql.end();
  console.log('done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
