import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from './client.js';
import pool from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

async function clearQuestions() {
  try {
    await query('TRUNCATE TABLE questions RESTART IDENTITY CASCADE');
    await query('TRUNCATE TABLE clusters CASCADE');
  } catch (error) {
    throw error;
  } finally {
    await pool.end();
  }
}

clearQuestions();
