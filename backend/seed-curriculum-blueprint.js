require('dotenv').config();
const pool = require('./src/config/db');

const CURRICULUM_BLUEPRINT = [
  {
    name: 'English',
    order: 0,
    description: 'Cambridge Primary English language, literacy, reading, writing, and communication framework.',
    strands: [
      {
        name: 'Reading',
        order: 0,
        subStrands: [
          'Word Structure & Phonics',
          'Vocabulary & Language',
          'Grammar & Punctuation',
          'Structure of Texts',
          'Interpretation of Texts',
          'Appreciation & Reflection'
        ]
      },
      {
        name: 'Writing',
        order: 1,
        subStrands: [
          'Word Structure & Spelling',
          'Vocabulary & Language',
          'Grammar & Punctuation',
          'Structure of Texts',
          'Composition & Effect'
        ]
      },
      {
        name: 'Speaking & Listening',
        order: 2,
        subStrands: [
          'Making Yourself Understood',
          'Showing Understanding',
          'Group Work & Discussion',
          'Performance',
          'Reflection & Evaluation'
        ]
      }
    ]
  },
  {
    name: 'Mathematics',
    order: 1,
    description: 'Cambridge Primary Mathematics framework covering numbers, geometry, measurement, and statistics.',
    strands: [
      {
        name: 'Number',
        order: 0,
        subStrands: [
          'Counting & Sequences',
          'Integers & Powers',
          'Place Value, Ordering & Rounding',
          'Fractions, Decimals, Percentages, Ratio & Proportion',
          'Money'
        ]
      },
      {
        name: 'Geometry & Measure',
        order: 1,
        subStrands: [
          'Geometrical Reasoning, Shapes & Measurements',
          'Position & Transformation',
          'Time'
        ]
      },
      {
        name: 'Statistics & Probability',
        order: 2,
        subStrands: [
          'Statistics',
          'Probability'
        ]
      }
    ]
  },
  {
    name: 'Science',
    order: 2,
    description: 'Cambridge Primary Science framework exploring biology, chemistry, physics, and earth & space.',
    strands: [
      {
        name: 'Biology',
        order: 0,
        subStrands: [
          'Structure & Function',
          'Life Processes',
          'Ecosystems'
        ]
      },
      {
        name: 'Chemistry',
        order: 1,
        subStrands: [
          'Materials & Their Structure',
          'Properties of Materials',
          'Changes to Materials'
        ]
      },
      {
        name: 'Physics',
        order: 2,
        subStrands: [
          'Forces & Energy',
          'Light & Sound',
          'Electricity & Magnetism'
        ]
      },
      {
        name: 'Earth & Space',
        order: 3,
        subStrands: [
          'Planet Earth',
          'Cycles on Earth',
          'Earth in Space'
        ]
      }
    ]
  },
  {
    name: 'Global Perspectives',
    order: 3,
    description: 'Cambridge Primary Global Perspectives framework building critical thinking, research, and collaboration skills.',
    strands: [
      {
        name: 'Research',
        order: 0,
        subStrands: []
      },
      {
        name: 'Analysis',
        order: 1,
        subStrands: []
      },
      {
        name: 'Evaluation',
        order: 2,
        subStrands: []
      },
      {
        name: 'Reflection',
        order: 3,
        subStrands: []
      },
      {
        name: 'Collaboration',
        order: 4,
        subStrands: []
      },
      {
        name: 'Communication',
        order: 5,
        subStrands: []
      }
    ]
  }
];

async function replaceCurriculumWithBlueprint() {
  try {
    console.log('[Curriculum Replace] Purging old curriculum structure and applying Clean & Natural Blueprint (Stages 1-5)...');

    // 1. Ensure primary curriculum exists
    let currRes = await pool.query("SELECT id FROM curriculums WHERE LOWER(name) LIKE '%cambridge%' LIMIT 1");
    let curriculumId;
    if (currRes.rows.length === 0) {
      const newCurr = await pool.query(
        "INSERT INTO curriculums (name, description) VALUES ('Cambridge Primary', 'Official Cambridge Primary Curriculum Framework (Stage 1 to Stage 5)') RETURNING id"
      );
      curriculumId = newCurr.rows[0].id;
    } else {
      curriculumId = currRes.rows[0].id;
    }

    // 2. Ensure Stage 6 is deleted
    await pool.query(`
      DELETE FROM public.topics WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE class_id IN (
          SELECT id FROM public.classes WHERE name = 'Stage 6'
        )
      )
    `);
    await pool.query(`
      DELETE FROM public.subjects WHERE class_id IN (
        SELECT id FROM public.classes WHERE name = 'Stage 6'
      )
    `);
    await pool.query("DELETE FROM public.classes WHERE name = 'Stage 6'");
    console.log('Stage 6 purged from database.');

    // 3. Ensure Stages 1 to 5 exist in public.classes
    const stageNames = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
    const classMap = {};

    for (let i = 0; i < stageNames.length; i++) {
      const sName = stageNames[i];
      let clsRes = await pool.query(
        "SELECT id FROM public.classes WHERE curriculum_id = $1 AND name = $2",
        [curriculumId, sName]
      );
      let classId;
      if (clsRes.rows.length === 0) {
        const newCls = await pool.query(
          "INSERT INTO public.classes (curriculum_id, name, description, order_index) VALUES ($1, $2, $3, $4) RETURNING id",
          [curriculumId, sName, `Cambridge Primary ${sName} Framework`, i]
        );
        classId = newCls.rows[0].id;
      } else {
        classId = clsRes.rows[0].id;
      }
      classMap[sName] = classId;
    }

    // 4. Purge existing topics and subjects for Stages 1 to 5
    const stageClassIds = Object.values(classMap);
    console.log('Purging legacy topics & subjects for Stages 1-5...');
    
    await pool.query(
      `DELETE FROM public.topics WHERE subject_id IN (
        SELECT id FROM public.subjects WHERE class_id = ANY($1::uuid[])
      )`,
      [stageClassIds]
    );

    await pool.query(
      `DELETE FROM public.subjects WHERE class_id = ANY($1::uuid[])`,
      [stageClassIds]
    );

    console.log('Clean slate ready. Rebuilding folder hierarchy...');

    // 5. For each Stage (1-5), populate ONLY the exact Clean & Natural Master Folder Blueprint
    for (const [sName, classId] of Object.entries(classMap)) {
      console.log(`Creating fresh blueprint folders for ${sName}...`);

      for (const subjDef of CURRICULUM_BLUEPRINT) {
        // Insert Subject
        const newSubj = await pool.query(
          "INSERT INTO public.subjects (class_id, name, description, order_index) VALUES ($1, $2, $3, $4) RETURNING id",
          [classId, subjDef.name, subjDef.description, subjDef.order]
        );
        const subjectId = newSubj.rows[0].id;

        // Insert Strands (Level 2 Topics)
        for (const strandDef of subjDef.strands) {
          const newStrand = await pool.query(
            "INSERT INTO public.topics (subject_id, parent_topic_id, name, order_index) VALUES ($1, NULL, $2, $3) RETURNING id",
            [subjectId, strandDef.name, strandDef.order]
          );
          const strandId = newStrand.rows[0].id;

          // Insert Sub-strands (Level 3 Topics)
          for (let k = 0; k < strandDef.subStrands.length; k++) {
            const subStrandName = strandDef.subStrands[k];
            await pool.query(
              "INSERT INTO public.topics (subject_id, parent_topic_id, name, order_index) VALUES ($1, $2, $3, $4)",
              [subjectId, strandId, subStrandName, k]
            );
          }
        }
      }
    }

    console.log('\n✅ [Curriculum Replace Complete] All old structures replaced with the Clean & Natural Blueprint for Stages 1 to 5 (Stage 6 removed)!');
  } catch (err) {
    console.error('Error replacing curriculum blueprint:', err);
  } finally {
    process.exit(0);
  }
}

replaceCurriculumWithBlueprint();
