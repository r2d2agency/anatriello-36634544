import 'dotenv/config';
import { query } from './backend/src/db.js';

async function fix() {
  console.log('Adding CNPJ column to pdvs table...');
  try {
    await query(`ALTER TABLE pdvs ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20)`);
    console.log('Success!');
  } catch (err) {
    console.error('Failed to add column:', err.message);
  } finally {
    process.exit(0);
  }
}

fix();
