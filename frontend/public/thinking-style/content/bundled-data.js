/**
 * Mentara Labs | Learning Profile Check
 * Bundled Content Cache for Zero-CORS file:// protocol compatibility
 */
export const BUNDLED_QUESTION_BANK = [
  {
    "id": "cam-s3-frac-01",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 2,
    "skillId": "fraction-comparison",
    "stem": "Which fraction is bigger: 1/4 or 1/8 of the same cake?",
    "readAloudText": "Which fraction is bigger: 1 fourth or 1 eighth of the same cake?",
    "options": [
      { "text": "1/4", "correct": true },
      { "text": "1/8", "correct": false, "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "text": "They are exactly the same size", "correct": false, "misconceptionId": "fraction-unit-numerator-same" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Cutting into fewer slices makes each slice larger.", "isCorrectReasoning": true },
      { "id": "r2", "text": "8 is a bigger number than 4, so 1/8 must be bigger.", "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "id": "r3", "text": "Both have 1 at the top, so they must be equal.", "misconceptionId": "fraction-unit-numerator-same" },
      { "id": "r4", "text": "I was guessing or not quite sure.", "isGuess": true }
    ],
    "strategyProbe": "How did you work it out?"
  },
  {
    "id": "cam-s3-frac-02",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 3,
    "skillId": "fraction-comparison",
    "stem": "Sam has 1/3 of a chocolate bar. Leo has 1/6 of the same bar. Who has the larger piece?",
    "readAloudText": "Sam has 1 third of a chocolate bar. Leo has 1 sixth of the same bar. Who has the larger piece?",
    "options": [
      { "text": "Sam (1/3)", "correct": true },
      { "text": "Leo (1/6)", "correct": false, "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "text": "Both have the same", "correct": false, "misconceptionId": "fraction-unit-numerator-same" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Sharing between 3 children gives bigger pieces than sharing between 6.", "isCorrectReasoning": true },
      { "id": "r2", "text": "6 is greater than 3, so 1/6 is bigger.", "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "id": "r3", "text": "Both only have 1 piece.", "misconceptionId": "fraction-unit-numerator-same" },
      { "id": "r4", "text": "I tried imagining the chocolate bar in my head.", "isHeuristic": true }
    ]
  },
  {
    "id": "cam-s3-frac-03",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 2,
    "skillId": "fraction-equal-parts",
    "stem": "Look at these four pizzas. Which pizza shows quarters (1/4)?",
    "readAloudText": "Look at these four pizzas. Which pizza shows quarters?",
    "options": [
      { "text": "A pizza cut into 4 equal slices", "correct": true },
      { "text": "A pizza cut into 4 slices of different sizes", "correct": false, "misconceptionId": "fraction-count-pieces-ignoring-size" },
      { "text": "A pizza cut into 2 halves", "correct": false, "misconceptionId": "fraction-half-quarter-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Fractions must always be divided into equal parts.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Any pizza cut into 4 pieces is quarters, even if slices are unequal.", "misconceptionId": "fraction-count-pieces-ignoring-size" },
      { "id": "r3", "text": "I just counted the number of cuts.", "misconceptionId": "fraction-count-cuts" }
    ]
  },
  {
    "id": "cam-s3-frac-04",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 3,
    "skillId": "fraction-equal-parts",
    "stem": "What is 1/4 of 16 counters?",
    "readAloudText": "What is 1 fourth of 16 counters?",
    "options": [
      { "text": "4", "correct": true },
      { "text": "12", "correct": false, "misconceptionId": "fraction-subtracted-denominator" },
      { "text": "8", "correct": false, "misconceptionId": "fraction-default-to-half" },
      { "text": "64", "correct": false, "misconceptionId": "multiplication-operation-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "I shared 16 into 4 equal groups: 16 Ã· 4 = 4.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I subtracted 4 from 16.", "misconceptionId": "fraction-subtracted-denominator" },
      { "id": "r3", "text": "I just took half of 16.", "misconceptionId": "fraction-default-to-half" }
    ],
    "strategyProbe": "How did you find 1/4 of 16?"
  },
  {
    "id": "cam-s3-frac-05",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 3,
    "skillId": "fraction-comparison",
    "stem": "Which fraction is smaller than 1/2?",
    "readAloudText": "Which fraction is smaller than 1 half?",
    "options": [
      { "text": "1/5", "correct": true },
      { "text": "2/2", "correct": false, "misconceptionId": "fraction-whole-misunderstood" },
      { "text": "3/4", "correct": false, "misconceptionId": "fraction-numerator-ignored" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "1/5 means sharing into 5 pieces, which are smaller than half.", "isCorrectReasoning": true },
      { "id": "r2", "text": "5 is bigger than 2, so 1/5 is larger than 1/2.", "misconceptionId": "fraction-bigger-denominator-bigger-value" }
    ]
  },
  {
    "id": "cam-s3-frac-06",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 4,
    "skillId": "fraction-comparison",
    "stem": "Place these in order from smallest to largest: 1/10, 1/2, 1/5",
    "readAloudText": "Place these in order from smallest to largest: 1 tenth, 1 half, 1 fifth.",
    "options": [
      { "text": "1/10, 1/5, 1/2", "correct": true },
      { "text": "1/2, 1/5, 1/10", "correct": false, "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "text": "1/5, 1/10, 1/2", "correct": false, "misconceptionId": "fraction-random-ordering" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "The more pieces a whole is shared into, the smaller each piece is.", "isCorrectReasoning": true },
      { "id": "r2", "text": "2 is the smallest number, so 1/2 is the smallest fraction.", "misconceptionId": "fraction-bigger-denominator-bigger-value" }
    ]
  },
  {
    "id": "cam-s3-frac-07",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 3,
    "skillId": "fraction-equal-parts",
    "stem": "What fraction of this set of 6 stars is shaded if 3 are shaded?",
    "readAloudText": "What fraction of this set of 6 stars is shaded if 3 are shaded?",
    "options": [
      { "text": "1/2 (or 3/6)", "correct": true },
      { "text": "1/3", "correct": false, "misconceptionId": "fraction-numerator-matches-denominator" },
      { "text": "3/3", "correct": false, "misconceptionId": "fraction-total-confused-with-part" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "3 is half of 6, so half the stars are shaded.", "isCorrectReasoning": true },
      { "id": "r2", "text": "There are 3 shaded, so the fraction is 1/3.", "misconceptionId": "fraction-numerator-matches-denominator" }
    ]
  },
  {
    "id": "cam-s3-frac-08",
    "stage": 3,
    "strand": "fractions",
    "difficulty": 4,
    "skillId": "fraction-equal-parts",
    "stem": "What is 1/3 of 21 counters?",
    "readAloudText": "What is 1 third of 21 counters?",
    "options": [
      { "text": "7", "correct": true },
      { "text": "18", "correct": false, "misconceptionId": "fraction-subtracted-denominator" },
      { "text": "3", "correct": false, "misconceptionId": "fraction-picked-denominator" },
      { "text": "9", "correct": false, "misconceptionId": "multiplication-fact-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "21 divided by 3 is 7.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I subtracted 3 from 21.", "misconceptionId": "fraction-subtracted-denominator" }
    ]
  },
  {
    "id": "cam-s3-num-01",
    "stage": 3,
    "strand": "number",
    "difficulty": 2,
    "skillId": "place-value-3digit",
    "stem": "What is the value of the digit 7 in the number 472?",
    "readAloudText": "What is the value of the digit 7 in the number 472?",
    "options": [
      { "text": "70 (7 tens)", "correct": true },
      { "text": "7 (7 ones)", "correct": false, "misconceptionId": "place-value-face-value-only" },
      { "text": "700 (7 hundreds)", "correct": false, "misconceptionId": "place-value-column-reversal" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "The 7 is in the middle tens column, so it means 7 tens or 70.", "isCorrectReasoning": true },
      { "id": "r2", "text": "The digit is simply 7.", "misconceptionId": "place-value-face-value-only" },
      { "id": "r3", "text": "I read from right to left so I thought it was hundreds.", "misconceptionId": "place-value-column-reversal" }
    ]
  },
  {
    "id": "cam-s3-num-02",
    "stage": 3,
    "strand": "number",
    "difficulty": 2,
    "skillId": "place-value-3digit",
    "stem": "Which number is made of 5 hundreds, 0 tens, and 8 ones?",
    "readAloudText": "Which number is made of 5 hundreds, 0 tens, and 8 ones?",
    "options": [
      { "text": "508", "correct": true },
      { "text": "58", "correct": false, "misconceptionId": "place-value-zero-as-nothing" },
      { "text": "580", "correct": false, "misconceptionId": "place-value-column-swap-tens-ones" },
      { "text": "5008", "correct": false, "misconceptionId": "place-value-expanded-concatenation" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Zero holds the tens place, making 508.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Zero means nothing, so you just write 5 and 8 together as 58.", "misconceptionId": "place-value-zero-as-nothing" },
      { "id": "r3", "text": "5 hundreds is 500, then add 8 to make 5008.", "misconceptionId": "place-value-expanded-concatenation" }
    ]
  },
  {
    "id": "cam-s3-num-03",
    "stage": 3,
    "strand": "number",
    "difficulty": 3,
    "skillId": "place-value-3digit",
    "stem": "Which number is 10 more than 394?",
    "readAloudText": "Which number is 10 more than 394?",
    "options": [
      { "text": "404", "correct": true },
      { "text": "395", "correct": false, "misconceptionId": "place-value-confused-ten-with-one" },
      { "text": "3104", "correct": false, "misconceptionId": "place-value-digit-concatenation" },
      { "text": "494", "correct": false, "misconceptionId": "place-value-added-hundred-instead" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "9 tens plus 1 ten is 10 tens (1 hundred), so 394 becomes 404.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 1 to the last digit (395).", "misconceptionId": "place-value-confused-ten-with-one" },
      { "id": "r3", "text": "I added 100 instead of 10 (494).", "misconceptionId": "place-value-added-hundred-instead" }
    ],
    "strategyProbe": "How did you add 10 to 394?"
  },
  {
    "id": "cam-s3-num-04",
    "stage": 3,
    "strand": "number",
    "difficulty": 2,
    "skillId": "place-value-3digit",
    "stem": "Which sign makes this statement true: 603 [ ? ] 630",
    "readAloudText": "Which sign makes this statement true: 603 is what compared to 630?",
    "options": [
      { "text": "< (is less than)", "correct": true },
      { "text": "> (is greater than)", "correct": false, "misconceptionId": "place-value-symbol-confusion" },
      { "text": "= (is equal to)", "correct": false, "misconceptionId": "place-value-same-digits-equal" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "603 has 0 tens, while 630 has 3 tens, so 603 is smaller.", "isCorrectReasoning": true },
      { "id": "r2", "text": "They have the exact same digits, so they are the same.", "misconceptionId": "place-value-same-digits-equal" },
      { "id": "r3", "text": "The crocodile mouth always opens towards the right.", "misconceptionId": "place-value-symbol-confusion" }
    ]
  },
  {
    "id": "cam-s3-num-05",
    "stage": 3,
    "strand": "number",
    "difficulty": 3,
    "skillId": "place-value-3digit",
    "stem": "Round 348 to the nearest 10.",
    "readAloudText": "Round 348 to the nearest 10.",
    "options": [
      { "text": "350", "correct": true },
      { "text": "340", "correct": false, "misconceptionId": "rounding-always-down" },
      { "text": "300", "correct": false, "misconceptionId": "rounding-rounded-to-hundred" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "The units digit is 8, which is 5 or more, so we round up to 350.", "isCorrectReasoning": true },
      { "id": "r2", "text": "You just cut off the 8 and replace with 0 (340).", "misconceptionId": "rounding-always-down" },
      { "id": "r3", "text": "I rounded to the nearest hundred instead.", "misconceptionId": "rounding-rounded-to-hundred" }
    ]
  },
  {
    "id": "cam-s3-num-06",
    "stage": 3,
    "strand": "number",
    "difficulty": 3,
    "skillId": "place-value-3digit",
    "stem": "Which number is exactly in the middle between 200 and 300?",
    "readAloudText": "Which number is exactly in the middle between 200 and 300?",
    "options": [
      { "text": "250", "correct": true },
      { "text": "205", "correct": false, "misconceptionId": "place-value-zero-confusion" },
      { "text": "225", "correct": false, "misconceptionId": "midpoint-quarter-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Halfway between 0 and 100 is 50, so 250 is in the middle.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I put 5 in the ones place (205).", "misconceptionId": "place-value-zero-confusion" }
    ]
  },
  {
    "id": "cam-s3-num-07",
    "stage": 3,
    "strand": "number",
    "difficulty": 4,
    "skillId": "place-value-3digit",
    "stem": "What number is 100 less than 102?",
    "readAloudText": "What number is 100 less than 102?",
    "options": [
      { "text": "2", "correct": true },
      { "text": "100", "correct": false, "misconceptionId": "subtraction-disregard-remainder" },
      { "text": "202", "correct": false, "misconceptionId": "subtraction-addition-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "102 take away 1 hundred leaves 2 ones.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 100 instead of subtracting.", "misconceptionId": "subtraction-addition-confusion" }
    ]
  },
  {
    "id": "cam-s3-num-08",
    "stage": 3,
    "strand": "number",
    "difficulty": 3,
    "skillId": "place-value-3digit",
    "stem": "Look at the pattern: 240, 250, 260, [ ? ]. What comes next?",
    "readAloudText": "Look at the pattern: 240, 250, 260, what comes next?",
    "options": [
      { "text": "270", "correct": true },
      { "text": "261", "correct": false, "misconceptionId": "sequence-step-confused-with-one" },
      { "text": "300", "correct": false, "misconceptionId": "sequence-jump-to-hundred" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "The pattern is counting up by 10 each time.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I counted up by 1 (261).", "misconceptionId": "sequence-step-confused-with-one" }
    ]
  },
  {
    "id": "cam-s3-ops-01",
    "stage": 3,
    "strand": "operations",
    "difficulty": 2,
    "skillId": "subtraction-regrouping",
    "stem": "Solve: 52 - 27",
    "readAloudText": "Solve: 52 minus 27",
    "options": [
      { "text": "25", "correct": true },
      { "text": "35", "correct": false, "misconceptionId": "subtraction-smaller-from-larger-regardless-of-order" },
      { "text": "29", "correct": false, "misconceptionId": "subtraction-exchange-omission" },
      { "text": "79", "correct": false, "misconceptionId": "subtraction-addition-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Since 2 is smaller than 7, I exchanged a ten to make 12 - 7 = 5, and 40 - 20 = 20.", "isCorrectReasoning": true },
      { "id": "r2", "text": "In the ones column I did 7 - 2 = 5, and 5 - 2 = 3, getting 35.", "misconceptionId": "subtraction-smaller-from-larger-regardless-of-order" },
      { "id": "r3", "text": "I added 52 and 27 together.", "misconceptionId": "subtraction-addition-confusion" }
    ],
    "strategyProbe": "How did you work out 52 - 27?"
  },
  {
    "id": "cam-s3-ops-02",
    "stage": 3,
    "strand": "operations",
    "difficulty": 3,
    "skillId": "subtraction-regrouping",
    "stem": "Solve: 81 - 38",
    "readAloudText": "Solve: 81 minus 38",
    "options": [
      { "text": "43", "correct": true },
      { "text": "57", "correct": false, "misconceptionId": "subtraction-smaller-from-larger-regardless-of-order" },
      { "text": "53", "correct": false, "misconceptionId": "subtraction-forgot-borrowed-ten" },
      { "text": "47", "correct": false, "misconceptionId": "subtraction-calculation-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "I exchanged a ten: 11 - 8 = 3, then 70 - 30 = 40, making 43.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I subtracted 1 from 8 to get 7 in the ones place.", "misconceptionId": "subtraction-smaller-from-larger-regardless-of-order" },
      { "id": "r3", "text": "I borrowed a ten but forgot to decrease 8 to 7.", "misconceptionId": "subtraction-forgot-borrowed-ten" }
    ]
  },
  {
    "id": "cam-s3-ops-03",
    "stage": 3,
    "strand": "operations",
    "difficulty": 2,
    "skillId": "multiplication-arrays",
    "stem": "There are 4 baskets. Each basket has 6 apples. How many apples are there altogether?",
    "readAloudText": "There are 4 baskets. Each basket has 6 apples. How many apples are there altogether?",
    "options": [
      { "text": "24", "correct": true },
      { "text": "10", "correct": false, "misconceptionId": "multiplication-adds-factors" },
      { "text": "18", "correct": false, "misconceptionId": "multiplication-miscount-groups" },
      { "text": "20", "correct": false, "misconceptionId": "multiplication-skip-count-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "4 groups of 6 is 4 Ã— 6 = 24.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 4 + 6 to get 10.", "misconceptionId": "multiplication-adds-factors" },
      { "id": "r3", "text": "I counted in 6s: 6, 12, 18, 24.", "isHeuristic": true }
    ],
    "strategyProbe": "How did you work out 4 groups of 6?"
  },
  {
    "id": "cam-s3-ops-04",
    "stage": 3,
    "strand": "operations",
    "difficulty": 3,
    "skillId": "multiplication-arrays",
    "stem": "Which addition sentence matches 3 Ã— 5?",
    "readAloudText": "Which addition sentence matches 3 times 5?",
    "options": [
      { "text": "5 + 5 + 5", "correct": true },
      { "text": "3 + 5", "correct": false, "misconceptionId": "multiplication-adds-factors" },
      { "text": "3 + 3 + 3", "correct": false, "misconceptionId": "multiplication-wrong-repeated-term" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "3 Ã— 5 means 3 groups of 5 added together.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Multiplication is just adding the two numbers together (3 + 5).", "misconceptionId": "multiplication-adds-factors" }
    ]
  },
  {
    "id": "cam-s3-ops-05",
    "stage": 3,
    "strand": "operations",
    "difficulty": 3,
    "skillId": "division-sharing",
    "stem": "Share 24 marbles equally between 3 friends. How many marbles does each friend get?",
    "readAloudText": "Share 24 marbles equally between 3 friends. How many marbles does each friend get?",
    "options": [
      { "text": "8", "correct": true },
      { "text": "21", "correct": false, "misconceptionId": "division-subtracted-divisor" },
      { "text": "6", "correct": false, "misconceptionId": "division-fact-slip" },
      { "text": "27", "correct": false, "misconceptionId": "division-added-divisor" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "24 divided into 3 equal shares is 8 because 3 Ã— 8 = 24.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I subtracted 3 from 24 (21).", "misconceptionId": "division-subtracted-divisor" }
    ]
  },
  {
    "id": "cam-s3-ops-06",
    "stage": 3,
    "strand": "operations",
    "difficulty": 2,
    "skillId": "subtraction-without-regrouping",
    "stem": "Solve: 68 - 25",
    "readAloudText": "Solve: 68 minus 25",
    "options": [
      { "text": "43", "correct": true },
      { "text": "42", "correct": false, "misconceptionId": "subtraction-ones-off-by-one" },
      { "text": "93", "correct": false, "misconceptionId": "subtraction-addition-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "8 - 5 = 3 and 60 - 20 = 40, so 43.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added the numbers instead of subtracting.", "misconceptionId": "subtraction-addition-confusion" }
    ]
  },
  {
    "id": "cam-s3-ops-07",
    "stage": 3,
    "strand": "operations",
    "difficulty": 4,
    "skillId": "multiplication-arrays",
    "stem": "What is 8 Ã— 4?",
    "readAloudText": "What is 8 times 4?",
    "options": [
      { "text": "32", "correct": true },
      { "text": "12", "correct": false, "misconceptionId": "multiplication-adds-factors" },
      { "text": "28", "correct": false, "misconceptionId": "multiplication-skip-count-slip" },
      { "text": "36", "correct": false, "misconceptionId": "multiplication-skip-count-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "I know double 8 is 16, and double 16 is 32.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 8 + 4 = 12.", "misconceptionId": "multiplication-adds-factors" }
    ]
  },
  {
    "id": "cam-s3-ops-08",
    "stage": 3,
    "strand": "operations",
    "difficulty": 4,
    "skillId": "subtraction-regrouping",
    "stem": "Solve: 200 - 45",
    "readAloudText": "Solve: 200 minus 45",
    "options": [
      { "text": "155", "correct": true },
      { "text": "165", "correct": false, "misconceptionId": "subtraction-forgot-borrowed-ten" },
      { "text": "245", "correct": false, "misconceptionId": "subtraction-addition-confusion" },
      { "text": "145", "correct": false, "misconceptionId": "subtraction-exchange-omission" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Exchanging through the zeros: 200 becomes 1 hundred, 9 tens, 10 ones.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I subtracted 40 from 200 to get 160, then forgot to subtract the 5 properly.", "misconceptionId": "subtraction-forgot-borrowed-ten" }
    ]
  },
  {
    "id": "cam-s3-geom-01",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 2,
    "skillId": "shape-recognition",
    "stem": "Which shape has exactly 5 straight sides and 5 vertices?",
    "readAloudText": "Which shape has exactly 5 straight sides and 5 vertices?",
    "options": [
      { "text": "Pentagon", "correct": true },
      { "text": "Hexagon", "correct": false, "misconceptionId": "shape-pentagon-hexagon-confusion" },
      { "text": "Octagon", "correct": false, "misconceptionId": "shape-sides-count-confusion" },
      { "text": "Quadrilateral", "correct": false, "misconceptionId": "shape-sides-count-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A pentagon has 5 sides, a hexagon has 6, and an octagon has 8.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I always mix up pentagon (5) and hexagon (6).", "misconceptionId": "shape-pentagon-hexagon-confusion" }
    ]
  },
  {
    "id": "cam-s3-geom-02",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 3,
    "skillId": "shape-partitioning",
    "stem": "How many right angles (square corners) does a rectangle have?",
    "readAloudText": "How many right angles or square corners does a rectangle have?",
    "options": [
      { "text": "4", "correct": true },
      { "text": "2", "correct": false, "misconceptionId": "geometry-angle-pairs-confusion" },
      { "text": "0", "correct": false, "misconceptionId": "geometry-angle-concept-missing" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "All 4 corners of a rectangle are right angles.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Only 2 opposite corners are right angles.", "misconceptionId": "geometry-angle-pairs-confusion" }
    ]
  },
  {
    "id": "cam-s3-geom-03",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 3,
    "skillId": "shape-recognition",
    "stem": "Which 3D shape has 6 flat square faces and 8 vertices?",
    "readAloudText": "Which 3D shape has 6 flat square faces and 8 vertices?",
    "options": [
      { "text": "Cube", "correct": true },
      { "text": "Cylinder", "correct": false, "misconceptionId": "shape-2d-3d-confusion" },
      { "text": "Square-based pyramid", "correct": false, "misconceptionId": "shape-face-count-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A cube is like a dice: 6 square faces and 8 corner points.", "isCorrectReasoning": true },
      { "id": "r2", "text": "A pyramid has a square base, so I thought it had 6 square faces.", "misconceptionId": "shape-face-count-confusion" }
    ]
  },
  {
    "id": "cam-s3-geom-04",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 4,
    "skillId": "shape-partitioning",
    "stem": "A regular hexagon has how many lines of symmetry?",
    "readAloudText": "A regular hexagon has how many lines of symmetry?",
    "options": [
      { "text": "6", "correct": true },
      { "text": "1", "correct": false, "misconceptionId": "symmetry-single-vertical-only" },
      { "text": "3", "correct": false, "misconceptionId": "symmetry-half-count-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A regular hexagon has 6 sides, so it has 6 lines of symmetry.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Shapes only have one line of symmetry down the middle.", "misconceptionId": "symmetry-single-vertical-only" }
    ]
  },
  {
    "id": "cam-s3-geom-05",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 2,
    "skillId": "shape-recognition",
    "stem": "Which word describes an angle that is smaller than a right angle (90Â°)?",
    "readAloudText": "Which word describes an angle that is smaller than a right angle?",
    "options": [
      { "text": "Acute angle", "correct": true },
      { "text": "Obtuse angle", "correct": false, "misconceptionId": "angle-acute-obtuse-reversal" },
      { "text": "Straight line", "correct": false, "misconceptionId": "angle-type-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Acute angles are sharp and smaller than a square corner.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I mixed up acute and obtuse.", "misconceptionId": "angle-acute-obtuse-reversal" }
    ]
  },
  {
    "id": "cam-s3-geom-06",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 3,
    "skillId": "shape-recognition",
    "stem": "How many edges does a triangular prism have?",
    "readAloudText": "How many edges does a triangular prism have?",
    "options": [
      { "text": "9", "correct": true },
      { "text": "6", "correct": false, "misconceptionId": "shape-edges-vertices-confusion" },
      { "text": "5", "correct": false, "misconceptionId": "shape-faces-edges-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "3 edges on top triangle, 3 on bottom triangle, 3 connecting edges = 9.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I counted the vertices (corners) instead of the edges.", "misconceptionId": "shape-edges-vertices-confusion" }
    ]
  },
  {
    "id": "cam-s3-geom-07",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 3,
    "skillId": "shape-partitioning",
    "stem": "If you cut a square diagonally from corner to corner, what 2 shapes do you make?",
    "readAloudText": "If you cut a square diagonally from corner to corner, what 2 shapes do you make?",
    "options": [
      { "text": "2 right-angled triangles", "correct": true },
      { "text": "2 rectangles", "correct": false, "misconceptionId": "shape-partition-straight-cut-assumption" },
      { "text": "2 smaller squares", "correct": false, "misconceptionId": "shape-partition-preserves-parent-type" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A diagonal cut joins two corners, creating 2 triangles.", "isCorrectReasoning": true },
      { "id": "r2", "text": "Cutting a square in half always makes 2 rectangles.", "misconceptionId": "shape-partition-straight-cut-assumption" }
    ]
  },
  {
    "id": "cam-s3-geom-08",
    "stage": 3,
    "strand": "geometry",
    "difficulty": 4,
    "skillId": "shape-recognition",
    "stem": "A shape has 4 equal straight sides, but no right angles. What is it?",
    "readAloudText": "A shape has 4 equal straight sides, but no right angles. What is it?",
    "options": [
      { "text": "Rhombus", "correct": true },
      { "text": "Square", "correct": false, "misconceptionId": "shape-square-ignores-angle-constraint" },
      { "text": "Trapezium", "correct": false, "misconceptionId": "shape-quadrilateral-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A rhombus has 4 equal sides with slanted corners (no right angles).", "isCorrectReasoning": true },
      { "id": "r2", "text": "A square has 4 equal sides, so I picked square.", "misconceptionId": "shape-square-ignores-angle-constraint" }
    ]
  },
  {
    "id": "cam-s3-meas-01",
    "stage": 3,
    "strand": "measure",
    "difficulty": 2,
    "skillId": "perimeter-measurement",
    "stem": "A rectangle has sides of 5 cm and 3 cm. What is its perimeter?",
    "readAloudText": "A rectangle has sides of 5 centimetres and 3 centimetres. What is its perimeter?",
    "options": [
      { "text": "16 cm", "correct": true },
      { "text": "8 cm", "correct": false, "misconceptionId": "perimeter-added-two-sides-only" },
      { "text": "15 cm", "correct": false, "misconceptionId": "perimeter-area-confusion" },
      { "text": "20 cm", "correct": false, "misconceptionId": "perimeter-count-corners-twice" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Perimeter is the distance all the way around: 5 + 3 + 5 + 3 = 16 cm.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 5 + 3 = 8 cm.", "misconceptionId": "perimeter-added-two-sides-only" },
      { "id": "r3", "text": "I multiplied 5 Ã— 3 = 15 cm.", "misconceptionId": "perimeter-area-confusion" }
    ],
    "strategyProbe": "How did you find the perimeter?"
  },
  {
    "id": "cam-s3-meas-02",
    "stage": 3,
    "strand": "measure",
    "difficulty": 3,
    "skillId": "perimeter-measurement",
    "stem": "A square garden has a perimeter of 24 metres. How long is each side?",
    "readAloudText": "A square garden has a perimeter of 24 metres. How long is each side?",
    "options": [
      { "text": "6 m", "correct": true },
      { "text": "12 m", "correct": false, "misconceptionId": "perimeter-divided-by-two-not-four" },
      { "text": "4 m", "correct": false, "misconceptionId": "perimeter-confused-side-count" },
      { "text": "48 m", "correct": false, "misconceptionId": "multiplication-operation-slip" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A square has 4 equal sides, so 24 Ã· 4 = 6 m.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I divided 24 by 2 to get 12 m.", "misconceptionId": "perimeter-divided-by-two-not-four" }
    ]
  },
  {
    "id": "cam-s3-meas-03",
    "stage": 3,
    "strand": "measure",
    "difficulty": 2,
    "skillId": "clock-time-intervals",
    "stem": "The short hand points just past 3, and the long hand points to 6. What time is it?",
    "readAloudText": "The short hand points just past 3, and the long hand points to 6. What time is it?",
    "options": [
      { "text": "Half past 3 (3:30)", "correct": true },
      { "text": "6:15", "correct": false, "misconceptionId": "clock-hand-confusion" },
      { "text": "3:06", "correct": false, "misconceptionId": "clock-minute-hand-face-value" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "Short hand is hours (3), long hand on 6 means 30 minutes past.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I mixed up the hour and minute hands.", "misconceptionId": "clock-hand-confusion" },
      { "id": "r3", "text": "The long hand is on 6, so it means 6 minutes.", "misconceptionId": "clock-minute-hand-face-value" }
    ]
  },
  {
    "id": "cam-s3-meas-04",
    "stage": 3,
    "strand": "measure",
    "difficulty": 3,
    "skillId": "clock-time-intervals",
    "stem": "A film starts at 4:15 pm and lasts 45 minutes. What time does it end?",
    "readAloudText": "A film starts at 4:15 pm and lasts 45 minutes. What time does it end?",
    "options": [
      { "text": "5:00 pm", "correct": true },
      { "text": "4:60 pm", "correct": false, "misconceptionId": "time-base-100-error" },
      { "text": "4:45 pm", "correct": false, "misconceptionId": "time-added-duration-to-hour" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "15 minutes + 45 minutes = 60 minutes (1 hour), bringing 4:15 to 5:00.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 15 + 45 to get 60, writing 4:60.", "misconceptionId": "time-base-100-error" }
    ]
  },
  {
    "id": "cam-s3-meas-05",
    "stage": 3,
    "strand": "measure",
    "difficulty": 2,
    "skillId": "length-measurement-cm",
    "stem": "How many centimetres are there in 2 metres?",
    "readAloudText": "How many centimetres are there in 2 metres?",
    "options": [
      { "text": "200 cm", "correct": true },
      { "text": "20 cm", "correct": false, "misconceptionId": "units-metric-factor-10" },
      { "text": "2000 cm", "correct": false, "misconceptionId": "units-metric-factor-1000" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "1 metre has 100 centimetres, so 2 metres is 200 cm.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I thought there were 10 centimetres in 1 metre.", "misconceptionId": "units-metric-factor-10" }
    ]
  },
  {
    "id": "cam-s3-meas-06",
    "stage": 3,
    "strand": "measure",
    "difficulty": 3,
    "skillId": "mass-capacity-estimation",
    "stem": "Which unit of measurement would you use to measure the water in a swimming pool?",
    "readAloudText": "Which unit of measurement would you use to measure the water in a swimming pool?",
    "options": [
      { "text": "Litres (L)", "correct": true },
      { "text": "Millilitres (ml)", "correct": false, "misconceptionId": "units-scale-inappropriate" },
      { "text": "Kilograms (kg)", "correct": false, "misconceptionId": "units-mass-volume-confusion" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "A pool has a large liquid volume, so litres is the suitable measure.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I thought water is measured in kilograms.", "misconceptionId": "units-mass-volume-confusion" }
    ]
  },
  {
    "id": "cam-s3-meas-07",
    "stage": 3,
    "strand": "measure",
    "difficulty": 4,
    "skillId": "perimeter-measurement",
    "stem": "An equilateral triangle has sides of 7 cm each. What is its perimeter?",
    "readAloudText": "An equilateral triangle has sides of 7 centimetres each. What is its perimeter?",
    "options": [
      { "text": "21 cm", "correct": true },
      { "text": "14 cm", "correct": false, "misconceptionId": "perimeter-added-two-sides-only" },
      { "text": "28 cm", "correct": false, "misconceptionId": "perimeter-assumed-four-sides" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "3 sides of 7 cm is 3 Ã— 7 = 21 cm.", "isCorrectReasoning": true },
      { "id": "r2", "text": "I added 7 + 7 for only 2 sides.", "misconceptionId": "perimeter-added-two-sides-only" },
      { "id": "r3", "text": "I calculated 4 Ã— 7 = 28 as if it was a square.", "misconceptionId": "perimeter-assumed-four-sides" }
    ]
  },
  {
    "id": "cam-s3-meas-08",
    "stage": 3,
    "strand": "measure",
    "difficulty": 3,
    "skillId": "clock-time-intervals",
    "stem": "How many minutes are in 1 hour and 15 minutes?",
    "readAloudText": "How many minutes are in 1 hour and 15 minutes?",
    "options": [
      { "text": "75 minutes", "correct": true },
      { "text": "115 minutes", "correct": false, "misconceptionId": "time-base-100-error" },
      { "text": "25 minutes", "correct": false, "misconceptionId": "time-hour-confused-with-ten" }
    ],
    "reasoningOptions": [
      { "id": "r1", "text": "1 hour is 60 minutes, and 60 + 15 = 75 minutes.", "isCorrectReasoning": true },
      { "id": "r2", "text": "1 hour is 100 minutes, so 100 + 15 = 115.", "misconceptionId": "time-base-100-error" }
    ]
  }
]
;
export const BUNDLED_PREREQ_GRAPH = {
  "skills": {
    "fraction-comparison": {
      "id": "fraction-comparison",
      "name": "Comparing Unit Fractions",
      "stage": 3,
      "strand": "fractions",
      "description": "Comparing unit fractions like 1/4 and 1/8 using visual and numerical models",
      "prerequisites": ["fraction-equal-parts", "division-sharing"],
      "commonMisconceptions": ["fraction-bigger-denominator-bigger-value"],
      "rootCauseAdvice": "Check whether the child visualises fractions as slices of a whole cake or as standalone whole numbers."
    },
    "fraction-equal-parts": {
      "id": "fraction-equal-parts",
      "name": "Fractions as Equal Parts of a Whole",
      "stage": 2,
      "strand": "fractions",
      "description": "Recognising that fractions require equal-sized divisions",
      "prerequisites": ["division-sharing", "shape-partitioning"],
      "commonMisconceptions": ["fraction-count-pieces-ignoring-size"],
      "rootCauseAdvice": "Use hands-on folding of paper strips into halves and quarters."
    },
    "division-sharing": {
      "id": "division-sharing",
      "name": "Equal Sharing & Grouping",
      "stage": 2,
      "strand": "number",
      "description": "Understanding sharing items equally into groups",
      "prerequisites": ["counting-cardinality"],
      "commonMisconceptions": ["division-remainder-ignored"],
      "rootCauseAdvice": "Physical sharing with counters, stones, or pasta shells at home."
    },
    "shape-partitioning": {
      "id": "shape-partitioning",
      "name": "2D Shape Partitioning",
      "stage": 1,
      "strand": "geometry",
      "description": "Cutting shapes into 2 or 4 equal pieces",
      "prerequisites": ["shape-recognition"],
      "commonMisconceptions": ["shape-halves-unequal"],
      "rootCauseAdvice": "Drawing mirror lines and cutting paper sandwiches."
    },
    "place-value-3digit": {
      "id": "place-value-3digit",
      "name": "3-Digit Place Value & Decomposition",
      "stage": 3,
      "strand": "number",
      "description": "Understanding hundreds, tens, and ones in numbers up to 1000",
      "prerequisites": ["place-value-2digit", "number-line-estimation"],
      "commonMisconceptions": ["place-value-column-reversal", "place-value-zero-as-nothing"],
      "rootCauseAdvice": "Base-10 block building and expanded notation cards (e.g. 300 + 40 + 5)."
    },
    "place-value-2digit": {
      "id": "place-value-2digit",
      "name": "2-Digit Place Value",
      "stage": 2,
      "strand": "number",
      "description": "Understanding tens and ones",
      "prerequisites": ["counting-to-100"],
      "commonMisconceptions": ["place-value-digit-concatenation"],
      "rootCauseAdvice": "Bundling ten sticks with elastic bands."
    },
    "subtraction-regrouping": {
      "id": "subtraction-regrouping",
      "name": "Subtraction with Regrouping (Exchanging)",
      "stage": 3,
      "strand": "operations",
      "description": "Subtracting 2-digit and 3-digit numbers requiring exchange across tens",
      "prerequisites": ["place-value-2digit", "subtraction-without-regrouping"],
      "commonMisconceptions": ["subtraction-smaller-from-larger-regardless-of-order"],
      "rootCauseAdvice": "Physically exchanging one 10-rod for ten unit cubes before subtracting."
    },
    "subtraction-without-regrouping": {
      "id": "subtraction-without-regrouping",
      "name": "Basic Subtraction & Difference",
      "stage": 2,
      "strand": "operations",
      "description": "Subtracting within 20 and 50 without borrowing",
      "prerequisites": ["counting-backward", "number-bonds-10"],
      "commonMisconceptions": ["subtraction-addition-confusion"],
      "rootCauseAdvice": "Walking backward along a chalk number line."
    },
    "multiplication-arrays": {
      "id": "multiplication-arrays",
      "name": "Multiplication as Equal Arrays",
      "stage": 3,
      "strand": "operations",
      "description": "Recognising 3 groups of 4 as an array and related to repeated addition",
      "prerequisites": ["repeated-addition", "skip-counting"],
      "commonMisconceptions": ["multiplication-adds-factors"],
      "rootCauseAdvice": "Arranging muffin tins, egg boxes, or LEGO pegs in neat grid rows."
    },
    "perimeter-measurement": {
      "id": "perimeter-measurement",
      "name": "Perimeter of Rectilinear Shapes",
      "stage": 3,
      "strand": "measure",
      "description": "Calculating distance around a boundary",
      "prerequisites": ["length-measurement-cm", "shape-boundary"],
      "commonMisconceptions": ["perimeter-area-confusion", "perimeter-count-corners-twice"],
      "rootCauseAdvice": "Tracing around objects with a piece of string, then measuring the string against a ruler."
    },
    "clock-time-intervals": {
      "id": "clock-time-intervals",
      "name": "Time to 5 Minutes & Intervals",
      "stage": 3,
      "strand": "measure",
      "description": "Reading analogue clock to 5 minutes and calculating simple elapsed time",
      "prerequisites": ["clock-hour-half-hour", "skip-counting-by-5"],
      "commonMisconceptions": ["clock-hand-confusion", "time-base-100-error"],
      "rootCauseAdvice": "Real analogue clock play with separate hour and minute hands."
    }
  }
}
;
export const BUNDLED_PLAN_TEMPLATES = {
  "approaches": {
    "concrete-pictorial-abstract": {
      "name": "Concrete-Pictorial-Abstract (CPA)",
      "rationale": "Transitions physical objects (counters, bread slices) to sketches before abstract numbers."
    },
    "think-aloud": {
      "name": "Think-Aloud & Metacognitive Prompts",
      "rationale": "Helps child verbalise their inner reasoning without fear of wrong answers."
    },
    "worked-examples": {
      "name": "Worked Examples & Error Analysis",
      "rationale": "Looking at solved examples together relieves performance anxiety and clarifies rules."
    },
    "open-ended-creative": {
      "name": "Open-Ended Creative Explorations",
      "rationale": "Harnesses natural curiosity and multiple representations."
    }
  },
  "strands": {
    "fractions": {
      "focus": "Visualising Fractions as Sharing Wholes",
      "weeks": [
        {
          "week": 1,
          "focus": "Hands-on Slicing & Equal Sharing",
          "activities": [
            "Fold a paper napkin into 4 pieces, then fold another into 8 pieces. Lay them side by side to see which single piece is larger.",
            "Share 8 strawberries between 4 soft toys. Count how many each friend receives."
          ],
          "askYourChild": "If more friends come to share the pizza, do the slices get bigger or smaller?"
        },
        {
          "week": 2,
          "focus": "Drawing Fraction Strips",
          "activities": [
            "Draw a long chocolate bar on paper. Colour in 1/2 with blue and 1/4 with yellow. Talk about how many 1/4 pieces fit in 1/2.",
            "Find things around the house that are half-full or quarter-full."
          ],
          "askYourChild": "How can we prove that two quarters are the same as one half?"
        },
        {
          "week": 3,
          "focus": "Fractions of Everyday Quantities",
          "activities": [
            "Count 12 spoons. Find half (6 spoons) and one quarter (3 spoons) by making equal piles.",
            "Bake or make toast together, cutting toast into four triangular quarters."
          ],
          "askYourChild": "What is your favourite way to divide a sandwich?"
        },
        {
          "week": 4,
          "focus": "Celebration & Creative Fraction Art",
          "activities": [
            "Create a 'Fraction Monster' using cut paper shapes of halves and quarters.",
            "Invent a fraction riddle for someone in your family to solve."
          ],
          "askYourChild": "What was the most surprising thing you discovered about fractions this month?"
        }
      ]
    },
    "number": {
      "focus": "Place Value & Mental Decomposition",
      "weeks": [
        {
          "week": 1,
          "focus": "Spotting the Value of Hundreds and Tens",
          "activities": [
            "Look for 3-digit house numbers or speed signs on a walk. Call out the tens digit.",
            "Make 3-digit numbers using playing cards (Aces = 1, omit 10/face cards)."
          ],
          "askYourChild": "In the number 472, what does the 7 really stand for?"
        },
        {
          "week": 2,
          "focus": "Zero as the Silent Place Holder",
          "activities": [
            "Write 58 on paper. Slide a 0 into the middle to make 508. Talk about why the 5 moved to the hundreds place.",
            "Count up by tens starting from 290 to cross into 300."
          ],
          "askYourChild": "What would happen to 508 if the zero fell out of the middle?"
        },
        {
          "week": 3,
          "focus": "Splitting Numbers for Quick Addition",
          "activities": [
            "Practise splitting numbers: 45 is 40 and 5. Try adding 23 by adding 20 first, then 3.",
            "Estimate prices to the nearest 10 during grocery trips."
          ],
          "askYourChild": "How does your brain like to break up big numbers?"
        },
        {
          "week": 4,
          "focus": "Number Riddles & Confidence",
          "activities": [
            "Play 'I am thinking of a 3-digit number with 6 hundreds and an even number of ones'.",
            "Write a secret number code for a grown-up to guess."
          ],
          "askYourChild": "Can you make a tricky number riddle for me?"
        }
      ]
    },
    "enrichment": {
      "focus": "Open-Ended Problem Solving & Deepening Curiosity",
      "weeks": [
        {
          "week": 1,
          "focus": "Patterns in Nature & Geometry",
          "activities": [
            "Look for tessellations and repeating tiles around your home or pavement.",
            "Draw repeating patterns using simple triangles and squares."
          ],
          "askYourChild": "Where can we see math hiding outside today?"
        },
        {
          "week": 2,
          "focus": "Inventing Math Games",
          "activities": [
            "Design a board game with cardboard where moving forward requires solving a riddle.",
            "Create a dice game with custom rules for doubling points."
          ],
          "askYourChild": "What rule would make our game the most fun to play?"
        },
        {
          "week": 3,
          "focus": "Strategy & Estimation Challenges",
          "activities": [
            "Estimate how many footsteps it takes to walk from the front door to the kitchen.",
            "Test three different ways to group and count a large jar of pasta shells."
          ],
          "askYourChild": "Which counting shortcut felt the most satisfying?"
        },
        {
          "week": 4,
          "focus": "Creative STEM Inventions",
          "activities": [
            "Build the tallest freestanding tower using only rolled newspaper and tape.",
            "Write or draw an invention that solves a small problem around the house."
          ],
          "askYourChild": "What was the most exciting thing you designed this week?"
        }
      ]
    }
  }
}
;
export const BUNDLED_RESOURCE_MAP = {
  "resources": [
    {
      "strand": "fractions",
      "misconceptionId": "fraction-bigger-denominator-bigger-value",
      "title": "Mentara Visual Fraction Balancer (Interactive Simulation)",
      "url": "https://mentp.com/simulations/stage3/fraction-balancer",
      "description": "An interactive digital simulation where children drag and slice virtual pizzas to discover why 1/4 is bigger than 1/8.",
      "type": "Simulation"
    },
    {
      "strand": "fractions",
      "misconceptionId": "fraction-equal-parts",
      "title": "Stage 3 Equal Sharing & Slicing Guided Practice Set",
      "url": "https://mentp.com/worksheets/stage3/fractions-equal-sharing",
      "description": "Short, printable 10-minute exploration sheets using visual bars and concrete drawings.",
      "type": "Worksheet Set"
    },
    {
      "strand": "number",
      "misconceptionId": "place-value-column-reversal",
      "title": "Mentara Place Value Block Builder",
      "url": "https://mentp.com/simulations/stage3/place-value-blocks",
      "description": "Children combine and decompose hundreds flats, ten rods, and unit cubes.",
      "type": "Simulation"
    },
    {
      "strand": "operations",
      "misconceptionId": "subtraction-smaller-from-larger-regardless-of-order",
      "title": "Exchanging & Regrouping Step-by-Step Cards",
      "url": "https://mentp.com/worksheets/stage3/subtraction-exchanging",
      "description": "Illustrated worked examples illustrating exchanging a ten rod before subtracting ones.",
      "type": "Worksheet Set"
    },
    {
      "strand": "enrichment",
      "misconceptionId": null,
      "title": "Mentara Primary Math Explorers Studio",
      "url": "https://mentp.com/simulations/stage3/math-explorers",
      "description": "Open-ended geometry patterns, symmetry puzzles, and creative math challenges.",
      "type": "Enrichment Simulation"
    }
  ]
}
;
export const BUNDLED_RESPONSE_BANK = {
  "categories": {
    "container": ["pencil holder", "drinking water", "holding coins", "holding paint", "seed planter", "snack cup", "scoop for flour"],
    "sound_music": ["telephone with string", "drum shaker with beans", "megaphone", "amplifier for speaker", "ear horn"],
    "building_craft": ["castle tower", "robot head", "stacking pyramid", "party hat", "mini lantern", "puppet face"],
    "games_toys": ["target game", "ball catching cup", "bowling pins", "cup stacking game", "spinning top"],
    "tools_gadgets": ["cookie cutter", "magnifying stand", "funnel", "pencil sharpener bin", "sundial base"],
    "nature_outdoors": ["bird feeder", "bug catcher with air holes", "plant protector against frost", "watering pot"]
  },
  "commonResponses": [
    "drinking water", "pencil holder", "holding coins", "holding paint", "stacking tower", "plant pot"
  ],
  "rareResponses": [
    "bug catcher with air holes", "sundial base", "telephone with string", "cookie cutter", "puppet face", "mini lantern"
  ]
}
;
export const BUNDLED_FIXTURES = {
  careful: {
  "id": "sess_careful_01",
  "parentData": {
    "firstName": "Oliver",
    "stage": 3,
    "ageBand": "7-8",
    "parentEmail": "parent.oliver@example.com"
  },
  "isPartial": false,
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "creativityIdeas": ["pencil holder", "drinking cup", "mini flower pot"],
  "events": [
    { "itemId": "cam-s3-num-01", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 14000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-num-02", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 16000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-frac-01", "strand": "fractions", "difficulty": 2, "correct": true, "latencyMs": 18000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-frac-02", "strand": "fractions", "difficulty": 3, "correct": true, "latencyMs": 21000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-ops-01", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 19000, "confidence": 3, "skipped": false, "strategyUsed": "splitting" },
    { "itemId": "cam-s3-ops-02", "strand": "operations", "difficulty": 3, "correct": true, "latencyMs": 24000, "confidence": 3, "skipped": false, "strategyUsed": "splitting" },
    { "itemId": "cam-s3-geom-01", "strand": "geometry", "difficulty": 2, "correct": true, "latencyMs": 12000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-meas-01", "strand": "measure", "difficulty": 2, "correct": true, "latencyMs": 16000, "confidence": 3, "skipped": false },
    { "itemId": "persistence-stone-puzzle", "strand": "persistence", "correct": true, "latencyMs": 42000, "attempts": 5, "hintsUsed": 1, "skipped": false },
    { "itemId": "curiosity-tile-c1", "strand": "curiosity", "correct": true, "latencyMs": 6000, "skipped": false },
    { "itemId": "empathy-1", "strand": "empathy", "correct": true, "response": "immediate-helping", "latencyMs": 8000, "skipped": false }
  ]
}
,
  quick: {
  "id": "sess_quick_02",
  "parentData": {
    "firstName": "Leo",
    "stage": 3,
    "ageBand": "7-8",
    "parentEmail": "parent.leo@example.com"
  },
  "isPartial": false,
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "creativityIdeas": ["drum shaker", "castle tower"],
  "events": [
    { "itemId": "cam-s3-num-01", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 1800, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-num-03", "strand": "number", "difficulty": 3, "correct": false, "latencyMs": 2100, "confidence": 3, "skipped": false, "reasoningMisconceptionId": "place-value-confused-ten-with-one" },
    { "itemId": "cam-s3-frac-01", "strand": "fractions", "difficulty": 2, "correct": false, "latencyMs": 1900, "confidence": 3, "skipped": false, "reasoningMisconceptionId": "fraction-bigger-denominator-bigger-value" },
    { "itemId": "cam-s3-ops-01", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 2200, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-ops-07", "strand": "operations", "difficulty": 4, "correct": false, "latencyMs": 2400, "confidence": 3, "skipped": false, "reasoningMisconceptionId": "multiplication-adds-factors" },
    { "itemId": "cam-s3-geom-01", "strand": "geometry", "difficulty": 2, "correct": true, "latencyMs": 1900, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-meas-01", "strand": "measure", "difficulty": 2, "correct": false, "latencyMs": 2000, "confidence": 3, "skipped": false, "reasoningMisconceptionId": "perimeter-added-two-sides-only" },
    { "itemId": "persistence-stone-puzzle", "strand": "persistence", "correct": false, "latencyMs": 12000, "attempts": 2, "hintsUsed": 0, "skipped": true },
    { "itemId": "empathy-1", "strand": "empathy", "correct": true, "response": "immediate-helping", "latencyMs": 3000, "skipped": false }
  ]
}
,
  unsure: {
  "id": "sess_unsure_03",
  "parentData": {
    "firstName": "Aarav",
    "stage": 3,
    "ageBand": "7-8",
    "parentEmail": "parent.aarav@example.com"
  },
  "isPartial": false,
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "creativityIdeas": ["telescope", "cup telephone", "holding seeds", "scoop for sand"],
  "events": [
    { "itemId": "cam-s3-num-01", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 11000, "confidence": 1, "skipped": false },
    { "itemId": "cam-s3-num-02", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 13000, "confidence": 1, "skipped": false },
    { "itemId": "cam-s3-frac-01", "strand": "fractions", "difficulty": 2, "correct": true, "latencyMs": 14000, "confidence": 1, "skipped": false },
    { "itemId": "cam-s3-frac-03", "strand": "fractions", "difficulty": 2, "correct": true, "latencyMs": 12000, "confidence": 1, "skipped": false },
    { "itemId": "cam-s3-ops-01", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 16000, "confidence": 2, "skipped": false, "strategyUsed": "splitting" },
    { "itemId": "cam-s3-ops-03", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 15000, "confidence": 1, "skipped": false },
    { "itemId": "cam-s3-geom-01", "strand": "geometry", "difficulty": 2, "correct": true, "latencyMs": 9000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-meas-01", "strand": "measure", "difficulty": 2, "correct": true, "latencyMs": 14000, "confidence": 1, "skipped": false },
    { "itemId": "persistence-stone-puzzle", "strand": "persistence", "correct": true, "latencyMs": 28000, "attempts": 3, "hintsUsed": 1, "skipped": false },
    { "itemId": "curiosity-tile-c1", "strand": "curiosity", "correct": true, "latencyMs": 6000, "skipped": false },
    { "itemId": "empathy-1", "strand": "empathy", "correct": true, "response": "perspective-caring", "latencyMs": 7000, "skipped": false }
  ]
}
,
  gaps: {
  "id": "sess_gaps_04",
  "parentData": {
    "firstName": "Maya",
    "stage": 3,
    "ageBand": "7-8",
    "parentEmail": "parent.maya@example.com"
  },
  "isPartial": false,
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "creativityIdeas": ["water cup", "flower pot"],
  "events": [
    { "itemId": "cam-s3-num-01", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 8000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-num-02", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 9000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-frac-01", "strand": "fractions", "difficulty": 2, "correct": false, "latencyMs": 11000, "confidence": 3, "skipped": false, "reasoningId": "r2", "reasoningMisconceptionId": "fraction-bigger-denominator-bigger-value" },
    { "itemId": "cam-s3-frac-02", "strand": "fractions", "difficulty": 3, "correct": false, "latencyMs": 12000, "confidence": 3, "skipped": false, "reasoningId": "r2", "reasoningMisconceptionId": "fraction-bigger-denominator-bigger-value" },
    { "itemId": "cam-s3-frac-05", "strand": "fractions", "difficulty": 3, "correct": false, "latencyMs": 10000, "confidence": 2, "skipped": false, "reasoningMisconceptionId": "fraction-bigger-denominator-bigger-value" },
    { "itemId": "cam-s3-ops-01", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 14000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-geom-01", "strand": "geometry", "difficulty": 2, "correct": true, "latencyMs": 7000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-meas-01", "strand": "measure", "difficulty": 2, "correct": true, "latencyMs": 11000, "confidence": 2, "skipped": false },
    { "itemId": "persistence-stone-puzzle", "strand": "persistence", "correct": true, "latencyMs": 31000, "attempts": 3, "hintsUsed": 1, "skipped": false }
  ]
}
,
  explorer: {
  "id": "sess_explorer_05",
  "parentData": {
    "firstName": "Zara",
    "stage": 3,
    "ageBand": "7-8",
    "parentEmail": "parent.zara@example.com"
  },
  "isPartial": false,
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "creativityIdeas": [
    "bug catcher with air holes", 
    "sundial base", 
    "telephone with string", 
    "cookie cutter", 
    "puppet face", 
    "mini lantern", 
    "sound shaker with beans", 
    "castle tower"
  ],
  "events": [
    { "itemId": "cam-s3-num-01", "strand": "number", "difficulty": 2, "correct": true, "latencyMs": 9000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-frac-01", "strand": "fractions", "difficulty": 2, "correct": true, "latencyMs": 11000, "confidence": 2, "skipped": false },
    { "itemId": "cam-s3-ops-03", "strand": "operations", "difficulty": 2, "correct": true, "latencyMs": 12000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-geom-01", "strand": "geometry", "difficulty": 2, "correct": true, "latencyMs": 8000, "confidence": 3, "skipped": false },
    { "itemId": "cam-s3-meas-01", "strand": "measure", "difficulty": 2, "correct": true, "latencyMs": 10000, "confidence": 3, "skipped": false },
    { "itemId": "persistence-stone-puzzle", "strand": "persistence", "correct": true, "latencyMs": 25000, "attempts": 2, "hintsUsed": 0, "skipped": false },
    { "itemId": "curiosity-tile-c1", "strand": "curiosity", "correct": true, "latencyMs": 7000, "skipped": false },
    { "itemId": "curiosity-tile-c2", "strand": "curiosity", "correct": true, "latencyMs": 6000, "skipped": false },
    { "itemId": "curiosity-tile-c3", "strand": "curiosity", "correct": true, "latencyMs": 8000, "skipped": false },
    { "itemId": "empathy-1", "strand": "empathy", "correct": true, "response": "inclusive-invitation", "latencyMs": 5000, "skipped": false }
  ]
}

};

export const BUNDLED_DIAGNOSTIC_TASKS = [
  {
    "id": "diag-spatial-pattern",
    "strand": "spatial-intuition",
    "category": "Spatial Pattern Probe",
    "title": "The Mysterious Mosaic",
    "stem": "Study the ancient stone mosaic. Notice how each row and column changes. Which carved stone tile belongs in the empty glowing spot (?)?",
    "readAloudText": "Study the ancient stone mosaic. Notice how each row and column changes. Which carved stone tile belongs in the empty glowing spot with the question mark?",
    "visualHtml": "<div class=\"mosaic-container\" style=\"background: #F5EFEB; border: 2px solid #DECFC4; border-radius: 16px; padding: 18px; max-width: 480px; margin: 12px auto 20px; box-shadow: inset 0 2px 6px rgba(0,0,0,0.04); text-align: center;\"><div style=\"font-size: 0.85rem; font-weight: 800; color: #4F7F86; margin-bottom: 12px; letter-spacing: 0.05em; text-transform: uppercase;\">🏛️ Ancient Floor Mosaic (3 × 3 Grid)</div><div class=\"mosaic-grid\" style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 320px; margin: 0 auto;\"><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 1: Circle with Dot\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><circle cx=\"30\" cy=\"30\" r=\"24\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"30\" r=\"6\" fill=\"#E29B63\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 1: Square with Dot\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><rect x=\"8\" y=\"8\" width=\"44\" height=\"44\" rx=\"6\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"30\" r=\"6\" fill=\"#E29B63\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 1: Triangle with Dot\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><polygon points=\"30,8 54,50 6,50\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"35\" r=\"6\" fill=\"#E29B63\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 2: Circle with Plus\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><circle cx=\"30\" cy=\"30\" r=\"24\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><line x1=\"18\" y1=\"30\" x2=\"42\" y2=\"30\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"18\" x2=\"30\" y2=\"42\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 2: Square with Plus\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><rect x=\"8\" y=\"8\" width=\"44\" height=\"44\" rx=\"6\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><line x1=\"18\" y1=\"30\" x2=\"42\" y2=\"30\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"18\" x2=\"30\" y2=\"42\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 2: Triangle with Plus\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><polygon points=\"30,8 54,50 6,50\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><line x1=\"18\" y1=\"35\" x2=\"42\" y2=\"35\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"30\" y1=\"23\" x2=\"30\" y2=\"47\" stroke=\"#E29B63\" stroke-width=\"4\" stroke-linecap=\"round\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 3: Circle with Diamond\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><circle cx=\"30\" cy=\"30\" r=\"24\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><polygon points=\"30,19 41,30 30,41 19,30\" fill=\"#E29B63\"/></svg></div><div class=\"mosaic-tile\" style=\"background:#FFFFFF; border:2px solid #8FA998; border-radius:10px; padding:8px; display:flex; align-items:center; justify-content:center;\" title=\"Row 3: Square with Diamond\"><svg viewBox=\"0 0 60 60\" width=\"56\" height=\"56\"><rect x=\"8\" y=\"8\" width=\"44\" height=\"44\" rx=\"6\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><polygon points=\"30,19 41,30 30,41 19,30\" fill=\"#E29B63\"/></svg></div><div class=\"mosaic-tile mosaic-missing\" style=\"border: 3px dashed #E29B63; background: #FFF9F2; border-radius: 10px; display: flex; align-items: center; justify-content: center; height: 72px; box-shadow: 0 0 10px rgba(226,155,99,0.25);\"><span style=\"font-size: 2rem; font-weight: 900; color: #E29B63;\">?</span></div></div></div>",
    "options": [
      {
        "text": "Triangle with Diamond",
        "correct": true,
        "trait": "spatial-systematic",
        "visual": "<svg viewBox=\"0 0 60 60\" width=\"44\" height=\"44\"><polygon points=\"30,8 54,50 6,50\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><polygon points=\"30,24 41,35 30,46 19,35\" fill=\"#E29B63\"/></svg>"
      },
      {
        "text": "Triangle with Dot",
        "correct": false,
        "trait": "row-slip",
        "visual": "<svg viewBox=\"0 0 60 60\" width=\"44\" height=\"44\"><polygon points=\"30,8 54,50 6,50\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><circle cx=\"30\" cy=\"35\" r=\"6\" fill=\"#E29B63\"/></svg>"
      },
      {
        "text": "Square with Diamond",
        "correct": false,
        "trait": "column-slip",
        "visual": "<svg viewBox=\"0 0 60 60\" width=\"44\" height=\"44\"><rect x=\"8\" y=\"8\" width=\"44\" height=\"44\" rx=\"6\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><polygon points=\"30,19 41,30 30,41 19,30\" fill=\"#E29B63\"/></svg>"
      },
      {
        "text": "Circle with Star",
        "correct": false,
        "trait": "divergent-guess",
        "visual": "<svg viewBox=\"0 0 60 60\" width=\"44\" height=\"44\"><circle cx=\"30\" cy=\"30\" r=\"24\" fill=\"#EDF5F0\" stroke=\"#4F7F86\" stroke-width=\"3\"/><polygon points=\"30,15 34,25 45,25 36,32 39,43 30,36 21,43 24,32 15,25 26,25\" fill=\"#E29B63\"/></svg>"
      }
    ],
    "reflectionPrompt": "What was your brain doing as you worked out the missing tile?",
    "reflectionOptions": [
      { "id": "ref-visual", "text": "I looked across the rows and down the columns like a map.", "mindStyle": "visual-spatial" },
      { "id": "ref-rule", "text": "I checked the shape rule first, then matched the symbol inside.", "mindStyle": "analytic-deductive" },
      { "id": "ref-gut", "text": "My eye instantly jumped to the one that felt right without counting.", "mindStyle": "intuitive-holistic" },
      { "id": "ref-elim", "text": "I spotted the ones that were clearly wrong and ruled them out.", "mindStyle": "evaluative-pragmatic" }
    ]
  },
  {
    "id": "diag-detective-logic",
    "strand": "deductive-logic",
    "category": "Deductive Logic Probe",
    "title": "The Whispering Stream Footprints",
    "stem": "Three animal friends crossed the whispering stream at dawn. Read the clues on the wooden signs. Who made it across first?",
    "readAloudText": "Three animal friends crossed the whispering stream at dawn. Read the clues on the wooden signs. Who made it across first?",
    "visualHtml": "<div class=\"stream-scene-box\" style=\"background: #EBF3F5; border: 2px solid #C8DFE3; border-radius: 16px; padding: 18px 22px; max-width: 520px; margin: 12px auto 20px;\"><div style=\"display: flex; justify-content: space-around; align-items: center; margin-bottom: 14px; background: #FFFFFF; border-radius: 12px; padding: 12px; border: 1px solid #D7E8EB;\"><div style=\"text-align: center;\"><div style=\"font-size: 2.2rem;\">🦡</div><div style=\"font-size: 0.85rem; font-weight: 800; color: #26333A;\">Badger</div></div><div style=\"font-size: 1.4rem; color: #8FA998;\">〰️</div><div style=\"text-align: center;\"><div style=\"font-size: 2.2rem;\">🦉</div><div style=\"font-size: 0.85rem; font-weight: 800; color: #26333A;\">Owl</div></div><div style=\"font-size: 1.4rem; color: #8FA998;\">〰️</div><div style=\"text-align: center;\"><div style=\"font-size: 2.2rem;\">🦊</div><div style=\"font-size: 0.85rem; font-weight: 800; color: #26333A;\">Fox</div></div></div><div style=\"background: #FCFBF9; border-radius: 10px; padding: 12px 16px; border: 1px solid #E4DDD3; display: flex; flex-direction: column; gap: 8px;\"><div style=\"display: flex; gap: 10px; align-items: center;\"><span style=\"font-size: 1.2rem;\">🪵</span><span style=\"font-size: 0.95rem; font-weight: 600; color: #26333A;\"><strong>Sign 1:</strong> The <strong>Owl</strong> crossed after the <strong>Badger</strong>.</span></div><div style=\"display: flex; gap: 10px; align-items: center;\"><span style=\"font-size: 1.2rem;\">🪵</span><span style=\"font-size: 0.95rem; font-weight: 600; color: #26333A;\"><strong>Sign 2:</strong> The <strong>Fox</strong> crossed after the <strong>Owl</strong>.</span></div></div></div>",
    "options": [
      {
        "text": "The Badger",
        "correct": true,
        "trait": "sequential-deduction",
        "visual": "<span style=\"font-size: 2rem;\">🦡</span>"
      },
      {
        "text": "The Owl",
        "correct": false,
        "trait": "middle-capture",
        "visual": "<span style=\"font-size: 2rem;\">🦉</span>"
      },
      {
        "text": "The Fox",
        "correct": false,
        "trait": "recency-bias",
        "visual": "<span style=\"font-size: 2rem;\">🦊</span>"
      },
      {
        "text": "They all crossed together",
        "correct": false,
        "trait": "harmony-bias",
        "visual": "<span style=\"font-size: 2rem;\">🐾</span>"
      }
    ],
    "reflectionPrompt": "How did you find the order in your head?",
    "reflectionOptions": [
      { "id": "ref-timeline", "text": "I built a line in my head: 1st Badger, 2nd Owl, 3rd Fox.", "mindStyle": "structured-linear" },
      { "id": "ref-story", "text": "I pictured a movie in my mind of the animals walking across.", "mindStyle": "narrative-imaginative" },
      { "id": "ref-elim", "text": "I read Sign 1 and immediately knew Fox and Owl were not first.", "mindStyle": "elimination-pragmatic" },
      { "id": "ref-quick", "text": "I made a quick, confident guess from the first clue I saw.", "mindStyle": "spontaneous-bold" }
    ]
  },
  {
    "id": "diag-ambiguity-fork",
    "strand": "decision-temperament",
    "category": "Learning Temperament Probe",
    "title": "The Fork in the Forest",
    "stem": "You and your friends arrive at an uncharted valley. Look at the four trails ahead. Which path sounds most exciting to explore?",
    "readAloudText": "You and your friends arrive at an uncharted valley. Look at the four trails ahead. Which path sounds most exciting to explore?",
    "visualHtml": "<div class=\"fork-paths-grid\" style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px auto 20px; max-width: 560px;\"><div style=\"background: #FCFBF7; border: 2px solid #E9E2D6; border-radius: 14px; padding: 14px; text-align: center;\"><div style=\"font-size: 2.2rem; margin-bottom: 4px;\">🏮</div><div style=\"font-weight: 800; color: #26333A; font-size: 0.95rem;\">The Lantern Trail</div><div style=\"font-size: 0.8rem; color: #5B6D74; margin-top: 4px;\">Clear stepping stones & lit lanterns. Peaceful, safe, reliable destination.</div></div><div style=\"background: #F3F7F8; border: 2px solid #D2E4E7; border-radius: 14px; padding: 14px; text-align: center;\"><div style=\"font-size: 2.2rem; margin-bottom: 4px;\">💎</div><div style=\"font-weight: 800; color: #26333A; font-size: 0.95rem;\">The Crystal Cavern</div><div style=\"font-size: 0.8rem; color: #5B6D74; margin-top: 4px;\">Sparkling dark caves. Full of surprises, twists, and hidden treasures.</div></div><div style=\"background: #F2F7F3; border: 2px solid #D3E7D7; border-radius: 14px; padding: 14px; text-align: center;\"><div style=\"font-size: 2.2rem; margin-bottom: 4px;\">🌲</div><div style=\"font-weight: 800; color: #26333A; font-size: 0.95rem;\">The Wild Ridge</div><div style=\"font-size: 0.8rem; color: #5B6D74; margin-top: 4px;\">No path exists at all. You climb, invent, and create your own route.</div></div><div style=\"background: #FAF6F0; border: 2px solid #EBDCCF; border-radius: 14px; padding: 14px; text-align: center;\"><div style=\"font-size: 2.2rem; margin-bottom: 4px;\">🗺️</div><div style=\"font-weight: 800; color: #26333A; font-size: 0.95rem;\">The Mapmaker's Post</div><div style=\"font-size: 0.8rem; color: #5B6D74; margin-top: 4px;\">Stop, look through the telescope, draw a map, and agree as a group first.</div></div></div>",
    "options": [
      {
        "text": "The Lantern Trail — Clear steps, reliable, and peaceful.",
        "trait": "deliberate-structured",
        "visual": "<span style=\"font-size: 1.8rem;\">🏮</span>"
      },
      {
        "text": "The Crystal Cavern — Dark mystery, surprises, and secret treasures.",
        "trait": "adventurous-exploratory",
        "visual": "<span style=\"font-size: 1.8rem;\">💎</span>"
      },
      {
        "text": "The Wild Ridge — Inventing our own trail through the wild trees.",
        "trait": "autonomous-inventor",
        "visual": "<span style=\"font-size: 1.8rem;\">🌲</span>"
      },
      {
        "text": "The Mapmaker's Post — Observing first, drawing a plan, and coordinating.",
        "trait": "collaborative-observational",
        "visual": "<span style=\"font-size: 1.8rem;\">🗺️</span>"
      }
    ],
    "reflectionPrompt": "What makes this choice feel like you?",
    "reflectionOptions": [
      { "id": "ref-p1", "text": "I feel happiest when I know what steps come next without confusion.", "mindStyle": "structured-clarity" },
      { "id": "ref-p2", "text": "I love discoveries, surprises, and figuring out mysteries.", "mindStyle": "novelty-seeking" },
      { "id": "ref-p3", "text": "I like doing things my own unique way rather than copying someone else.", "mindStyle": "creative-independent" },
      { "id": "ref-p4", "text": "I like pausing to see the whole picture before jumping into action.", "mindStyle": "reflective-strategic" }
    ]
  },
  {
    "id": "diag-balance-weights",
    "strand": "relational-intuition",
    "category": "Relational Reasoning Probe",
    "title": "The Antique Balance Scale",
    "stem": "Look at the two balance scales. Both are perfectly level. How many Silver Stars will balance 1 Purple Sun Gem?",
    "readAloudText": "Look at the two balance scales. Both are perfectly level. How many Silver Stars will balance 1 Purple Sun Gem?",
    "visualHtml": "<div class=\"scale-display-box\" style=\"background: #FDFCF7; border: 2px solid #E8DFD3; border-radius: 16px; padding: 16px 20px; max-width: 520px; margin: 12px auto 20px;\"><div style=\"display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #ECE3D7; border-radius: 12px; padding: 10px 16px; margin-bottom: 10px;\"><div style=\"display: flex; align-items: center; gap: 8px; font-weight: 800; color: #26333A;\"><span style=\"font-size: 1.5rem;\">🟣</span> 1 Purple Gem</div><div style=\"font-weight: 800; color: #4F7F86; font-size: 1.05rem;\">⚖️ Balances</div><div style=\"display: flex; align-items: center; gap: 6px; font-weight: 800; color: #26333A;\"><span style=\"font-size: 1.4rem;\">🪙 🪙</span> 2 Gold Coins</div></div><div style=\"display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #ECE3D7; border-radius: 12px; padding: 10px 16px; margin-bottom: 12px;\"><div style=\"display: flex; align-items: center; gap: 8px; font-weight: 800; color: #26333A;\"><span style=\"font-size: 1.4rem;\">🪙</span> 1 Gold Coin</div><div style=\"font-weight: 800; color: #4F7F86; font-size: 1.05rem;\">⚖️ Balances</div><div style=\"display: flex; align-items: center; gap: 4px; font-weight: 800; color: #26333A;\"><span style=\"font-size: 1.3rem;\">⭐ ⭐ ⭐</span> 3 Silver Stars</div></div><div style=\"background: #FFF8EE; border: 2px dashed #E29B63; border-radius: 12px; padding: 10px 16px; text-align: center; font-weight: 800; color: #9A5016; font-size: 1.05rem;\">🟣 1 Purple Gem = ⚖️ How many Silver Stars ⭐ ?</div></div>",
    "options": [
      {
        "text": "6 Silver Stars (⭐⭐⭐⭐⭐⭐)",
        "correct": true,
        "trait": "multiplicative-transitive",
        "visual": "<span style=\"font-size: 1.5rem;\">⭐⭐⭐⭐⭐⭐</span>"
      },
      {
        "text": "5 Silver Stars (⭐⭐⭐⭐⭐)",
        "correct": false,
        "trait": "additive-slip",
        "visual": "<span style=\"font-size: 1.5rem;\">⭐⭐⭐⭐⭐</span>"
      },
      {
        "text": "3 Silver Stars (⭐⭐⭐)",
        "correct": false,
        "trait": "salience-capture",
        "visual": "<span style=\"font-size: 1.5rem;\">⭐⭐⭐</span>"
      },
      {
        "text": "8 Silver Stars (⭐⭐⭐⭐⭐⭐⭐⭐)",
        "correct": false,
        "trait": "over-projection",
        "visual": "<span style=\"font-size: 1.5rem;\">⭐⭐⭐⭐⭐⭐⭐⭐</span>"
      }
    ],
    "reflectionPrompt": "Which explanation fits how your mind figured that out?",
    "reflectionOptions": [
      { "id": "ref-visual-swap", "text": "I pictured replacing each coin with 3 stars: 3 and 3 make 6.", "mindStyle": "visual-substitution" },
      { "id": "ref-calc", "text": "I used mental math: 2 groups of 3 equals 6.", "mindStyle": "analytic-mathematical" },
      { "id": "ref-double", "text": "Since 1 coin is 3 stars, doubling coins doubles the stars.", "mindStyle": "proportional-logic" },
      { "id": "ref-not-sure", "text": "I wasn't completely sure, so I picked the option that felt most balanced.", "mindStyle": "emerging-calibration" }
    ]
  },
  {
    "id": "diag-cake-fractions",
    "strand": "fractions",
    "category": "Conceptual Mathematical Inquiry",
    "title": "The Birthday Cake Sharing Dilemma",
    "stem": "Maya and Noah each have an identical round birthday cake. Maya cuts hers into 4 equal slices and takes 1 slice (1/4). Noah cuts his into 8 equal slices and takes 1 slice (1/8). Who gets the bigger single slice to eat?",
    "readAloudText": "Maya and Noah each have an identical round birthday cake. Maya cuts hers into 4 equal slices and takes 1 slice. Noah cuts his into 8 equal slices and takes 1 slice. Who gets the bigger single slice to eat?",
    "visualHtml": "<div class=\"cake-compare-display\" style=\"display: flex; gap: 16px; justify-content: center; align-items: stretch; margin: 12px auto 20px; max-width: 540px; flex-wrap: wrap;\"><div style=\"flex: 1; min-width: 220px; background: #FFFFFF; border: 2px solid #8FA998; border-radius: 14px; padding: 14px; text-align: center; box-shadow: var(--shadow-sm);\"><div style=\"font-weight: 800; color: #26333A; margin-bottom: 6px; font-size: 1.05rem;\">Maya's Cake</div><div style=\"width: 110px; height: 110px; margin: 0 auto 8px;\"><svg viewBox=\"0 0 100 100\" width=\"110\" height=\"110\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#F5EFEB\" stroke=\"#26333A\" stroke-width=\"2\"/><path d=\"M 50,50 L 50,5 A 45,45 0 0,1 95,50 Z\" fill=\"#E29B63\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"50\" y1=\"5\" x2=\"50\" y2=\"95\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"5\" y1=\"50\" x2=\"95\" y2=\"50\" stroke=\"#26333A\" stroke-width=\"2\"/></svg></div><div style=\"font-weight: 800; color: #9A5016; font-size: 1rem;\">1 of 4 Slices (1/4)</div><div style=\"font-size: 0.8rem; color: #5B6D74;\">Shared among 4 friends</div></div><div style=\"flex: 1; min-width: 220px; background: #FFFFFF; border: 2px solid #4F7F86; border-radius: 14px; padding: 14px; text-align: center; box-shadow: var(--shadow-sm);\"><div style=\"font-weight: 800; color: #26333A; margin-bottom: 6px; font-size: 1.05rem;\">Noah's Cake</div><div style=\"width: 110px; height: 110px; margin: 0 auto 8px;\"><svg viewBox=\"0 0 100 100\" width=\"110\" height=\"110\"><circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#F5EFEB\" stroke=\"#26333A\" stroke-width=\"2\"/><path d=\"M 50,50 L 50,5 A 45,45 0 0,1 81.8,18.2 Z\" fill=\"#E29B63\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"50\" y1=\"5\" x2=\"50\" y2=\"95\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"5\" y1=\"50\" x2=\"95\" y2=\"50\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"18.2\" y1=\"18.2\" x2=\"81.8\" y2=\"81.8\" stroke=\"#26333A\" stroke-width=\"2\"/><line x1=\"18.2\" y1=\"81.8\" x2=\"81.8\" y2=\"18.2\" stroke=\"#26333A\" stroke-width=\"2\"/></svg></div><div style=\"font-weight: 800; color: #4F7F86; font-size: 1rem;\">1 of 8 Slices (1/8)</div><div style=\"font-size: 0.8rem; color: #5B6D74;\">Shared among 8 friends</div></div></div>",
    "options": [
      {
        "text": "Maya's slice (1/4) is bigger",
        "correct": true,
        "trait": "relational-partitioning",
        "visual": "<span style=\"font-size: 1.8rem;\">🍰</span>"
      },
      {
        "text": "Noah's slice (1/8) is bigger",
        "correct": false,
        "misconceptionId": "fraction-bigger-denominator-bigger-value",
        "trait": "whole-number-bias",
        "visual": "<span style=\"font-size: 1.8rem;\">🍰</span>"
      },
      {
        "text": "Both slices are exactly the same size",
        "correct": false,
        "trait": "numerator-equality-bias",
        "visual": "<span style=\"font-size: 1.8rem;\">⚖️</span>"
      },
      {
        "text": "It is impossible to tell without weighing",
        "correct": false,
        "trait": "uncommitted-evasion",
        "visual": "<span style=\"font-size: 1.8rem;\">❓</span>"
      }
    ],
    "reflectionPrompt": "Which explanation sounds most like your thinking?",
    "reflectionOptions": [
      { "id": "ref-sharing", "text": "Fewer friends sharing means everyone gets a bigger piece.", "mindStyle": "conceptual-relational", "misconceptionId": null },
      { "id": "ref-visual-slice", "text": "I looked at the pictures and could visually see the 1/4 slice was fatter.", "mindStyle": "visual-spatial", "misconceptionId": null },
      { "id": "ref-eight-bigger", "text": "8 is a bigger number than 4, so 1/8 sounded bigger at first.", "mindStyle": "whole-number-anchor", "misconceptionId": "fraction-bigger-denominator-bigger-value" },
      { "id": "ref-unsure-frac", "text": "Fractions feel tricky for me, so I guessed.", "mindStyle": "uncertain-calibration", "misconceptionId": null }
    ]
  },
  {
    "id": "diag-empathy-peer",
    "strand": "social-emotional",
    "category": "Interpersonal Mind Style",
    "title": "The Silent Project Partner",
    "stem": "In science class, your partner Mateo seems quiet today. He sits back and hasn't picked up any experiment tools. What would feel like the most natural thing for you to do first?",
    "readAloudText": "In science class, your partner Mateo seems quiet today. He sits back and hasn't picked up any experiment tools. What would feel like the most natural thing for you to do first?",
    "visualHtml": "<div class=\"partner-scene-box\" style=\"background: #F7FAF9; border: 2px solid #D6E8E2; border-radius: 16px; padding: 16px 20px; max-width: 520px; margin: 12px auto 20px; text-align: center;\"><div style=\"display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 8px;\"><div style=\"width: 54px; height: 54px; border-radius: 50%; background: #FFFFFF; border: 2px solid #8FA998; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;\">👦</div><div style=\"text-align: left;\"><div style=\"font-weight: 800; color: #26333A; font-size: 1.05rem;\">Mateo is sitting quietly</div><div style=\"font-size: 0.85rem; color: #5B6D74;\">Arms gently folded, looking down while other teams are working.</div></div></div></div>",
    "options": [
      {
        "text": "Smile and gently ask: 'Would you like to pour the liquid or hold the timer today?'",
        "trait": "empowering-invitation",
        "visual": "<span style=\"font-size: 1.8rem;\">🤝</span>"
      },
      {
        "text": "Do the experiment carefully yourself, then explain each step warmly so he doesn't miss out.",
        "trait": "protective-scaffolding",
        "visual": "<span style=\"font-size: 1.8rem;\">🔬</span>"
      },
      {
        "text": "Ask quietly: 'Hey, are you feeling okay today? We can take our time.'",
        "trait": "empathetic-checking",
        "visual": "<span style=\"font-size: 1.8rem;\">💬</span>"
      },
      {
        "text": "Show him the coolest reaction: 'Look at this bubbling crystal!' to spark his excitement.",
        "trait": "enthusiastic-inspiring",
        "visual": "<span style=\"font-size: 1.8rem;\">💡</span>"
      }
    ],
    "reflectionPrompt": "What felt most important to you here?",
    "reflectionOptions": [
      { "id": "ref-agency", "text": "Giving him a choice so he feels included without pressure.", "mindStyle": "respectful-collaborator" },
      { "id": "ref-care", "text": "Checking how he feels as a person before worrying about the work.", "mindStyle": "empathetic-anchor" },
      { "id": "ref-progress", "text": "Making sure the project gets done well while staying kind.", "mindStyle": "practical-steward" },
      { "id": "ref-joy", "text": "Sharing excitement so school feels fun and welcoming.", "mindStyle": "positive-catalyst" }
    ]
  }
];

