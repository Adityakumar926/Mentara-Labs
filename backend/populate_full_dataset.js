const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/db');

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const questions = [];

function addQ(stage, subject, strand, subtopic, difficulty, qType, mainInstruction, subParts, options, answer, marks, explanation, imageUrl = null) {
  questions.push({
    stage,
    subject,
    strand,
    topic: strand,
    subtopic,
    difficulty: difficulty.toLowerCase(),
    question_type: qType,
    question_text: mainInstruction,
    sub_parts: subParts,
    options: options || [],
    correct_answer: answer,
    marks: marks,
    image_url: imageUrl || null,
    explanation
  });
}

// ==============================================================================
// STAGE 1 (GRADE 1 / PRIMARY 1)
// ==============================================================================

// --- MATHEMATICS (Stage 1) ---
addQ(
  'Stage 1', 'Mathematics', 'Counting & Sequences', 'Counting to 20', 'Easy', 'short_answer',
  'Count the objects carefully and write the numbers.',
  [
    { label: '(a)', text: 'Count the items in the collection: ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐ ⭐', marks: 1 },
    { label: '(b)', text: 'Which number comes immediately after 15 when counting forwards?', marks: 1 },
    { label: '(c)', text: 'Which number comes immediately before 10 when counting backwards?', marks: 1 }
  ],
  null, '8; 16; 9', 3,
  '(a) There are 8 stars. (b) Counting forward by 1 from 15 gives 16. (c) Counting back from 10 gives 9.'
);

addQ(
  'Stage 1', 'Mathematics', 'Counting & Sequences', 'Skip Counting in 2s and 10s', 'Easy', 'short_answer',
  'Complete the skip counting sequences.',
  [
    { label: '(a)', text: 'Count up in 2s: 2, 4, 6, [ ___ ], 10, [ ___ ]', marks: 2 },
    { label: '(b)', text: 'Count up in 10s: 10, 20, 30, [ ___ ], 50', marks: 1 }
  ],
  null, '8, 12; 40', 3,
  '(a) Adding 2 each time gives 8 and 12. (b) Adding 10 each time gives 40.'
);

addQ(
  'Stage 1', 'Mathematics', 'Number & Calculation', 'Number Bonds to 10 and 20', 'Easy', 'short_answer',
  'Find the missing numbers to make the number pairs.',
  [
    { label: '(a)', text: 'Find the number that adds to 7 to make 10: 7 + [ ___ ] = 10', marks: 1 },
    { label: '(b)', text: 'Find the number that adds to 14 to make 20: 14 + [ ___ ] = 20', marks: 1 },
    { label: '(c)', text: 'What is double 6?', marks: 1 }
  ],
  null, '3; 6; 12', 3,
  '(a) 10 - 7 = 3. (b) 20 - 14 = 6. (c) 6 + 6 = 12.'
);

addQ(
  'Stage 1', 'Mathematics', 'Number & Calculation', 'Basic Addition & Subtraction', 'Easy', 'short_answer',
  'Solve the practical arithmetic calculations.',
  [
    { label: '(a)', text: 'There are 9 red apples and 5 green apples in a bowl. How many apples are there altogether?', marks: 1 },
    { label: '(b)', text: 'A farmer has 15 sheep. 4 sheep walk into the barn. How many sheep are left outside?', marks: 1 }
  ],
  null, '14 apples; 11 sheep', 2,
  '(a) 9 + 5 = 14 apples. (b) 15 - 4 = 11 sheep.'
);

addQ(
  'Stage 1', 'Mathematics', 'Fractions, Decimals & Percentages', 'Halves & Equal Parts', 'Easy', 'short_answer',
  'Examine halves and equal sharing.',
  [
    { label: '(a)', text: 'Share 10 biscuits equally between 2 children. How many biscuits does each child receive?', marks: 1 },
    { label: '(b)', text: 'If a chocolate bar is cut into 2 equal pieces, what fraction is one piece called?', marks: 1 }
  ],
  null, '5 biscuits; One half (1/2)', 2,
  '(a) 10 / 2 = 5 biscuits. (b) One of two equal parts is one half (1/2).'
);

addQ(
  'Stage 1', 'Mathematics', 'Geometry & Shapes', '2D & 3D Shapes', 'Easy', 'short_answer',
  'Identify the geometric shapes from their descriptions.',
  [
    { label: '(a)', text: 'Name the flat 2D shape that has 3 straight sides and 3 corners.', marks: 1 },
    { label: '(b)', text: 'Name the solid 3D shape that looks like a round ball.', marks: 1 },
    { label: '(c)', text: 'How many sides does a square have?', marks: 1 }
  ],
  null, 'Triangle; Sphere; 4', 3,
  '(a) A triangle has 3 straight sides. (b) A sphere is a round 3D solid. (c) A square has 4 equal sides.'
);

addQ(
  'Stage 1', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Length & Mass Comparison', 'Easy', 'short_answer',
  'Answer the questions about comparing measurements.',
  [
    { label: '(a)', text: 'Which is heavier: a feather or a brick?', marks: 1 },
    { label: '(b)', text: 'Which pencil is longer: a 12 cm pencil or a 7 cm pencil?', marks: 1 },
    { label: '(c)', text: 'Which holds more water: a teaspoon or a bucket?', marks: 1 }
  ],
  null, 'A brick; 12 cm pencil; A bucket', 3,
  '(a) A brick has much more mass than a feather. (b) 12 cm is greater than 7 cm. (c) A bucket has greater capacity.'
);

addQ(
  'Stage 1', 'Mathematics', 'Time & Money', 'Telling Time and Coins', 'Easy', 'short_answer',
  'Work out the time and coin calculations.',
  [
    { label: '(a)', text: 'The clock hour hand points to 4 and the minute hand points to 12. What time is it?', marks: 1 },
    { label: '(b)', text: 'How many days are in one complete week?', marks: 1 },
    { label: '(c)', text: 'You have a 5p coin and a 2p coin. What is the total value?', marks: 1 }
  ],
  null, '4 o\'clock; 7 days; 7p', 3,
  '(a) Hour hand on 4 and minute on 12 indicates 4 o\'clock. (b) 7 days in a week. (c) 5 + 2 = 7p.'
);

addQ(
  'Stage 1', 'Mathematics', 'Statistics & Data Handling', 'Tally & Pictograms', 'Easy', 'short_answer',
  'Look at the class fruit survey: Apple 🍎 🍎 🍎 🍎, Banana 🍌 🍌, Orange 🍊 🍊 🍊.',
  [
    { label: '(a)', text: 'How many students chose Apple as their favourite fruit?', marks: 1 },
    { label: '(b)', text: 'Which fruit received the fewest votes?', marks: 1 },
    { label: '(c)', text: 'How many total fruits are in the chart?', marks: 1 }
  ],
  null, '4; Banana; 9', 3,
  '(a) 4 apples are shown. (b) Banana has 2 (fewest). (c) 4 + 2 + 3 = 9 total.'
);

// --- SCIENCE (Stage 1) ---
addQ(
  'Stage 1', 'Science', 'Biology & Living Things', 'Human Senses & Body Parts', 'Easy', 'short_answer',
  'Investigate human senses and body parts.',
  [
    { label: '(a)', text: 'Which sense organ do humans use to listen to music and sounds?', marks: 1 },
    { label: '(b)', text: 'Which sense organ allows you to see different colours and shapes?', marks: 1 },
    { label: '(c)', text: 'Name the sense organ located on your tongue used to taste sweet fruits.', marks: 1 }
  ],
  null, 'Ears; Eyes; Taste buds (Tongue)', 3,
  '(a) Ears detect sound vibrations. (b) Eyes sense light and colour. (c) The tongue contains taste buds.'
);

addQ(
  'Stage 1', 'Science', 'Plants & Ecosystems', 'Basic Plant Structures', 'Easy', 'short_answer',
  'Examine living organisms and basic plant structures.',
  [
    { label: '(a)', text: 'Name two things a green plant needs in order to grow healthy and strong.', marks: 1 },
    { label: '(b)', text: 'Which part of a plant grows underground to absorb water from the soil?', marks: 1 },
    { label: '(c)', text: 'State one way you can tell a pet dog is a living thing while a toy plastic dog is non-living.', marks: 1 }
  ],
  null, 'Water and sunlight; Roots; A real dog breathes/grows/eats', 3,
  '(a) Plants need water, light, air, and soil. (b) Roots anchor the plant and absorb water. (c) Living things grow, respire, and require food.'
);

addQ(
  'Stage 1', 'Science', 'States of Matter', 'Materials & Properties', 'Easy', 'short_answer',
  'Classify everyday objects by the materials they are made from.',
  [
    { label: '(a)', text: 'Why is clear glass chosen as the material to make window panes?', marks: 1 },
    { label: '(b)', text: 'Name a suitable waterproof material used to make raincoats and wellington boots.', marks: 1 },
    { label: '(c)', text: 'Is a metal spoon hard or soft?', marks: 1 }
  ],
  null, 'Because glass is transparent/see-through; Rubber / Plastic; Hard', 3,
  '(a) Glass is transparent so light can enter. (b) Rubber/plastic is waterproof. (c) Metals are hard solids.'
);

addQ(
  'Stage 1', 'Science', 'Earth & Space', 'Weather & Seasons', 'Easy', 'short_answer',
  'Answer the questions about seasons and weather patterns.',
  [
    { label: '(a)', text: 'Name the coldest season of the year when snow may fall in many countries.', marks: 1 },
    { label: '(b)', text: 'In which season do flowers begin to bloom and young animals are born?', marks: 1 },
    { label: '(c)', text: 'What weather instrument or tool do we use to keep dry when it rains outside?', marks: 1 }
  ],
  null, 'Winter; Spring; Umbrella / Raincoat', 3,
  '(a) Winter is the coldest season. (b) Spring is the season of new plant growth. (c) An umbrella or raincoat keeps us dry.'
);

addQ(
  'Stage 1', 'Science', 'Forces, Magnets & Motion', 'Pushes and Pulls', 'Easy', 'short_answer',
  'Identify the types of forces acting on objects.',
  [
    { label: '(a)', text: 'Do you push or pull a heavy door to open it towards you?', marks: 1 },
    { label: '(b)', text: 'What force do you apply with your foot when kicking a football across the playground?', marks: 1 }
  ],
  null, 'Pull; Push', 2,
  '(a) Moving an object towards yourself is a pull. (b) Kicking applies a forward push force.'
);

addQ(
  'Stage 1', 'Science', 'Light & Shadows', 'Light Sources', 'Easy', 'short_answer',
  'Answer the questions about sources of light.',
  [
    { label: '(a)', text: 'Name the giant star that provides natural light to the Earth during the day.', marks: 1 },
    { label: '(b)', text: 'Name one artificial light source used inside a dark bedroom at night.', marks: 1 }
  ],
  null, 'The Sun; Lamp / Torch / Lightbulb', 2,
  '(a) The Sun is our natural light source. (b) Lamps and torches are artificial light sources.'
);

// --- ENGLISH (Stage 1) ---
addQ(
  'Stage 1', 'English', 'Grammar & Sentence Structure', 'Nouns & Verbs', 'Easy', 'short_answer',
  'Identify words in the sentence: "The happy boy jumped over the puddle."',
  [
    { label: '(a)', text: 'Write down one naming word (noun) from the sentence.', marks: 1 },
    { label: '(b)', text: 'Write down the action word (verb) showing what the boy did.', marks: 1 },
    { label: '(c)', text: 'Which word is an adjective describing how the boy felt?', marks: 1 }
  ],
  null, 'Boy (or Puddle); Jumped; Happy', 3,
  '(a) Boy and puddle are nouns. (b) Jumped is the action verb. (c) Happy describes the noun boy.'
);

addQ(
  'Stage 1', 'English', 'Punctuation', 'Capitals and Full Stops', 'Easy', 'short_answer',
  'Correct the sentence so that it uses proper punctuation: "sam went to the park on sunday"',
  [
    { label: '(a)', text: 'Which two words in the sentence require capital letters?', marks: 2 },
    { label: '(b)', text: 'What punctuation mark must be placed at the very end of the sentence?', marks: 1 }
  ],
  null, 'Sam and Sunday; Full stop (.)', 3,
  '(a) Sam is the start of sentence and proper noun; Sunday is a day of the week. (b) Statements end with a full stop.'
);

addQ(
  'Stage 1', 'English', 'Vocabulary & Spelling', 'Opposites & Word Pairs', 'Easy', 'short_answer',
  'Solve the word puzzles.',
  [
    { label: '(a)', text: 'Write the opposite (antonym) of the word: hot.', marks: 1 },
    { label: '(b)', text: 'Write the opposite (antonym) of the word: big.', marks: 1 },
    { label: '(c)', text: 'Write the opposite (antonym) of the word: happy.', marks: 1 }
  ],
  null, 'Cold; Small / Little; Sad', 3,
  '(a) Opposite of hot is cold. (b) Opposite of big is small. (c) Opposite of happy is sad.'
);

addQ(
  'Stage 1', 'English', 'Creative Writing & Phonics', 'Phonics Sounds & Rhyme', 'Easy', 'short_answer',
  'Work with phonics and rhyming words.',
  [
    { label: '(a)', text: 'What is the initial sound letter in the word "Sun"?', marks: 1 },
    { label: '(b)', text: 'Write two words that rhyme with "cat".', marks: 2 }
  ],
  null, 'S; Bat, Hat (or Mat, Rat)', 3,
  '(a) Sun starts with S. (b) Bat and hat rhyme with cat.'
);

addQ(
  'Stage 1', 'English', 'Reading & Comprehension', 'Short Story Comprehension', 'Easy', 'short_answer',
  'Read the short passage: "Mina has a little brown rabbit named Binky. Binky loves eating crunchy orange carrots in the garden."',
  [
    { label: '(a)', text: 'What type of animal is Binky?', marks: 1 },
    { label: '(b)', text: 'What colour is Binky the rabbit?', marks: 1 },
    { label: '(c)', text: 'What is Binky\'s favourite food mentioned in the text?', marks: 1 }
  ],
  null, 'A rabbit; Brown; Carrots', 3,
  '(a) Binky is a rabbit. (b) Binky is brown. (c) Binky loves crunchy carrots.'
);


// ==============================================================================
// STAGE 2 (GRADE 2 / PRIMARY 2)
// ==============================================================================

// --- MATHEMATICS (Stage 2) ---
addQ(
  'Stage 2', 'Mathematics', 'Counting & Sequences', 'Place Value & Ordering', 'Easy', 'short_answer',
  'Examine the numbers: 47, 82, 19, 65.',
  [
    { label: '(a)', text: 'Write the value of the digit 8 in the number 82.', marks: 1 },
    { label: '(b)', text: 'Order the four numbers from smallest to largest.', marks: 1 },
    { label: '(c)', text: 'Is 47 an odd number or an even number?', marks: 1 }
  ],
  null, '80 (8 tens); 19, 47, 65, 82; Odd', 3,
  '(a) The 8 is in the tens place so value is 80. (b) Smallest to largest: 19, 47, 65, 82. (c) Numbers ending in 7 are odd.'
);

addQ(
  'Stage 2', 'Mathematics', 'Number & Calculation', 'Addition & Subtraction within 100', 'Easy', 'short_answer',
  'Solve the 2-digit arithmetic problems.',
  [
    { label: '(a)', text: 'Calculate: 38 + 27 = [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Calculate: 74 - 29 = [ ___ ]', marks: 1 },
    { label: '(c)', text: 'Round 68 to the nearest ten.', marks: 1 }
  ],
  null, '65; 45; 70', 3,
  '(a) 38 + 27 = 65. (b) 74 - 29 = 45. (c) Since the ones digit is 8 (>=5), 68 rounds up to 70.'
);

addQ(
  'Stage 2', 'Mathematics', 'Number & Calculation', 'Multiplication & Division Tables', 'Easy', 'short_answer',
  'Work out the times table and sharing questions.',
  [
    { label: '(a)', text: 'What is 5 x 6?', marks: 1 },
    { label: '(b)', text: 'What is 20 divided by 2?', marks: 1 },
    { label: '(c)', text: 'A baker packs 30 biscuits into bags of 5. How many bags can the baker fill completely?', marks: 1 }
  ],
  null, '30; 10; 6 bags', 3,
  '(a) 5 x 6 = 30. (b) 20 / 2 = 10. (c) 30 / 5 = 6 bags.'
);

addQ(
  'Stage 2', 'Mathematics', 'Fractions, Decimals & Percentages', 'Fractions of Shapes & Amounts', 'Easy', 'short_answer',
  'Work out the simple fractions.',
  [
    { label: '(a)', text: 'What is 1/2 of 18 counters?', marks: 1 },
    { label: '(b)', text: 'What is 1/4 of 24 stickers?', marks: 1 },
    { label: '(c)', text: 'A pizza is divided into 4 equal slices. Tariq eats 3 slices. What fraction of the pizza has Tariq eaten?', marks: 1 }
  ],
  null, '9; 6; 3/4', 3,
  '(a) 18 / 2 = 9. (b) 24 / 4 = 6. (c) Tariq ate 3 out of 4 parts: 3/4.',
  'https://res.cloudinary.com/u6maukag/image/upload/v1790259644/ChatGPT_Image_Sep_24_2026_07_50_14_PM.png'
);

addQ(
  'Stage 2', 'Mathematics', 'Geometry & Shapes', '2D Polygons & Symmetry', 'Easy', 'short_answer',
  'Examine the properties of geometric figures.',
  [
    { label: '(a)', text: 'Name the 2D polygon with 6 straight sides and 6 vertices.', marks: 1 },
    { label: '(b)', text: 'How many lines of symmetry does a regular rectangle have?', marks: 1 },
    { label: '(c)', text: 'How many right angles (square corners) are inside a square?', marks: 1 }
  ],
  null, 'Hexagon; 2; 4', 3,
  '(a) A 6-sided polygon is a Hexagon. (b) A rectangle has 2 lines of reflection symmetry. (c) A square contains 4 right angles.'
);

addQ(
  'Stage 2', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Length, Mass and Money', 'Easy', 'short_answer',
  'Solve the practical measurement questions.',
  [
    { label: '(a)', text: 'How many centimeters (cm) are in 1 meter (m)?', marks: 1 },
    { label: '(b)', text: 'A juice bottle holds 500 ml. You pour out 150 ml. How much juice is left in the bottle?', marks: 1 },
    { label: '(c)', text: 'Maya buys a comic for $3.20 and a pen for $1.50. She pays with a $10 note. Calculate her change.', marks: 2 }
  ],
  null, '100 cm; 350 ml; $5.30', 4,
  '(a) 1 m = 100 cm. (b) 500 - 150 = 350 ml. (c) Total cost = $4.70. Change = $10.00 - $4.70 = $5.30.'
);

addQ(
  'Stage 2', 'Mathematics', 'Time & Money', 'Telling Time to Quarter Hour', 'Easy', 'short_answer',
  'Answer the questions about time.',
  [
    { label: '(a)', text: 'How many minutes are in one full hour?', marks: 1 },
    { label: '(b)', text: 'If the minute hand points to 3 and the hour hand is just past 8, what time is it?', marks: 1 }
  ],
  null, '60 minutes; Quarter past 8 (8:15)', 2,
  '(a) 1 hour = 60 minutes. (b) 3 on the clock face represents 15 minutes past the hour (quarter past).'
);

addQ(
  'Stage 2', 'Mathematics', 'Statistics & Data Handling', 'Carroll & Venn Diagrams', 'Easy', 'short_answer',
  'Look at the Carroll diagram sorting numbers: Even vs Odd, and Greater than 20 vs 20 or less.',
  [
    { label: '(a)', text: 'In which section does the number 24 belong: "Even and Greater than 20" or "Odd and Greater than 20"?', marks: 1 },
    { label: '(b)', text: 'Is 15 placed in the "Odd and 20 or less" box?', marks: 1 }
  ],
  null, 'Even and Greater than 20; Yes', 2,
  '(a) 24 is even and 24 > 20. (b) 15 is odd and 15 < 20, so yes.'
);

// --- SCIENCE (Stage 2) ---
addQ(
  'Stage 2', 'Science', 'Biology & Living Things', 'Animal Habitats and Adaptations', 'Easy', 'short_answer',
  'Investigate how animals live and thrive in their environments.',
  [
    { label: '(a)', text: 'Name the hot, dry habitat where a camel has adaptations like humps to store energy.', marks: 1 },
    { label: '(b)', text: 'Is a lion classified as a carnivore, an herbivore, or an omnivore?', marks: 1 },
    { label: '(c)', text: 'Name one adaptation that helps polar bears stay warm in freezing arctic temperatures.', marks: 1 }
  ],
  null, 'Desert; Carnivore; Thick fur / Layer of blubber (fat)', 3,
  '(a) Camels thrive in desert habitats. (b) Lions eat meat exclusively (carnivores). (c) Thick dense fur and blubber trap body heat.'
);

addQ(
  'Stage 2', 'Science', 'States of Matter', 'Melting and Freezing of Water', 'Easy', 'short_answer',
  'Examine the properties of water and changes of state.',
  [
    { label: '(a)', text: 'What state of matter is solid ice cubes?', marks: 1 },
    { label: '(b)', text: 'What happens to chocolate when thermal heat energy is added to it on a hot stove?', marks: 1 },
    { label: '(c)', text: 'What process turns liquid water into solid ice inside a freezer?', marks: 1 }
  ],
  null, 'Solid; It melts into a liquid; Freezing', 3,
  '(a) Ice is the solid state of water. (b) Heating causes chocolate to melt. (c) Freezing solidifies liquid water.'
);

addQ(
  'Stage 2', 'Science', 'Light & Shadows', 'Light Sources and Darkness', 'Easy', 'short_answer',
  'Answer the questions about light and shadow formation.',
  [
    { label: '(a)', text: 'Which is our main natural source of light on Earth during daytime?', marks: 1 },
    { label: '(b)', text: 'Is the Moon a light source or does it reflect light from the Sun?', marks: 1 },
    { label: '(c)', text: 'Explain why darkness is described as the absence of light.', marks: 1 }
  ],
  null, 'The Sun; It reflects light from the Sun; Because darkness occurs when there is no light source', 3,
  '(a) The Sun is Earth\'s primary light source. (b) The Moon does not produce light; it reflects sunlight. (c) Darkness is the absence of light.'
);

addQ(
  'Stage 2', 'Science', 'Forces, Magnets & Motion', 'Friction and Movement', 'Easy', 'short_answer',
  'Investigate motion and surface friction.',
  [
    { label: '(a)', text: 'Will a toy car travel farther across a smooth wooden floor or a thick shaggy carpet?', marks: 1 },
    { label: '(b)', text: 'Explain your reason in terms of the friction force produced by the surface.', marks: 1 }
  ],
  null, 'Smooth wooden floor; Smooth floors create less friction to slow the car down', 2,
  '(a) Smooth floor. (b) Carpet creates higher friction against the wheels, slowing the car down quickly.'
);

addQ(
  'Stage 2', 'Science', 'Plants & Ecosystems', 'Plant Growth & Seeds', 'Easy', 'short_answer',
  'Answer questions about plant growth and seeds.',
  [
    { label: '(a)', text: 'What term describes the process when a seed begins to sprout and grow?', marks: 1 },
    { label: '(b)', text: 'Name two conditions necessary for seeds to germinate.', marks: 2 }
  ],
  null, 'Germination; Water and Warmth (suitable temperature)', 3,
  '(a) Sprouting is germination. (b) Seeds need water, oxygen, and appropriate warmth to germinate.'
);

// --- ENGLISH (Stage 2) ---
addQ(
  'Stage 2', 'English', 'Grammar & Sentence Structure', 'Adjectives & Past Tense Verbs', 'Easy', 'short_answer',
  'Read the sentence: "Yesterday, the brave firefighter climbed the tall ladder carefully."',
  [
    { label: '(a)', text: 'Identify the past tense verb ending in -ed.', marks: 1 },
    { label: '(b)', text: 'Identify two descriptive adjectives in the sentence.', marks: 2 },
    { label: '(c)', text: 'Which word is an adverb explaining how the firefighter climbed?', marks: 1 }
  ],
  null, 'Climbed; Brave and Tall; Carefully', 4,
  '(a) Climbed is the regular past tense verb. (b) Brave (describes firefighter) and Tall (describes ladder). (c) Carefully is the adverb of manner.'
);

addQ(
  'Stage 2', 'English', 'Punctuation', 'Questions and Exclamations', 'Easy', 'short_answer',
  'Add the correct ending punctuation mark (? or !) to each sentence.',
  [
    { label: '(a)', text: 'Where did you put the storybook [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Look out, the tree branch is falling [ ___ ]', marks: 1 }
  ],
  null, 'Question mark (?); Exclamation mark (!)', 2,
  '(a) "Where..." asks a question (?). (b) A warning or urgent cry takes an exclamation mark (!).'
);

addQ(
  'Stage 2', 'English', 'Vocabulary & Spelling', 'Compound Words & Prefixes', 'Easy', 'short_answer',
  'Work with word building and prefixes.',
  [
    { label: '(a)', text: 'Combine two smaller words to form a compound word: rain + bow = [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Add the prefix "un-" to the word "happy" to make its opposite.', marks: 1 },
    { label: '(c)', text: 'Arrange these words in alphabetical order: Zebra, Apple, Monkey, Dog.', marks: 1 }
  ],
  null, 'Rainbow; Unhappy; Apple, Dog, Monkey, Zebra', 3,
  '(a) Rain + bow = Rainbow. (b) Un + happy = Unhappy. (c) Alphabetical order: A, D, M, Z.'
);

addQ(
  'Stage 2', 'English', 'Reading & Comprehension', 'Fact vs Fiction', 'Easy', 'short_answer',
  'Read the sentences: (1) "Lions are wild cats that live in prides." (2) "The magic flying carpet soared over mountains."',
  [
    { label: '(a)', text: 'Which sentence states a real scientific fact?', marks: 1 },
    { label: '(b)', text: 'Which sentence is an imaginary fictional story event?', marks: 1 }
  ],
  null, 'Sentence (1); Sentence (2)', 2,
  '(a) Sentence 1 is factual. (b) Sentence 2 is fictional/magical.'
);


// ==============================================================================
// STAGE 3 (GRADE 3 / PRIMARY 3)
// ==============================================================================

// --- MATHEMATICS (Stage 3) ---
addQ(
  'Stage 3', 'Mathematics', 'Number & Calculation', '3-Digit Place Value & Addition', 'Medium', 'short_answer',
  'Work with 3-digit numbers.',
  [
    { label: '(a)', text: 'What is 456 + 378?', marks: 1 },
    { label: '(b)', text: 'Round 746 to the nearest hundred.', marks: 1 },
    { label: '(c)', text: 'In the number 3,742, what is the place value of digit 7?', marks: 1 }
  ],
  null, '834; 700; 700 (Hundreds)', 3,
  '(a) 456 + 378 = 834. (b) In 746 the tens digit is 4 (<5) so it rounds to 700. (c) 7 is in the hundreds column (700).'
);

addQ(
  'Stage 3', 'Mathematics', 'Number & Calculation', 'Multiplication & Factors', 'Medium', 'short_answer',
  'Answer the questions about factors and multiplication facts.',
  [
    { label: '(a)', text: 'List all six factors of the number 18.', marks: 1 },
    { label: '(b)', text: 'Calculate: 14 x 6 = [ ___ ]', marks: 1 },
    { label: '(c)', text: 'Which of these numbers is a prime number: 9, 15, 17, 21?', marks: 1 }
  ],
  null, '1, 2, 3, 6, 9, 18; 84; 17', 3,
  '(a) Factors of 18 are 1, 2, 3, 6, 9, 18. (b) 14 x 6 = 84. (c) 17 is prime because its only factors are 1 and 17.'
);

addQ(
  'Stage 3', 'Mathematics', 'Number & Calculation', 'Negative Numbers on Number Lines', 'Medium', 'short_answer',
  'Work out the temperatures and negative values.',
  [
    { label: '(a)', text: 'Look at the number line. What value lies 4 units to the left of 0?', marks: 1 },
    { label: '(b)', text: 'The thermometer reads -6°C. The temperature drops by 5 degrees. What is the new temperature?', marks: 1 }
  ],
  null, '-4; -11°C', 2,
  '(a) 4 units left of zero is -4. (b) -6 - 5 = -11°C.',
  'https://res.cloudinary.com/u6maukag/image/upload/v1790259479/ChatGPT_Image_Sep_24_2026_07_46_30_PM.png'
);

addQ(
  'Stage 3', 'Mathematics', 'Fractions, Decimals & Percentages', 'Equivalent Fractions & Operations', 'Medium', 'short_answer',
  'Solve the fraction questions.',
  [
    { label: '(a)', text: 'Calculate: 2/7 + 3/7 = [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Write an equivalent fraction to 1/3 with a denominator of 12.', marks: 1 },
    { label: '(c)', text: 'Which is larger: 3/5 or 2/5?', marks: 1 }
  ],
  null, '5/7; 4/12; 3/5', 3,
  '(a) 2/7 + 3/7 = 5/7. (b) Multiply numerator and denominator by 4: 1/3 = 4/12. (c) 3/5 is larger than 2/5.'
);

addQ(
  'Stage 3', 'Mathematics', 'Geometry & Shapes', 'Angles & Polygon Properties', 'Medium', 'short_answer',
  'Investigate 2D shapes and angles.',
  [
    { label: '(a)', text: 'Name the 2D polygon that has 5 straight sides and 5 vertices.', marks: 1 },
    { label: '(b)', text: 'Is an angle measuring 45 degrees classified as acute, right, or obtuse?', marks: 1 },
    { label: '(c)', text: 'How many lines of symmetry does a regular pentagon have?', marks: 1 }
  ],
  null, 'Pentagon; Acute; 5', 3,
  '(a) A 5-sided polygon is a Pentagon. (b) Angles less than 90° are acute. (c) A regular pentagon has 5 lines of symmetry.'
);

addQ(
  'Stage 3', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Perimeter & Time', 'Medium', 'short_answer',
  'Solve the perimeter and time calculations.',
  [
    { label: '(a)', text: 'A rectangle has a length of 8 cm and a width of 5 cm. Calculate its perimeter.', marks: 2 },
    { label: '(b)', text: 'A film begins at 2:15 PM and lasts for 1 hour and 45 minutes. What time does it finish?', marks: 1 }
  ],
  null, '26 cm; 4:00 PM', 3,
  '(a) Perimeter = 2 x (8 + 5) = 2 x 13 = 26 cm. (b) 2:15 PM + 1 hr 45 min = 4:00 PM.'
);

addQ(
  'Stage 3', 'Mathematics', 'Statistics & Data Handling', 'Scaled Bar Charts', 'Medium', 'short_answer',
  'Look at a bar chart where each grid line represents 5 books read.',
  [
    { label: '(a)', text: 'If Class 3\'s bar reaches the 6th grid line, how many books were read?', marks: 1 },
    { label: '(b)', text: 'Class 4 read 45 books. How many grid intervals high will their bar be?', marks: 1 }
  ],
  null, '30 books; 9 grid intervals', 2,
  '(a) 6 x 5 = 30 books. (b) 45 / 5 = 9 intervals.'
);

// --- SCIENCE (Stage 3) ---
addQ(
  'Stage 3', 'Science', 'Biology & Living Things', 'Human Skeletons & Muscles', 'Medium', 'short_answer',
  'Examine the human skeleton and movement.',
  [
    { label: '(a)', text: 'Which bony structure protects the human brain from injury?', marks: 1 },
    { label: '(b)', text: 'Which bones form a protective cage around the heart and lungs?', marks: 1 },
    { label: '(c)', text: 'Explain how muscles work in antagonistic pairs to bend and straighten your arm.', marks: 1 }
  ],
  null, 'The Skull (Cranium); Rib cage; When one muscle contracts/shortens, the partner muscle relaxes/lengthens', 3,
  '(a) The skull protects the brain. (b) The ribcage shields heart and lungs. (c) Muscles only pull; one contracts while the opposite relaxes.'
);

addQ(
  'Stage 3', 'Science', 'States of Matter', 'Solids, Liquids and Gases', 'Medium', 'short_answer',
  'Compare the three states of matter.',
  [
    { label: '(a)', text: 'At what temperature does liquid water boil into steam gas at sea level?', marks: 1 },
    { label: '(b)', text: 'What phase change occurs when water vapour in air cools on a bathroom mirror?', marks: 1 },
    { label: '(c)', text: 'Why can gases be compressed easily into containers while solids cannot?', marks: 1 }
  ],
  null, '100°C; Condensation; Gas particles have large empty spaces between them', 3,
  '(a) Boiling point of water is 100°C. (b) Condensation turns gas into liquid droplets. (c) Gas particles are spaced far apart.'
);

addQ(
  'Stage 3', 'Science', 'Forces, Magnets & Motion', 'Magnetic Poles and Materials', 'Medium', 'short_answer',
  'Investigate magnets and magnetic forces.',
  [
    { label: '(a)', text: 'Name the two opposite magnetic poles found on every bar magnet.', marks: 1 },
    { label: '(b)', text: 'What happens when two South poles of bar magnets are pushed together?', marks: 1 },
    { label: '(c)', text: 'Name two metals attracted to a permanent magnet.', marks: 1 }
  ],
  null, 'North and South; They repel (push away); Iron and Steel', 3,
  '(a) North and South poles. (b) Like poles repel. (c) Iron, nickel, steel, cobalt are magnetic metals.'
);

addQ(
  'Stage 3', 'Science', 'Light & Shadows', 'Shadow Formation & Mirrors', 'Medium', 'short_answer',
  'Investigate reflection and shadow formation.',
  [
    { label: '(a)', text: 'What smooth, shiny object reflects light evenly so you can see your clear reflection?', marks: 1 },
    { label: '(b)', text: 'Do shadows form in front of or behind an opaque object blocking a light source?', marks: 1 }
  ],
  null, 'Plane Mirror; Behind the object (opposite the light source)', 2,
  '(a) A mirror reflects light regularly. (b) Shadows appear on the side opposite the light source.'
);

// --- ENGLISH (Stage 3) ---
addQ(
  'Stage 3', 'English', 'Grammar & Sentence Structure', 'Adverbs & Prepositions', 'Medium', 'short_answer',
  'Analyze the sentence: "Early this morning, the clever detective searched quietly under the old wooden bridge."',
  [
    { label: '(a)', text: 'Identify the adverb showing the manner of searching.', marks: 1 },
    { label: '(b)', text: 'Identify the preposition of place indicating location.', marks: 1 },
    { label: '(c)', text: 'Identify the fronted adverbial phrase showing when the event happened.', marks: 1 }
  ],
  null, 'Quietly; Under; Early this morning', 3,
  '(a) Quietly is the adverb of manner. (b) Under shows position. (c) Early this morning tells when.'
);

addQ(
  'Stage 3', 'English', 'Punctuation', 'Speech Marks and Apostrophes', 'Medium', 'short_answer',
  'Punctuate the dialogue and possessive forms.',
  [
    { label: '(a)', text: 'Insert speech marks correctly: The teacher said, Open your reading books.', marks: 1 },
    { label: '(b)', text: 'Write the possessive form showing the coat belongs to James.', marks: 1 }
  ],
  null, 'The teacher said, "Open your reading books."; James\'s coat (or James\' coat)', 2,
  '(a) Direct spoken words are enclosed in quotes: "Open your reading books." (b) James\'s coat shows singular possession.'
);

addQ(
  'Stage 3', 'English', 'Vocabulary & Spelling', 'Homophones & Synonyms', 'Medium', 'short_answer',
  'Choose the correct homophones and synonyms.',
  [
    { label: '(a)', text: 'Choose the correct word: The students left (their / there / they\'re) bags in the hallway.', marks: 1 },
    { label: '(b)', text: 'Write a powerful synonym for the word "walked" (e.g. marched, strolled, crept).', marks: 1 }
  ],
  null, 'their; Marched / Strolled / Crept', 2,
  '(a) "Their" indicates third-person plural possession. (b) Marched, strolled, trudged are strong synonyms for walked.'
);


// ==============================================================================
// STAGE 4 (GRADE 4 / PRIMARY 4)
// ==============================================================================

// --- MATHEMATICS (Stage 4) ---
addQ(
  'Stage 4', 'Mathematics', 'Number & Calculation', '4-Digit Operations & Factors', 'Medium', 'short_answer',
  'Solve the 4-digit arithmetic and factor challenges.',
  [
    { label: '(a)', text: 'Calculate: 3,428 + 1,785 = [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Find the highest common factor (HCF) of 18 and 24.', marks: 1 },
    { label: '(c)', text: 'Find the lowest common multiple (LCM) of 4 and 6.', marks: 1 }
  ],
  null, '5,213; 6; 12', 3,
  '(a) 3,428 + 1,785 = 5,213. (b) Factors of 18: 1,2,3,6,9,18. Factors of 24: 1,2,3,4,6,8,12,24. HCF = 6. (c) Multiples of 4 (4,8,12) and 6 (6,12) first meet at 12.'
);

addQ(
  'Stage 4', 'Mathematics', 'Fractions, Decimals & Percentages', 'Decimals & Fraction Equivalence', 'Medium', 'short_answer',
  'Work with decimals and fractions.',
  [
    { label: '(a)', text: 'Convert 0.75 into a fraction in its simplest form.', marks: 1 },
    { label: '(b)', text: 'Calculate: 4.65 + 2.8 = [ ___ ]', marks: 1 },
    { label: '(c)', text: 'Which is greater: 0.6 or 0.58?', marks: 1 }
  ],
  null, '3/4; 7.45; 0.6', 3,
  '(a) 0.75 = 75/100 = 3/4. (b) 4.65 + 2.80 = 7.45. (c) 0.60 is greater than 0.58.'
);

addQ(
  'Stage 4', 'Mathematics', 'Geometry & Shapes', 'Quadrilaterals & Coordinates', 'Medium', 'short_answer',
  'Answer the questions about 2D geometry and coordinates.',
  [
    { label: '(a)', text: 'Name the quadrilateral that has opposite sides parallel and equal, but no right angles.', marks: 1 },
    { label: '(b)', text: 'A point has coordinate (4, 7). Which number represents the x-axis distance?', marks: 1 },
    { label: '(c)', text: 'How many pairs of parallel sides does a regular trapezium have?', marks: 1 }
  ],
  null, 'Parallelogram (or Rhombus); 4; 1 pair', 3,
  '(a) A parallelogram has opposite parallel sides without right angles. (b) In (x, y), 4 is x. (c) A trapezium has exactly 1 pair of parallel sides.'
);

addQ(
  'Stage 4', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Area and Perimeter of Rectangles', 'Medium', 'short_answer',
  'Calculate measurements for a rectangular garden measuring 12 m long and 7 m wide.',
  [
    { label: '(a)', text: 'Calculate the total perimeter of the garden fence.', marks: 1 },
    { label: '(b)', text: 'Calculate the total area of the garden lawn.', marks: 1 }
  ],
  null, '38 m; 84 m²', 2,
  '(a) Perimeter = 2 x (12 + 7) = 38 m. (b) Area = 12 x 7 = 84 m².'
);

addQ(
  'Stage 4', 'Mathematics', 'Statistics & Data Handling', 'Carroll Diagrams & Data Classification', 'Medium', 'short_answer',
  'Classify items in Carroll diagrams sorting items by legs vs no legs.',
  [
    { label: '(a)', text: 'In a Carroll diagram sorting animals with legs versus no legs, where does a crocodile belong?', marks: 1 },
    { label: '(b)', text: 'There are 10 apples in a row and 4 are crossed out. What fraction of apples are NOT crossed out in simplest form?', marks: 1 }
  ],
  null, 'Animals with Legs; 3/5', 2,
  '(a) A crocodile is an animal with 4 legs. (b) 6 out of 10 remain: 6/10 = 3/5.',
  'https://res.cloudinary.com/u6maukag/image/upload/v1790260692/ChatGPT_Image_Sep_24_2026_08_07_59_PM.png'
);

// --- SCIENCE (Stage 4) ---
addQ(
  'Stage 4', 'Science', 'Biology & Living Things', 'Food Chains & Ecosystems', 'Medium', 'short_answer',
  'Look at the food chain: Grass ➔ Grasshopper ➔ Frog ➔ Snake ➔ Hawk.',
  [
    { label: '(a)', text: 'Name the primary producer that captures sunlight energy.', marks: 1 },
    { label: '(b)', text: 'Which organism is the apex predator at the top of this food chain?', marks: 1 },
    { label: '(c)', text: 'What would happen to the grasshopper population if all frogs were removed?', marks: 1 }
  ],
  null, 'Grass; Hawk; The grasshopper population would increase (fewer predators)', 3,
  '(a) Grass produces energy via photosynthesis. (b) Hawk is at the top. (c) Without frog predators, grasshoppers multiply.'
);

addQ(
  'Stage 4', 'Science', 'Electricity & Circuits', 'Circuits, Components & Switches', 'Medium', 'short_answer',
  'Investigate simple electrical circuits.',
  [
    { label: '(a)', text: 'Which component provides the electrical push to drive current through wires?', marks: 1 },
    { label: '(b)', text: 'Is copper wire used as a conductor or an insulator in electrical leads?', marks: 1 },
    { label: '(c)', text: 'What happens to the brightness of a bulb when a second battery cell is added in series?', marks: 1 }
  ],
  null, 'Cell / Battery; Electrical Conductor; The bulb shines brighter', 3,
  '(a) Cell/Battery provides voltage. (b) Copper is a conductor. (c) Extra voltage increases current, making the bulb brighter.'
);

addQ(
  'Stage 4', 'Science', 'States of Matter', 'The Water Cycle & Evaporation', 'Medium', 'short_answer',
  'Examine the stages of the Earth\'s water cycle.',
  [
    { label: '(a)', text: 'What process turns liquid water in oceans into invisible water vapour in the sky?', marks: 1 },
    { label: '(b)', text: 'Name the process where water vapour cools and condenses to form rain clouds.', marks: 1 },
    { label: '(c)', text: 'State one factor that makes water puddles evaporate faster on a windy day.', marks: 1 }
  ],
  null, 'Evaporation; Condensation; Wind moving air away / Higher temperature', 3,
  '(a) Evaporation. (b) Condensation creates clouds. (c) Wind and heat speed up the rate of evaporation.'
);

addQ(
  'Stage 4', 'Science', 'Light & Shadows', 'Sound Vibrations & Pitch', 'Medium', 'short_answer',
  'Investigate how sounds are created and heard.',
  [
    { label: '(a)', text: 'What mechanical movement causes all sound waves to be produced?', marks: 1 },
    { label: '(b)', text: 'When a guitar string is tightened, does the musical pitch get higher or lower?', marks: 1 }
  ],
  null, 'Vibrations; Higher pitch', 2,
  '(a) Sound is caused by vibrating matter. (b) Tighter strings vibrate faster, creating higher pitch.'
);

// --- ENGLISH (Stage 4) ---
addQ(
  'Stage 4', 'English', 'Grammar & Sentence Structure', 'Fronted Adverbials & Clauses', 'Medium', 'short_answer',
  'Read the sentence: "Without making a sound, the hungry leopard crept silently through the tall grass."',
  [
    { label: '(a)', text: 'Identify the fronted adverbial opening the sentence.', marks: 1 },
    { label: '(b)', text: 'What punctuation mark follows a fronted adverbial?', marks: 1 },
    { label: '(c)', text: 'Identify the expanded noun phrase describing the setting.', marks: 1 }
  ],
  null, 'Without making a sound; Comma (,); The tall grass', 3,
  '(a) "Without making a sound" is the fronted adverbial. (b) A comma separates it from the main clause. (c) "the tall grass" is the expanded noun phrase.'
);

addQ(
  'Stage 4', 'English', 'Punctuation', 'Apostrophes for Plural Possession', 'Medium', 'short_answer',
  'Apply possessive apostrophes correctly.',
  [
    { label: '(a)', text: 'Write the possessive form showing books belonging to multiple teachers: the [ ___ ] books.', marks: 1 },
    { label: '(b)', text: 'Write the possessive form showing toys belonging to children: the [ ___ ] toys.', marks: 1 }
  ],
  null, 'teachers\'; children\'s', 2,
  '(a) Regular plural ending in s gets apostrophe after s: teachers\'. (b) Irregular plural children gets apostrophe + s: children\'s.'
);

addQ(
  'Stage 4', 'English', 'Vocabulary & Spelling', 'Prefixes & Suffixes', 'Medium', 'short_answer',
  'Apply prefixes and suffixes to base words.',
  [
    { label: '(a)', text: 'Add the prefix "anti-" to "freeze" and explain the meaning of the new word.', marks: 1 },
    { label: '(b)', text: 'Turn the noun "music" into the person who plays music using the suffix "-ian".', marks: 1 }
  ],
  null, 'Antifreeze (prevents freezing); Musician', 2,
  '(a) Anti- means against/preventing, so antifreeze stops freezing. (b) Music + ian = Musician.'
);


// ==============================================================================
// STAGE 5 (GRADE 5 / PRIMARY 5)
// ==============================================================================

// --- MATHEMATICS (Stage 5) ---
addQ(
  'Stage 5', 'Mathematics', 'Number & Calculation', 'Order of Operations & Powers', 'Medium', 'short_answer',
  'Evaluate arithmetic and algebraic operations.',
  [
    { label: '(a)', text: 'Use order of operations (BODMAS) to calculate: 15 + 4 x (8 - 3)', marks: 2 },
    { label: '(b)', text: 'What is 7 squared (7²)?', marks: 1 },
    { label: '(c)', text: 'What is 4 cubed (4³)?', marks: 1 }
  ],
  null, '35; 49; 64', 4,
  '(a) Brackets: 8 - 3 = 5. Multiply: 4 x 5 = 20. Add: 15 + 20 = 35. (b) 7 x 7 = 49. (c) 4 x 4 x 4 = 64.'
);

addQ(
  'Stage 5', 'Mathematics', 'Number & Calculation', 'Scientific Standard Form & Large Numbers', 'Medium', 'short_answer',
  'Work with scientific notation and standard form.',
  [
    { label: '(a)', text: 'Write 45,600 in standard form.', marks: 1 },
    { label: '(b)', text: 'Calculate (2.4 x 10^5) x (3 x 10^-2) in standard form.', marks: 2 }
  ],
  null, '4.56 x 10^4; 7.2 x 10^3', 3,
  '(a) 45,600 = 4.56 x 10^4. (b) 2.4 x 3 = 7.2; 10^(5-2) = 10^3. Result: 7.2 x 10^3.'
);

addQ(
  'Stage 5', 'Mathematics', 'Fractions, Decimals & Percentages', 'Fractions with Different Denominators', 'Medium', 'short_answer',
  'Solve the fraction and percentage calculations.',
  [
    { label: '(a)', text: 'Calculate: 2/3 + 1/4. Give your answer as a single fraction.', marks: 2 },
    { label: '(b)', text: 'Find 15% of $240.', marks: 2 },
    { label: '(c)', text: 'Convert 5/8 to a percentage.', marks: 1 }
  ],
  null, '11/12; $36; 62.5%', 5,
  '(a) Common denominator 12: 8/12 + 3/12 = 11/12. (b) 10% of 240 = 24; 5% = 12; 15% = $36. (c) 5/8 = 0.625 = 62.5%.'
);

addQ(
  'Stage 5', 'Mathematics', 'Geometry & Shapes', 'Angles on a Straight Line & Around a Point', 'Medium', 'short_answer',
  'Find the missing angle measurements.',
  [
    { label: '(a)', text: 'Two angles lie on a straight line. One angle measures 115°. Calculate the other angle.', marks: 1 },
    { label: '(b)', text: 'What is the sum of angles around a complete point in degrees?', marks: 1 },
    { label: '(c)', text: 'How many degrees are in the three interior angles of any triangle combined?', marks: 1 }
  ],
  null, '65°; 360°; 180°', 3,
  '(a) Angles on a line sum to 180°: 180 - 115 = 65°. (b) Angles around a point sum to 360°. (c) Angles in a triangle sum to 180°.'
);

addQ(
  'Stage 5', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Volume and Unit Conversions', 'Medium', 'short_answer',
  'Calculate 3D measurements and conversions.',
  [
    { label: '(a)', text: 'A cuboid box has length = 6 cm, width = 4 cm, and height = 5 cm. Calculate its volume.', marks: 2 },
    { label: '(b)', text: 'Convert 3.75 kilograms (kg) into grams (g).', marks: 1 },
    { label: '(c)', text: 'Convert 2,400 milliliters (ml) into liters (l).', marks: 1 }
  ],
  null, '120 cm³; 3,750 g; 2.4 l', 4,
  '(a) Volume = length x width x height = 6 x 4 x 5 = 120 cm³. (b) 3.75 x 1000 = 3,750 g. (c) 2,400 / 1000 = 2.4 l.'
);

addQ(
  'Stage 5', 'Mathematics', 'Statistics & Data Handling', 'Averages: Mean, Median, Mode, Range', 'Medium', 'short_answer',
  'Look at the test scores dataset: 6, 8, 9, 8, 4, 10, 8.',
  [
    { label: '(a)', text: 'What is the mode (most common score)?', marks: 1 },
    { label: '(b)', text: 'Find the range of the test scores.', marks: 1 },
    { label: '(c)', text: 'Calculate the mean (average) score.', marks: 2 }
  ],
  null, '8; 6; 7.57 (or sum 53 / 7 ≈ 7.57)', 4,
  '(a) 8 appears three times (mode). (b) Range = Highest - Lowest = 10 - 4 = 6. (c) Sum = 53; Mean = 53 / 7 ≈ 7.57.'
);

// --- SCIENCE (Stage 5) ---
addQ(
  'Stage 5', 'Science', 'Earth & Space', 'The Solar System & Planetary Orbits', 'Medium', 'short_answer',
  'Examine the solar system and celestial movements.',
  [
    { label: '(a)', text: 'How long does it take for Earth to complete one full rotation on its axis?', marks: 1 },
    { label: '(b)', text: 'How long does it take for Earth to complete one full orbit around the Sun?', marks: 1 },
    { label: '(c)', text: 'Explain what causes the pattern of day and night on Earth.', marks: 1 }
  ],
  null, '24 hours (1 day); 365.25 days (1 year); Earth rotating on its axis while facing towards/away from the Sun', 3,
  '(a) 24 hours. (b) 365.25 days (1 year). (c) As Earth spins, the half facing the Sun experiences day while the opposite side experiences night.'
);

addQ(
  'Stage 5', 'Science', 'Forces, Magnets & Motion', 'Gravity, Mass and Weight', 'Medium', 'short_answer',
  'Investigate gravity and mass.',
  [
    { label: '(a)', text: 'What standard metric unit is used to measure mass in kilograms?', marks: 1 },
    { label: '(b)', text: 'What scientific unit is used to measure force and weight?', marks: 1 },
    { label: '(c)', text: 'If an astronaut travels to the Moon, does their mass change, or does their weight change?', marks: 1 }
  ],
  null, 'Kilograms (kg); Newtons (N); Their weight changes (mass stays the same)', 3,
  '(a) Mass is in kg/grams. (b) Force and weight are measured in Newtons (N). (c) Mass (amount of matter) is constant; weight decreases due to lower lunar gravity.'
);

addQ(
  'Stage 5', 'Science', 'States of Matter', 'Solutions, Solutes and Separating Mixtures', 'Medium', 'short_answer',
  'Examine solutions and separating techniques.',
  [
    { label: '(a)', text: 'When salt dissolves in water, is salt the solute or the solvent?', marks: 1 },
    { label: '(b)', text: 'Which separation method would you use to separate insoluble sand from water?', marks: 1 },
    { label: '(c)', text: 'Which separation method would you use to recover dissolved salt from salty water?', marks: 1 }
  ],
  null, 'Solute; Filtration; Evaporation (or Distillation)', 3,
  '(a) Salt is the solute; water is the solvent. (b) Filtration traps sand on filter paper. (c) Evaporation boils away water leaving salt crystals.'
);

addQ(
  'Stage 5', 'Science', 'Biology & Living Things', 'Plant Reproduction & Seed Dispersal', 'Medium', 'short_answer',
  'Investigate plant reproduction mechanisms.',
  [
    { label: '(a)', text: 'What is the transfer of pollen from the male anther to the female stigma called?', marks: 1 },
    { label: '(b)', text: 'Name two different methods by which flowering plants disperse their seeds.', marks: 2 }
  ],
  null, 'Pollination; Wind dispersal and Animal dispersal (or Water/Explosion)', 3,
  '(a) Pollination is pollen transfer. (b) Methods include wind (dandelion), animals (berries/hooks), water (coconut), explosion (pea pods).'
);

// --- ENGLISH (Stage 5) ---
addQ(
  'Stage 5', 'English', 'Grammar & Sentence Structure', 'Modal Verbs & Relative Clauses', 'Medium', 'short_answer',
  'Read the sentence: "Dr. Alistair, who had studied ancient fossils for decades, believed the discovery might change history."',
  [
    { label: '(a)', text: 'Identify the embedded relative clause in the sentence.', marks: 1 },
    { label: '(b)', text: 'Identify the modal verb expressing possibility.', marks: 1 },
    { label: '(c)', text: 'Which relative pronoun introduces the relative clause?', marks: 1 }
  ],
  null, 'Who had studied ancient fossils for decades; Might; Who', 3,
  '(a) "who had studied ancient fossils for decades" adds extra detail. (b) "might" expresses possibility. (c) "who" is the relative pronoun.'
);

addQ(
  'Stage 5', 'English', 'Punctuation', 'Colons and Semicolons', 'Medium', 'short_answer',
  'Apply advanced punctuation marks.',
  [
    { label: '(a)', text: 'Insert a colon to introduce the list: Pack these items a flashlight a compass and warm gloves.', marks: 1 },
    { label: '(b)', text: 'Explain why a semicolon is used between two independent clauses without a conjunction.', marks: 1 }
  ],
  null, 'Pack these items: a flashlight, a compass and warm gloves; It links two closely related complete sentences together', 2,
  '(a) A colon follows the introductory clause. (b) Semicolons connect related thoughts without coordinating conjunctions.'
);

addQ(
  'Stage 5', 'English', 'Vocabulary & Spelling', 'Root Words & Etymology', 'Medium', 'short_answer',
  'Investigate Greek and Latin root words.',
  [
    { label: '(a)', text: 'The Greek root "bio" means life. What is the study of living organisms called?', marks: 1 },
    { label: '(b)', text: 'The Greek root "tele" means distant or far. What instrument allows us to see distant stars?', marks: 1 }
  ],
  null, 'Biology; Telescope', 2,
  '(a) Bio (life) + logy (study) = Biology. (b) Tele (distant) + scope (look) = Telescope.'
);


// ==============================================================================
// STAGE 6 (GRADE 6 / PRIMARY 6)
// ==============================================================================

// --- MATHEMATICS (Stage 6) ---
addQ(
  'Stage 6', 'Mathematics', 'Number & Calculation', 'Negative Arithmetic & Indices', 'Hard', 'short_answer',
  'Solve the advanced number calculations.',
  [
    { label: '(a)', text: 'Calculate: -14 + (-8) = [ ___ ]', marks: 1 },
    { label: '(b)', text: 'Calculate: -6 x (-7) = [ ___ ]', marks: 1 },
    { label: '(c)', text: 'Evaluate 8^(2/3) without a calculator.', marks: 1 }
  ],
  null, '-22; 42; 4', 3,
  '(a) -14 - 8 = -22. (b) Negative times negative gives positive: -6 x -7 = +42. (c) (8^(1/3))^2 = 2^2 = 4.'
);

addQ(
  'Stage 6', 'Mathematics', 'Fractions, Decimals & Percentages', 'Multiplying & Dividing Fractions', 'Hard', 'short_answer',
  'Calculate the fraction and ratio operations.',
  [
    { label: '(a)', text: 'Calculate: 3/4 x 2/5. Give your answer in simplest fraction form.', marks: 2 },
    { label: '(b)', text: 'Calculate: 3/5 ÷ 2/3. Give your answer as a simplified fraction or mixed number.', marks: 2 },
    { label: '(c)', text: 'Share $150 in the ratio 2 : 3.', marks: 2 }
  ],
  null, '3/10; 9/10; $60 and $90', 6,
  '(a) 3x2 / 4x5 = 6/20 = 3/10. (b) 3/5 x 3/2 = 9/10. (c) Total parts = 5. 1 part = $30. 2 parts = $60, 3 parts = $90.'
);

addQ(
  'Stage 6', 'Mathematics', 'Geometry & Shapes', 'Angles in Triangles & Quadrilaterals', 'Hard', 'short_answer',
  'Calculate missing geometric angles.',
  [
    { label: '(a)', text: 'In a triangle, two angles measure 55° and 65°. Calculate the size of the third angle.', marks: 1 },
    { label: '(b)', text: 'In a quadrilateral, three angles measure 90°, 110°, and 85°. Calculate the fourth angle.', marks: 2 },
    { label: '(c)', text: 'In which quadrant on a Cartesian coordinate plane is the point (-3, -5) located?', marks: 1 }
  ],
  null, '60°; 75°; Quadrant 3 (Third Quadrant)', 4,
  '(a) Triangle sum = 180°: 180 - (55 + 65) = 180 - 120 = 60°. (b) Quadrilateral sum = 360°: 360 - (90 + 110 + 85) = 360 - 285 = 75°. (c) Negative x and negative y lie in Quadrant 3.'
);

addQ(
  'Stage 6', 'Mathematics', 'Measurement (Length, Mass, Capacity)', 'Area of Triangles & Speed', 'Hard', 'short_answer',
  'Solve compound area and speed problems.',
  [
    { label: '(a)', text: 'A right-angled triangle has base = 8 cm and perpendicular height = 6 cm. Calculate its area.', marks: 2 },
    { label: '(b)', text: 'A train travels a distance of 180 kilometers in 2.5 hours. Calculate its average speed in km/h.', marks: 2 }
  ],
  null, '24 cm²; 72 km/h', 4,
  '(a) Area = 1/2 x base x height = 1/2 x 8 x 6 = 24 cm². (b) Speed = distance / time = 180 / 2.5 = 72 km/h.'
);

addQ(
  'Stage 6', 'Mathematics', 'Statistics & Data Handling', 'Probability & Pie Charts', 'Hard', 'short_answer',
  'Answer the questions about data and probability.',
  [
    { label: '(a)', text: 'A bag contains 4 red marbles, 5 blue marbles, and 1 green marble. What is the probability of picking a blue marble at random?', marks: 2 },
    { label: '(b)', text: 'In a pie chart representing 120 people, how many degrees should be used to represent 30 people?', marks: 2 }
  ],
  null, '5/10 (or 1/2); 90°', 4,
  '(a) Total marbles = 10. Probability of blue = 5/10 = 1/2. (b) 30 / 120 = 1/4 of total. 1/4 of 360° = 90°.'
);

// --- SCIENCE (Stage 6) ---
addQ(
  'Stage 6', 'Science', 'Biology & Living Things', 'Circulatory System & Heart', 'Hard', 'short_answer',
  'Investigate human organ systems and circulation.',
  [
    { label: '(a)', text: 'Which muscular organ acts as a pump to circulate oxygenated blood around the human body?', marks: 1 },
    { label: '(b)', text: 'Name the blood vessels that carry oxygen-rich blood away from the heart to body tissues.', marks: 1 },
    { label: '(c)', text: 'Explain why your heart rate and pulse increase during intense physical exercise.', marks: 1 }
  ],
  null, 'The Heart; Arteries; Muscles require more oxygen and glucose to produce energy', 3,
  '(a) The heart pumps blood. (b) Arteries carry blood away from the heart. (c) Heart rate rises to deliver more oxygen and nutrients to active muscles.'
);

addQ(
  'Stage 6', 'Science', 'Light & Shadows', 'Light Reflection & Refraction Prisms', 'Hard', 'short_answer',
  'Examine the behaviour of light rays.',
  [
    { label: '(a)', text: 'State the Law of Reflection regarding the angle of incidence and the angle of reflection.', marks: 1 },
    { label: '(b)', text: 'What optical term describes the bending of light when it passes from air into clear glass or water?', marks: 1 },
    { label: '(c)', text: 'What happens when white sunlight passes through a triangular glass prism?', marks: 1 }
  ],
  null, 'Angle of Incidence equals Angle of Reflection; Refraction; It splits into a spectrum of colours (dispersion)', 3,
  '(a) Angle of incidence = angle of reflection. (b) Refraction is the bending of light at boundaries between different optical media. (c) The prism disperses white light into the visible spectrum (rainbow colors).'
);

addQ(
  'Stage 6', 'Science', 'Electricity & Circuits', 'Voltage, Resistance and Circuit Symbols', 'Hard', 'short_answer',
  'Analyze electrical circuits.',
  [
    { label: '(a)', text: 'What happens to the brightness of two identical bulbs connected in a series circuit compared to a single bulb with the same battery?', marks: 1 },
    { label: '(b)', text: 'Explain why connecting bulbs in a parallel circuit ensures all bulbs remain lit if one bulb burns out.', marks: 1 },
    { label: '(c)', text: 'What is the standard unit of electrical potential difference (voltage)?', marks: 1 }
  ],
  null, 'They shine dimmer (share voltage); Each parallel branch has an independent closed circuit; Volts (V)', 3,
  '(a) In series, voltage is shared equally so bulbs shine dimmer. (b) Each parallel branch has its own path for current. (c) Voltage is measured in Volts (V).'
);

addQ(
  'Stage 6', 'Science', 'Earth & Space', 'Fossils and Evolution', 'Hard', 'short_answer',
  'Investigate ancient life and adaptations.',
  [
    { label: '(a)', text: 'What term describes preserved prehistoric remains or impressions of organisms embedded in rock layers?', marks: 1 },
    { label: '(b)', text: 'How do fossils provide evidence that environments and species have changed over millions of years?', marks: 1 }
  ],
  null, 'Fossils; They show physical changes in bone structures and ancient extinct species that lived in different climates', 2,
  '(a) Fossils are preserved remains. (b) Fossil layers record evolutionary changes and historical transitions.'
);

// --- ENGLISH (Stage 6) ---
addQ(
  'Stage 6', 'English', 'Grammar & Sentence Structure', 'Active and Passive Voice', 'Hard', 'short_answer',
  'Transform and analyze sentence voice.',
  [
    { label: '(a)', text: 'Convert this active sentence into the passive voice: "The ancient storm destroyed the coastal harbour."', marks: 2 },
    { label: '(b)', text: 'Explain why passive voice is frequently preferred in scientific and formal reports.', marks: 1 }
  ],
  null, 'The coastal harbour was destroyed by the ancient storm; Passive voice focuses attention on the action/result rather than the person performing it', 3,
  '(a) Object becomes subject: "The coastal harbour was destroyed by the ancient storm." (b) Passive voice provides an objective, formal tone focused on outcomes.'
);

addQ(
  'Stage 6', 'English', 'Punctuation', 'Hyphens, Dashes and Semicolons', 'Hard', 'short_answer',
  'Examine complex punctuation usage.',
  [
    { label: '(a)', text: 'Explain the difference in function between a hyphen (-) and an em-dash (—).', marks: 1 },
    { label: '(b)', text: 'Combine two related clauses using a semicolon: "The observatory telescope was powerful it revealed distant galaxies."', marks: 2 }
  ],
  null, 'Hyphens join compound words; dashes separate parenthetical thought; The observatory telescope was powerful; it revealed distant galaxies.', 3,
  '(a) Hyphens link words (e.g. well-known); dashes create an emphatic pause. (b) Semicolon connects two independent clauses.'
);

addQ(
  'Stage 6', 'English', 'Reading & Comprehension', 'Literary Analysis & Inferences', 'Hard', 'short_answer',
  'Read the extract: "The howling wind rattled the iron shutters like an unwelcome intruder trying to force entry into the silent farmhouse."',
  [
    { label: '(a)', text: 'Identify the literary technique used in: "like an unwelcome intruder".', marks: 1 },
    { label: '(b)', text: 'What atmosphere or mood does this description create for the reader?', marks: 1 },
    { label: '(c)', text: 'Which word in the sentence is an example of onomatopoeia or sound description?', marks: 1 }
  ],
  null, 'Simile; Tense / Eerie / Suspenseful; Rattled (or Howling)', 3,
  '(a) "Like..." is a simile comparing wind to an intruder. (b) It creates tension and foreboding. (c) Rattled/howling evoke sensory sounds.'
);


// ==============================================================================
// EXECUTE CLEAN & POPULATE
// ==============================================================================
async function main() {
  console.log(`\n=== Total Authentic Cambridge Questions Prepared: ${questions.length} ===\n`);

  // 1. Clean public.question_bank table
  console.log('1. Cleaning public.question_bank in PostgreSQL...');
  await db.query('TRUNCATE TABLE public.question_bank RESTART IDENTITY CASCADE');
  console.log('✓ Cleaned public.question_bank.');

  // 2. Insert questions into public.question_bank
  console.log('2. Inserting questions into database...');
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.query(
      `INSERT INTO public.question_bank
       (stage, subject, strand, topic, subtopic, difficulty, question_type, question_text, sub_parts, options, correct_answer, marks, explanation, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        q.stage,
        q.subject,
        q.strand,
        q.topic,
        q.subtopic,
        q.difficulty,
        q.question_type,
        q.question_text,
        JSON.stringify(q.sub_parts),
        JSON.stringify(q.options),
        q.correct_answer,
        q.marks,
        q.explanation,
        q.image_url
      ]
    );
  }
  console.log(`✓ Inserted ${questions.length} authentic questions into database.`);

  // 3. Write clean CSV dataset to dataset/questions_dataset.csv
  console.log('3. Writing dataset to dataset/questions_dataset.csv...');
  const csvHeaders = ['stage', 'subject', 'strand', 'subtopic', 'difficulty', 'question_type', 'question_text', 'sub_parts', 'options', 'correct_answer', 'marks', 'image_url', 'explanation'];
  
  const csvLines = [csvHeaders.join(',')];
  for (const q of questions) {
    const row = [
      escapeCsv(q.stage),
      escapeCsv(q.subject),
      escapeCsv(q.strand),
      escapeCsv(q.subtopic),
      escapeCsv(q.difficulty),
      escapeCsv(q.question_type),
      escapeCsv(q.question_text),
      escapeCsv(q.sub_parts),
      escapeCsv(q.options && q.options.length > 0 ? q.options : ''),
      escapeCsv(q.correct_answer),
      escapeCsv(q.marks),
      escapeCsv(q.image_url || ''),
      escapeCsv(q.explanation)
    ];
    csvLines.push(row.join(','));
  }

  const csvPath = path.join(__dirname, '../dataset/questions_dataset.csv');
  try {
    fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');
    console.log(`✓ Updated ${csvPath} with ${questions.length} questions.`);
  } catch (err) {
    console.warn('Direct write warning:', err.message);
    const tempPath = path.join(__dirname, '../dataset/questions_dataset_new.csv');
    fs.writeFileSync(tempPath, csvLines.join('\n'), 'utf8');
    console.log(`✓ Saved dataset as ${tempPath}`);
  }

  // 4. Verify counts from database
  const { rows } = await db.query('SELECT count(*), stage, subject FROM public.question_bank GROUP BY stage, subject ORDER BY stage, subject');
  console.log('\n=== Database Summary by Stage & Subject ===');
  console.table(rows);

  process.exit(0);
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
