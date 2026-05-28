import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { closeDb, db } from './client';

async function main(): Promise<void> {
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('database migrations applied');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
