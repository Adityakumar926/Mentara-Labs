require('dotenv').config();
const { pool } = require('./src/config/db');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

async function seed() {
  console.log('[Seed QB] Creating question_bank table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.question_bank (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      subject TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      question_text TEXT NOT NULL,
      image_url TEXT NULL,
      mark_scheme TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT question_bank_pkey PRIMARY KEY (id)
    );
  `);

  const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS cnt FROM public.question_bank');
  console.log('[Seed QB] Existing rows count in question_bank:', countRows[0].cnt);

  const csvPath = path.join(__dirname, '../dataset/math_questions.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('[Seed QB] CSV file not found at', csvPath);
    return;
  }

  const results = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`[Seed QB] Read ${results.length} rows from CSV`);

  for (const q of results) {
    await pool.query(
      `INSERT INTO public.question_bank (subject, topic, difficulty, question_text, image_url, mark_scheme)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [
        q.subject || 'Mathematics',
        q.topic || 'Numbers',
        q.difficulty || 'Easy',
        q.question_text || '',
        q.image_url || null,
        q.mark_scheme || ''
      ]
    );
  }

  const { rows: finalCount } = await pool.query('SELECT COUNT(*)::int AS cnt FROM public.question_bank');
  console.log('[Seed QB] Final row count in question_bank table:', finalCount[0].cnt);
}

seed().catch(console.error).finally(() => pool.end());
