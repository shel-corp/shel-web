import { sql } from 'drizzle-orm';
import { closeDb, db } from './client';

async function main(): Promise<void> {
  const result = await db.execute<{ database: string; postgres_version: string }>(sql`
    select current_database() as database, version() as postgres_version
  `);

  const row = result.rows[0];

  if (!row) {
    throw new Error('Postgres health check returned no rows.');
  }

  console.log(`database=${row.database}`);
  console.log(`postgres=${row.postgres_version}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
