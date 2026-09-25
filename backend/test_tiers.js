require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  // Test 1: What frontend sends (topic = curriculum topic name)
  const cases = [
    { subject: 'Mathematics', topic: 'Counting & Sequences', difficulty: 'easy' },
    { subject: 'Mathematics', topic: 'Numbers', difficulty: 'easy' },          // exact DB match
    { subject: 'Mathematics', topic: 'Number & Calculation', difficulty: 'easy' }, // keyword "Number"
    { subject: 'Mathematics', topic: 'Fractions, Decimals & Percentages', difficulty: 'mixed' },
  ];

  for (const { subject, topic, difficulty } of cases) {
    const limit = 5;
    const topicKeyword = topic.split(/[\s&,]/)[0].trim();
    let found = false;

    // Tier 1: exact
    const dc1 = difficulty === 'mixed' ? { sql: '', params: [] } : { sql: ` AND LOWER(difficulty) = LOWER($4)`, params: [difficulty] };
    const t1 = await pool.query(
      `SELECT topic, difficulty FROM public.question_bank
       WHERE LOWER(subject)=LOWER($1) AND LOWER(topic)=LOWER($2)
         AND LOWER(difficulty)!='mixed'${dc1.sql} LIMIT $3`,
      [subject, topic, limit, ...dc1.params]
    );
    if (t1.rows.length > 0) { console.log(`[${topic}/${difficulty}] TIER-1 hit: ${t1.rows.length} rows (${t1.rows[0].topic}/${t1.rows[0].difficulty})`); found = true; }

    // Tier 2: keyword
    if (!found) {
      const dc2 = difficulty === 'mixed' ? { sql: '', params: [] } : { sql: ` AND LOWER(difficulty) = LOWER($4)`, params: [difficulty] };
      const t2 = await pool.query(
        `SELECT topic, difficulty FROM public.question_bank
         WHERE LOWER(subject)=LOWER($1)
           AND (LOWER(topic) ILIKE $2 OR LOWER($3) ILIKE '%' || LOWER(topic) || '%')
           AND LOWER(difficulty)!='mixed'${dc2.sql} LIMIT $4`,
        [subject, `%${topicKeyword}%`, topic, limit, ...dc2.params]
      );
      if (t2.rows.length > 0) { console.log(`[${topic}/${difficulty}] TIER-2 hit: ${t2.rows.length} rows (${t2.rows[0].topic}/${t2.rows[0].difficulty})`); found = true; }
    }

    // Tier 3: subject only
    if (!found) {
      const dc3 = difficulty === 'mixed' ? { sql: '', params: [] } : { sql: ` AND LOWER(difficulty) = LOWER($2)`, params: [difficulty] };
      const t3 = await pool.query(
        `SELECT topic, difficulty FROM public.question_bank
         WHERE LOWER(subject)=LOWER($1)
           AND LOWER(difficulty)!='mixed'${dc3.sql} LIMIT $${difficulty === 'mixed' ? 2 : 3}`,
        [subject, ...dc3.params, limit]
      );
      if (t3.rows.length > 0) { console.log(`[${topic}/${difficulty}] TIER-3 hit: ${t3.rows.length} rows (${t3.rows[0].topic}/${t3.rows[0].difficulty})`); found = true; }
    }

    if (!found) console.log(`[${topic}/${difficulty}] NO MATCH`);
  }

  pool.end();
}

test().catch(e => { console.error(e.message); pool.end(); });

