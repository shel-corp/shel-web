import { closeDb, db } from './client';
import { users } from './schema';
import { seededUsers } from '../directory/users';

async function main(): Promise<void> {
  await db.delete(users);
  await db.insert(users).values(seededUsers);
  console.log(`seeded users=${seededUsers.length}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
