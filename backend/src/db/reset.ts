import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { getClient } from './client.js';
import { seedFAQs } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

async function resetDatabase() {
  const client = await getClient();
  
  try {
    await client.query('DROP TABLE IF EXISTS questions CASCADE');
    await client.query('DROP TABLE IF EXISTS clusters CASCADE');
    await client.query('DROP TABLE IF EXISTS faqs CASCADE');
    
    const sql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');
    await client.query(sql);
  } finally {
    client.release();
  }
  
  await seedFAQs();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((_error) => {
      process.exit(1);
    });
}

export { resetDatabase };
