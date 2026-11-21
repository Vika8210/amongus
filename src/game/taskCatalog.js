/**
 * Task Catalog — 75 C Programming Output-Based Questions (3 Sections of 25)
 * Divided into:
 *   Section 1: Questions 1 to 25 (Loops, Conditions, Break/Continue)
 *   Section 2: Questions 26 to 50 (Loop Control, Sum/Product & Logic)
 *   Section 3: Questions 51 to 75 (Nested Loops, Calculations & Patterns)
 *
 * Each question has verified code, 4 options (A, B, C, D), and exact answer key from PDF.
 */

export const STATION_IDS = [
  'cafeteria',
  'weapons',
  'navigation',
  'shields',
  'admin',
  'storage',
  'electrical',
  'medbay',
  'upper_engine',
  'lower_engine',
  'reactor',
  'security',
  'o2',
  'comms'
];

export const SKELD_STATIONS = [
  { id: 'cafeteria',    name: 'Cafeteria',      x: 1760, y: 150,  color: '#38bdf8' },
  { id: 'weapons',      name: 'Weapons',        x: 2160, y: 295,  color: '#ef4444' },
  { id: 'navigation',   name: 'Navigation',     x: 2585, y: 760,  color: '#3b82f6' },
  { id: 'shields',      name: 'Shields',        x: 2150, y: 1220, color: '#10b981' },
  { id: 'admin',        name: 'Admin',          x: 1920, y: 935,  color: '#eab308' },
  { id: 'storage',      name: 'Storage',        x: 1345, y: 1465, color: '#f97316' },
  { id: 'electrical',   name: 'Electrical',     x: 930,  y: 990,  color: '#a855f7' },
  { id: 'medbay',       name: 'MedBay',         x: 960,  y: 620,  color: '#06b6d4' },
  { id: 'upper_engine', name: 'Upper Engine',   x: 455,  y: 230,  color: '#6366f1' },
  { id: 'lower_engine', name: 'Lower Engine',   x: 455,  y: 1380, color: '#6366f1' },
  { id: 'reactor',      name: 'Reactor',        x: 280,  y: 680,  color: '#eab308' },
  { id: 'security',     name: 'Security',       x: 680,  y: 760,  color: '#f43f5e' },
  { id: 'o2',           name: 'O2',             x: 1980, y: 610,  color: '#22c55e' },
  { id: 'comms',        name: 'Communications', x: 1900, y: 1490, color: '#14b8a6' }
];

// ----------------------------------------------------------------------------
// 75 C Questions (Sections 1, 2, 3 — 25 questions each)
// ----------------------------------------------------------------------------
export const ALL_QUESTIONS = [
  // ==========================================
  // SECTION 1: Questions 1 to 25
  // ==========================================
  {
    id: 'q1',
    qNumber: 1,
    section: 1,
    title: 'Q1: Basic Loop Execution',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '0 1 2 3 4', '1 2 3 4', '5 4 3 2 1'],
    correctAnswer: 0,
    points: 10,
    explanation: 'The loop executes for i = 1, 2, 3, 4, 5 and prints "1 2 3 4 5 ".'
  },
  {
    id: 'q2',
    qNumber: 2,
    section: 1,
    title: 'Q2: Decrementing Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 5; i >= 1; i--) {\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '5 4 3 2 1', '5 4 3 2', '0 1 2 3 4'],
    correctAnswer: 1,
    points: 10,
    explanation: 'The loop starts at 5 and counts down to 1: "5 4 3 2 1 ".'
  },
  {
    id: 'q3',
    qNumber: 3,
    section: 1,
    title: 'Q3: Step-2 While Loop',
    question: 'What will be the output?',
    code: 'int i = 2;\nwhile(i <= 10) {\n    printf("%d ", i);\n    i += 2;\n}',
    options: ['2 4 6 8 10', '2 4 6 8', '1 3 5 7 9', '2 3 4 5 6'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i increments by 2 each time, outputting even numbers 2, 4, 6, 8, 10.'
  },
  {
    id: 'q4',
    qNumber: 4,
    section: 1,
    title: 'Q4: Countdown While Loop',
    question: 'What will be the output?',
    code: 'int i = 10;\nwhile(i >= 6) {\n    printf("%d ", i);\n    i--;\n}',
    options: ['6 7 8 9 10', '10 9 8 7 6', '10 9 8 7', '9 8 7 6'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Counts down from 10 while i >= 6: 10, 9, 8, 7, 6.'
  },
  {
    id: 'q5',
    qNumber: 5,
    section: 1,
    title: 'Q5: Squared Values Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 4; i++) {\n    printf("%d ", i * i);\n}',
    options: ['1 2 3 4', '1 4 9 16', '2 4 6 8', '1 8 27 64'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Prints squares of 1, 2, 3, 4: 1, 4, 9, 16.'
  },
  {
    id: 'q6',
    qNumber: 6,
    section: 1,
    title: 'Q6: Basic Do-While Loop',
    question: 'What will be the output?',
    code: 'int i = 1;\ndo {\n    printf("%d ", i);\n    i++;\n} while(i <= 5);',
    options: ['1 2 3 4', '0 1 2 3 4', '1 2 3 4 5', '5 4 3 2 1'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Do-while prints 1 through 5 before condition (6 <= 5) evaluates to false.'
  },
  {
    id: 'q7',
    qNumber: 7,
    section: 1,
    title: 'Q7: Do-While Condition Check',
    question: 'What will be the output?',
    code: 'int i = 5;\ndo {\n    printf("%d ", i);\n    i++;\n} while(i < 5);',
    options: ['No output', '5', '5 6', 'Infinite loop'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Do-while always executes at least once, printing 5, then 6 < 5 terminates.'
  },
  {
    id: 'q8',
    qNumber: 8,
    section: 1,
    title: 'Q8: Decrementing Do-While',
    question: 'What will be the output?',
    code: 'int i = 3;\ndo {\n    printf("%d ", i);\n    i--;\n} while(i > 0);',
    options: ['1 2 3', '3 2 1', '3 2', '0 1 2 3'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Prints 3, 2, 1, then i becomes 0 and loop stops.'
  },
  {
    id: 'q9',
    qNumber: 9,
    section: 1,
    title: 'Q9: Do-While Multiplier',
    question: 'What will be the output?',
    code: 'int i = 1;\ndo {\n    printf("%d ", i * 2);\n    i++;\n} while(i <= 3);',
    options: ['1 2 3', '2 4 6', '2 3 4', '1 4 9'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Prints 1*2=2, 2*2=4, 3*2=6.'
  },
  {
    id: 'q10',
    qNumber: 10,
    section: 1,
    title: 'Q10: Step-3 Do-While',
    question: 'What will be the output?',
    code: 'int i = 10;\ndo {\n    printf("%d ", i);\n    i -= 3;\n} while(i > 0);',
    options: ['10 7 4 1', '10 7 4', '10 9 8 7', '7 4 1'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 10, 7, 4, 1. When i = 1 - 3 = -2, -2 > 0 is false.'
  },
  {
    id: 'q11',
    qNumber: 11,
    section: 1,
    title: 'Q11: Break in For Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i == 3)\n        break;\n    printf("%d ", i);\n}',
    options: ['1 2', '1 2 3', '1 2 4 5', '3 4 5'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 1 and 2, then breaks when i == 3.'
  },
  {
    id: 'q12',
    qNumber: 12,
    section: 1,
    title: 'Q12: Break in While Loop',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 6) {\n    if(i == 4)\n        break;\n    printf("%d ", i);\n    i++;\n}',
    options: ['1 2 3', '1 2 3 4', '1 2 3 4 5 6', '4 5 6'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 1, 2, 3, then breaks immediately at i == 4.'
  },
  {
    id: 'q13',
    qNumber: 13,
    section: 1,
    title: 'Q13: Break in Decrementing Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 5; i >= 1; i--) {\n    if(i == 2)\n        break;\n    printf("%d ", i);\n}',
    options: ['5 4 3', '5 4 3 2', '1 2 3 4 5', '5 4'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 5, 4, 3, then breaks when i == 2.'
  },
  {
    id: 'q14',
    qNumber: 14,
    section: 1,
    title: 'Q14: Break on Even Number',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 10; i++) {\n    if(i % 2 == 0)\n        break;\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '1', '2 4 6 8 10', 'No output'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i = 1 is printed. At i = 2, 2 % 2 == 0 triggers break, so only 1 is printed.'
  },
  {
    id: 'q15',
    qNumber: 15,
    section: 1,
    title: 'Q15: Break on Accumulator Threshold',
    question: 'What will be the output?',
    code: 'int i = 1, sum = 0;\nwhile(i <= 10) {\n    sum += i;\n    if(sum > 10)\n        break;\n    i++;\n}\nprintf("%d", sum);',
    options: ['10', '15', '21', '55'],
    correctAnswer: 1,
    points: 10,
    explanation: 'sum: 1, 3, 6, 10, then 10 + 5 = 15 (> 10), break occurs, printing 15.'
  },
  {
    id: 'q16',
    qNumber: 16,
    section: 1,
    title: 'Q16: Continue in For Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i == 3)\n        continue;\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '1 2 4 5', '1 2', '3 4 5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'continue skips the printf when i == 3, printing 1 2 4 5.'
  },
  {
    id: 'q17',
    qNumber: 17,
    section: 1,
    title: 'Q17: Continue on Even Numbers',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 6; i++) {\n    if(i % 2 == 0)\n        continue;\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5 6', '2 4 6', '1 3 5', '1 2 3'],
    correctAnswer: 2,
    points: 10,
    explanation: 'All even numbers are skipped, outputting odd numbers 1 3 5.'
  },
  {
    id: 'q18',
    qNumber: 18,
    section: 1,
    title: 'Q18: Continue in While Loop',
    question: 'What will be the output?',
    code: 'int i = 5;\nwhile(i > 0) {\n    i--;\n    if(i == 2)\n        continue;\n    printf("%d ", i);\n}',
    options: ['4 3 2 1 0', '4 3 1 0', '5 4 3 1', '4 3 2'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i decrements to 4, 3, 2 (skipped), 1, 0 -> 4 3 1 0.'
  },
  {
    id: 'q19',
    qNumber: 19,
    section: 1,
    title: 'Q19: Sum with Continue',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    if(i == 3)\n        continue;\n    sum += i;\n}\nprintf("%d", sum);',
    options: ['15', '12', '9', '10'],
    correctAnswer: 1,
    points: 10,
    explanation: '1 + 2 + 4 + 5 = 12 (3 is skipped).'
  },
  {
    id: 'q20',
    qNumber: 20,
    section: 1,
    title: 'Q20: Skip Multiples of 3',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 10; i >= 1; i--) {\n    if(i % 3 == 0)\n        continue;\n    printf("%d ", i);\n}',
    options: ['10 9 8 7 6 5 4 3 2 1', '10 8 7 5 4 2 1', '9 6 3', '10 8 6 4 2'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Multiples of 3 (9, 6, 3) are skipped: 10 8 7 5 4 2 1.'
  },
  {
    id: 'q21',
    qNumber: 21,
    section: 1,
    title: 'Q21: Sum of 1 to 5',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    sum += i;\n}\nprintf("%d", sum);',
    options: ['10', '15', '20', '25'],
    correctAnswer: 1,
    points: 10,
    explanation: '1 + 2 + 3 + 4 + 5 = 15.'
  },
  {
    id: 'q22',
    qNumber: 22,
    section: 1,
    title: 'Q22: Factorial of 4',
    question: 'What will be the output?',
    code: 'int i, product = 1;\nfor(i = 1; i <= 4; i++) {\n    product *= i;\n}\nprintf("%d", product);',
    options: ['10', '16', '24', '20'],
    correctAnswer: 2,
    points: 10,
    explanation: '1 * 2 * 3 * 4 = 24.'
  },
  {
    id: 'q23',
    qNumber: 23,
    section: 1,
    title: 'Q23: Sum of Even Numbers',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 2; i <= 10; i += 2) {\n    sum += i;\n}\nprintf("%d", sum);',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    points: 10,
    explanation: '2 + 4 + 6 + 8 + 10 = 30.'
  },
  {
    id: 'q24',
    qNumber: 24,
    section: 1,
    title: 'Q24: Count Even Numbers',
    question: 'What will be the output?',
    code: 'int i, count = 0;\nfor(i = 1; i <= 10; i++) {\n    if(i % 2 == 0)\n        count++;\n}\nprintf("%d", count);',
    options: ['4', '5', '6', '10'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Even numbers in 1..10 are {2, 4, 6, 8, 10}, total count is 5.'
  },
  {
    id: 'q25',
    qNumber: 25,
    section: 1,
    title: 'Q25: Sum of Doubles',
    question: 'What will be the output?',
    code: 'int i = 1, sum = 0;\nwhile(i <= 4) {\n    sum += i * 2;\n    i++;\n}\nprintf("%d", sum);',
    options: ['10', '15', '20', '24'],
    correctAnswer: 2,
    points: 10,
    explanation: '2 + 4 + 6 + 8 = 20.'
  },

  // ==========================================
  // SECTION 2: Questions 26 to 50
  // ==========================================
  {
    id: 'q26',
    qNumber: 26,
    section: 2,
    title: 'Q26: Conditional Print Above 5',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 10; i++) {\n    if(i > 5)\n        printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '5 6 7 8 9 10', '6 7 8 9 10', '1 2 3 4 5 6'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Condition i > 5 is true for 6, 7, 8, 9, 10.'
  },
  {
    id: 'q27',
    qNumber: 27,
    section: 2,
    title: 'Q27: Multiples of 3 in Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 10; i++) {\n    if(i % 3 == 0)\n        printf("%d ", i);\n}',
    options: ['1 3 5 7 9', '3 6 9', '2 4 6 8 10', '3 6 9 12'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Multiples of 3 between 1 and 10 are 3, 6, 9.'
  },
  {
    id: 'q28',
    qNumber: 28,
    section: 2,
    title: 'Q28: While Loop with Increment Before Continue',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 5) {\n    if(i == 3) {\n        i++;\n        continue;\n    }\n    printf("%d ", i);\n    i++;\n}',
    options: ['1 2 3 4 5', '1 2 4 5', '1 2 3', '2 4 5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'When i == 3, i increments to 4 and continues without printing 3 -> 1 2 4 5.'
  },
  {
    id: 'q29',
    qNumber: 29,
    section: 2,
    title: 'Q29: Alternating Multipliers',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i % 2 != 0)\n        printf("%d ", i * 2);\n    else\n        printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '2 2 6 4 10', '2 4 6 8 10', '1 4 3 8 5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Odd numbers are doubled: 1*2=2, 2, 3*2=6, 4, 5*2=10 -> 2 2 6 4 10.'
  },
  {
    id: 'q30',
    qNumber: 30,
    section: 2,
    title: 'Q30: Print Then Break',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 5) {\n    printf("%d ", i);\n    if(i == 3)\n        break;\n    i++;\n}',
    options: ['1 2 3', '1 2', '1 2 3 4 5', '3 4 5'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 1, 2, and 3. Break happens after printing 3.'
  },
  {
    id: 'q31',
    qNumber: 31,
    section: 2,
    title: 'Q31: Sum of Squares 1 to 5',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    sum += i * i;\n}\nprintf("%d", sum);',
    options: ['15', '30', '55', '25'],
    correctAnswer: 2,
    points: 10,
    explanation: '1 + 4 + 9 + 16 + 25 = 55.'
  },
  {
    id: 'q32',
    qNumber: 32,
    section: 2,
    title: 'Q32: Sum of Even Numbers 1 to 10',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 10; i++) {\n    if(i % 2 == 0)\n        sum += i;\n}\nprintf("%d", sum);',
    options: ['20', '25', '30', '55'],
    correctAnswer: 2,
    points: 10,
    explanation: '2 + 4 + 6 + 8 + 10 = 30.'
  },
  {
    id: 'q33',
    qNumber: 33,
    section: 2,
    title: 'Q33: Product from 2 to 5',
    question: 'What will be the output?',
    code: 'int i, product = 1;\nfor(i = 2; i <= 5; i++) {\n    product *= i;\n}\nprintf("%d", product);',
    options: ['24', '60', '120', '240'],
    correctAnswer: 2,
    points: 10,
    explanation: '2 * 3 * 4 * 5 = 120.'
  },
  {
    id: 'q34',
    qNumber: 34,
    section: 2,
    title: 'Q34: Reverse Even Sum',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 10; i >= 2; i -= 2) {\n    sum += i;\n}\nprintf("%d", sum);',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    points: 10,
    explanation: '10 + 8 + 6 + 4 + 2 = 30.'
  },
  {
    id: 'q35',
    qNumber: 35,
    section: 2,
    title: 'Q35: Sum with Continue at 4',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    if(i == 4)\n        continue;\n    sum += i * 2;\n}\nprintf("%d", sum);',
    options: ['20', '22', '26', '30'],
    correctAnswer: 1,
    points: 10,
    explanation: '2 + 4 + 6 + 10 = 22 (8 from i=4 is skipped).'
  },
  {
    id: 'q36',
    qNumber: 36,
    section: 2,
    title: 'Q36: Power of 2 Doubling Loop',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 20) {\n    printf("%d ", i);\n    i *= 2;\n}',
    options: ['1 2 3 4 5', '1 2 4 8 16', '2 4 8 16 20', '1 4 8 12 16'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i starts at 1, doubles to 2, 4, 8, 16. At 32 > 20 the loop ends.'
  },
  {
    id: 'q37',
    qNumber: 37,
    section: 2,
    title: 'Q37: Integer Halving Loop',
    question: 'What will be the output?',
    code: 'int i = 20;\nwhile(i >= 1) {\n    printf("%d ", i);\n    i /= 2;\n}',
    options: ['20 10 5 2 1', '20 15 10 5', '20 10 5', '20 10 2 1'],
    correctAnswer: 0,
    points: 10,
    explanation: '20, 10, 5, 2 (5/2=2 in integer division), 1 (2/2=1), then 1/2=0 stops.'
  },
  {
    id: 'q38',
    qNumber: 38,
    section: 2,
    title: 'Q38: Add Before Print Loop',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 10) {\n    i += 3;\n    printf("%d ", i);\n}',
    options: ['1 4 7 10', '4 7 10 13', '3 6 9 12', '4 7 10'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i becomes 4, 7, 10, and when i=10 (<= 10), i += 3 becomes 13 -> 4 7 10 13.'
  },
  {
    id: 'q39',
    qNumber: 39,
    section: 2,
    title: 'Q39: Step Down by 4',
    question: 'What will be the output?',
    code: 'int i = 10;\nwhile(i > 0) {\n    printf("%d ", i);\n    i -= 4;\n}',
    options: ['10 6 2', '10 8 6 4 2', '10 6 2 -2', '6 2'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 10, 6, 2. Then 2 - 4 = -2, which stops the while(i > 0) loop.'
  },
  {
    id: 'q40',
    qNumber: 40,
    section: 2,
    title: 'Q40: Two-Variable Sum Loop',
    question: 'What will be the output?',
    code: 'int i = 1, j = 1;\nwhile(i <= 3) {\n    printf("%d ", i + j);\n    i++;\n    j += 2;\n}',
    options: ['2 3 4', '2 5 8', '1 4 7', '2 4 6'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i=1,j=1 -> 2; i=2,j=3 -> 5; i=3,j=5 -> 8.'
  },
  {
    id: 'q41',
    qNumber: 41,
    section: 2,
    title: 'Q41: Alternating Characters',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i % 2 == 0)\n        printf("A ");\n    else\n        printf("B ");\n}',
    options: ['A B A B A', 'B A B A B', 'A A B B A', 'B B A A B'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i=1 (B), i=2 (A), i=3 (B), i=4 (A), i=5 (B) -> B A B A B.'
  },
  {
    id: 'q42',
    qNumber: 42,
    section: 2,
    title: 'Q42: Sum Numbers Greater Than 2',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    if(i > 2)\n        sum += i;\n}\nprintf("%d", sum);',
    options: ['6', '9', '12', '15'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Numbers > 2 in 1..5 are 3, 4, 5. Sum is 3 + 4 + 5 = 12.'
  },
  {
    id: 'q43',
    qNumber: 43,
    section: 2,
    title: 'Q43: Double Evens in While Loop',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 5) {\n    if(i % 2 == 0)\n        printf("%d ", i * 2);\n    else\n        printf("%d ", i);\n    i++;\n}',
    options: ['1 2 3 4 5', '1 4 3 8 5', '2 4 6 8 10', '1 2 6 4 10'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i=1 (1), i=2 (4), i=3 (3), i=4 (8), i=5 (5) -> 1 4 3 8 5.'
  },
  {
    id: 'q44',
    qNumber: 44,
    section: 2,
    title: 'Q44: Continue on Multiple Conditions',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i == 2 || i == 4)\n        continue;\n    printf("%d ", i);\n}',
    options: ['1 2 3 4 5', '1 3 5', '2 4', '1 3 4 5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Skips 2 and 4, printing 1 3 5.'
  },
  {
    id: 'q45',
    qNumber: 45,
    section: 2,
    title: 'Q45: Count Evens in While Loop',
    question: 'What will be the output?',
    code: 'int i = 1, count = 0;\nwhile(i <= 10) {\n    if(i % 2 == 0)\n        count++;\n    i++;\n}\nprintf("%d", count);',
    options: ['4', '5', '6', '10'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Count of evens in 1..10 is 5.'
  },
  {
    id: 'q46',
    qNumber: 46,
    section: 2,
    title: 'Q46: Running Cumulative Sum',
    question: 'What will be the output?',
    code: 'int i, sum = 0;\nfor(i = 1; i <= 5; i++) {\n    sum += i;\n    printf("%d ", sum);\n}',
    options: ['1 2 3 4 5', '1 3 6 10 15', '5 4 3 2 1', '1 4 9 16 25'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Cumulative sums printed per iteration: 1, 3, 6, 10, 15.'
  },
  {
    id: 'q47',
    qNumber: 47,
    section: 2,
    title: 'Q47: Conditional Double Increment',
    question: 'What will be the output?',
    code: 'int i = 1;\nwhile(i <= 4) {\n    printf("%d ", i);\n    i++;\n    if(i == 3)\n        i++;\n}',
    options: ['1 2 3 4', '1 2 4', '1 3 4', '1 2 3'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i=1 printed (i->2). i=2 printed (i->3, triggers if(i==3) i++ -> 4). i=4 printed (i->5) -> 1 2 4.'
  },
  {
    id: 'q48',
    qNumber: 48,
    section: 2,
    title: 'Q48: Double Increment in For Loop',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    printf("%d ", i);\n    i++;\n}',
    options: ['1 2 3 4 5', '1 3 5', '1 3 5 7', '2 4'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i increments inside loop body (i++) and in for header (i++): prints 1, 3, 5.'
  },
  {
    id: 'q49',
    qNumber: 49,
    section: 2,
    title: 'Q49: Sum of Odd Numbers in While Loop',
    question: 'What will be the output?',
    code: 'int i = 1, sum = 0;\nwhile(i <= 5) {\n    sum += i;\n    i += 2;\n}\nprintf("%d", sum);',
    options: ['6', '9', '15', '12'],
    correctAnswer: 1,
    points: 10,
    explanation: 'i takes values 1, 3, 5. Sum = 1 + 3 + 5 = 9.'
  },
  {
    id: 'q50',
    qNumber: 50,
    section: 2,
    title: 'Q50: Break Before Multiplying',
    question: 'What will be the output?',
    code: 'int i;\nfor(i = 1; i <= 5; i++) {\n    if(i == 3)\n        break;\n    printf("%d ", i * 3);\n}',
    options: ['3 6', '3 6 9', '1 2', '3 6 12 15'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints 1*3=3, 2*3=6, then breaks at i == 3.'
  },

  // ==========================================
  // SECTION 3: Questions 51 to 75
  // ==========================================
  {
    id: 'q51',
    qNumber: 51,
    section: 3,
    title: 'Q51: Nested Asterisk Grid',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 2; i++) {\n    for(j = 1; j <= 3; j++) {\n        printf("*");\n    }\n}',
    options: ['***', '******', '****', '**'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Outer loop runs 2 times, inner loop 3 times: 2 * 3 = 6 asterisks.'
  },
  {
    id: 'q52',
    qNumber: 52,
    section: 3,
    title: 'Q52: Outer Variable in Inner Loop',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 2; j++) {\n        printf("%d ", i);\n    }\n}',
    options: ['1 2 3 1 2 3', '1 1 2 2 3 3', '1 1 1 2 2 2', '1 2 1 2 1 2'],
    correctAnswer: 1,
    points: 10,
    explanation: 'For each i (1, 2, 3), prints i twice: 1 1 2 2 3 3.'
  },
  {
    id: 'q53',
    qNumber: 53,
    section: 3,
    title: 'Q53: Inner Variable Repeated',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 2; i++) {\n    for(j = 1; j <= 3; j++) {\n        printf("%d ", j);\n    }\n}',
    options: ['1 2 3 1 2 3', '1 1 2 2 3 3', '1 2 3 4 5 6', '1 2 1 2 1 2'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Inner loop prints 1 2 3 for each of the 2 outer iterations: 1 2 3 1 2 3.'
  },
  {
    id: 'q54',
    qNumber: 54,
    section: 3,
    title: 'Q54: Nested Loop Matrix Addition',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        printf("%d ", i + j);\n    }\n}',
    options: ['2 3 4 3 4 5 4 5 6', '1 2 3 1 2 3 1 2 3', '2 4 6 2 4 6 2 4 6', '1 2 3 4 5 6 7 8 9'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1: 2 3 4; i=2: 3 4 5; i=3: 4 5 6.'
  },
  {
    id: 'q55',
    qNumber: 55,
    section: 3,
    title: 'Q55: Triangle Asterisk Rows',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= i; j++) {\n        printf("*");\n    }\n    printf(" ");\n}',
    options: ['* ** ***', '*** ** *', '* * *', '** ** **'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1 prints "* ", i=2 prints "** ", i=3 prints "*** " -> * ** ***.'
  },
  {
    id: 'q56',
    qNumber: 56,
    section: 3,
    title: 'Q56: Nested Loop Counter',
    question: 'What will be the output?',
    code: 'int i, j, count = 0;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 2; j++) {\n        count++;\n    }\n}\nprintf("%d", count);',
    options: ['3', '5', '6', '9'],
    correctAnswer: 2,
    points: 10,
    explanation: '3 iterations * 2 iterations = 6 total iterations, count is 6.'
  },
  {
    id: 'q57',
    qNumber: 3,
    section: 3,
    title: 'Q57: Outer Index Accumulation',
    question: 'What will be the output?',
    code: 'int i, j, sum = 0;\nfor(i = 1; i <= 2; i++) {\n    for(j = 1; j <= 3; j++) {\n        sum += i;\n    }\n}\nprintf("%d", sum);',
    options: ['6', '9', '12', '15'],
    correctAnswer: 1,
    points: 10,
    explanation: 'When i=1: sum adds 1 three times (+3). When i=2: sum adds 2 three times (+6). Total = 9.'
  },
  {
    id: 'q58',
    qNumber: 58,
    section: 3,
    title: 'Q58: Nested Multiplication Table',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 2; j++) {\n        printf("%d ", i * j);\n    }\n}',
    options: ['1 2 2 4 3 6', '1 2 3 4 5 6', '1 2 3 1 2 3', '2 4 6 8 10 12'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1: 1 2; i=2: 2 4; i=3: 3 6 -> 1 2 2 4 3 6.'
  },
  {
    id: 'q59',
    qNumber: 59,
    section: 3,
    title: 'Q59: Diagonal Match Count',
    question: 'What will be the output?',
    code: 'int i, j, sum = 0;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(i == j)\n            sum += 1;\n    }\n}\nprintf("%d", sum);',
    options: ['1', '2', '3', '6'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Matches occur when (1,1), (2,2), (3,3) -> sum = 3.'
  },
  {
    id: 'q60',
    qNumber: 60,
    section: 3,
    title: 'Q60: Matrix Sum Condition',
    question: 'What will be the output?',
    code: 'int i, j, count = 0;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(i + j > 3)\n            count++;\n    }\n}\nprintf("%d", count);',
    options: ['3', '4', '5', '6'],
    correctAnswer: 3,
    points: 10,
    explanation: 'Pairs with i+j > 3: (1,3), (2,2), (2,3), (3,1), (3,2), (3,3) = 6 pairs.'
  },
  {
    id: 'q61',
    qNumber: 61,
    section: 3,
    title: 'Q61: 3x3 Asterisk Matrix',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        printf("* ");\n    }\n    printf("\\n");\n}',
    options: ['* * *\\n* * *\\n* * *', '*\\n* *\\n* * *', '* * *\\n* *\\n*', '*\\n*\\n*'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Prints a 3x3 grid of asterisks with newlines between rows.'
  },
  {
    id: 'q62',
    qNumber: 62,
    section: 3,
    title: 'Q62: Incremental Number Triangle',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= i; j++) {\n        printf("%d ", j);\n    }\n    printf("\\n");\n}',
    options: ['1\\n1 2\\n1 2 3', '1 2 3\\n1 2\\n1', '1 1\\n2 2\\n3 3', '1\\n2\\n3'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Row 1 prints 1, Row 2 prints 1 2, Row 3 prints 1 2 3.'
  },
  {
    id: 'q63',
    qNumber: 63,
    section: 3,
    title: 'Q63: Inverted Asterisk Triangle',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 3; i >= 1; i--) {\n    for(j = 1; j <= i; j++) {\n        printf("* ");\n    }\n    printf("\\n");\n}',
    options: ['*\\n* *\\n* * *', '* * *\\n* *\\n*', '* * *\\n* * *\\n* * *', '* *\\n* *\\n* *'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Row 1 prints 3 stars, Row 2 prints 2 stars, Row 3 prints 1 star.'
  },
  {
    id: 'q64',
    qNumber: 64,
    section: 3,
    title: 'Q64: Repeated Row Values Matrix',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        printf("%d ", i);\n    }\n    printf("\\n");\n}',
    options: ['1 2 3\\n1 2 3\\n1 2 3', '1 1 1\\n2 2 2\\n3 3 3', '1\\n2\\n3', '1 2\\n2 3\\n3 4'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Row 1 has three 1s, Row 2 has three 2s, Row 3 has three 3s.'
  },
  {
    id: 'q65',
    qNumber: 65,
    section: 3,
    title: 'Q65: Repeated Row Value Triangle',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= i; j++) {\n        printf("%d ", i);\n    }\n    printf("\\n");\n}',
    options: ['1\\n2 2\\n3 3 3', '1 2 3\\n1 2\\n1', '1\\n1 2\\n1 2 3', '1 1 1\\n2 2 2\\n3 3 3'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1 prints 1, i=2 prints 2 2, i=3 prints 3 3 3.'
  },
  {
    id: 'q66',
    qNumber: 66,
    section: 3,
    title: 'Q66: Break in Nested Loop',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(j == 2)\n            break;\n        printf("%d ", j);\n    }\n}',
    options: ['1 2 3 1 2 3', '1 1 1', '1 2 1 2 1 2', '1 1 2'],
    correctAnswer: 1,
    points: 10,
    explanation: 'In each iteration of i, j=1 is printed, then j=2 breaks the inner loop: 1 1 1.'
  },
  {
    id: 'q67',
    qNumber: 67,
    section: 3,
    title: 'Q67: Continue in Nested Loop',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 2; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(j == 2)\n            continue;\n        printf("%d ", j);\n    }\n}',
    options: ['1 2 3 1 2 3', '1 3 1 3', '1 1 3 3', '2 2'],
    correctAnswer: 1,
    points: 10,
    explanation: 'j=2 is skipped in both outer passes: 1 3 1 3.'
  },
  {
    id: 'q68',
    qNumber: 68,
    section: 3,
    title: 'Q68: Break on Outer Variable',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(i == 2)\n            break;\n        printf("*");\n    }\n}',
    options: ['*********', '******', '***', '****'],
    correctAnswer: 1,
    points: 10,
    explanation: 'When i=1: 3 stars. When i=2: breaks immediately (0 stars). When i=3: 3 stars. Total = 6 stars.'
  },
  {
    id: 'q69',
    qNumber: 69,
    section: 3,
    title: 'Q69: Continue on Inner Condition Printing Outer',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(j == 3)\n            continue;\n        printf("%d ", i);\n    }\n}',
    options: ['1 1 2 2 3 3', '1 2 3', '1 1 1 2 2 2 3 3 3', '1 2 1 2 3 3'],
    correctAnswer: 0,
    points: 10,
    explanation: 'For each i, j=1 and j=2 print i (j=3 skipped): 1 1 2 2 3 3.'
  },
  {
    id: 'q70',
    qNumber: 70,
    section: 3,
    title: 'Q70: Skip Diagonal and Count',
    question: 'What will be the output?',
    code: 'int i, j, count = 0;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(i == j)\n            continue;\n        count++;\n    }\n}\nprintf("%d", count);',
    options: ['3', '6', '9', '5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Out of 9 total iterations, 3 diagonal pairs (i==j) are skipped: 9 - 3 = 6.'
  },
  {
    id: 'q71',
    qNumber: 71,
    section: 3,
    title: 'Q71: Triangle Sum Accumulator',
    question: 'What will be the output?',
    code: 'int i, j, sum = 0;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= i; j++) {\n        sum += j;\n    }\n}\nprintf("%d", sum);',
    options: ['6', '9', '10', '12'],
    correctAnswer: 2,
    points: 10,
    explanation: 'i=1: +1 (1); i=2: +1+2 (4); i=3: +1+2+3 (10) -> sum = 10.'
  },
  {
    id: 'q72',
    qNumber: 72,
    section: 3,
    title: 'Q72: Conditional Matrix Substitution',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 1; j <= 3; j++) {\n        if(i * j == 4)\n            printf("X ");\n        else\n            printf("%d ", i * j);\n    }\n}',
    options: ['1 2 3 2 X 6 3 6 9', '1 2 3 4 5 6 7 8 9', '1 2 3 X X 6 3 6 9', '1 2 3 2 4 6 3 6 9'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1: 1 2 3; i=2: 2 X (2*2=4) 6; i=3: 3 6 9 -> 1 2 3 2 X 6 3 6 9.'
  },
  {
    id: 'q73',
    qNumber: 73,
    section: 3,
    title: 'Q73: Triangular Step-2 Counter',
    question: 'What will be the output?',
    code: 'int i, j, count = 0;\nfor(i = 1; i <= 4; i++) {\n    for(j = 1; j <= i; j++) {\n        count += 2;\n    }\n}\nprintf("%d", count);',
    options: ['10', '16', '20', '24'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Total iterations = 1 + 2 + 3 + 4 = 10. Each adds 2: 10 * 2 = 20.'
  },
  {
    id: 'q74',
    qNumber: 74,
    section: 3,
    title: 'Q74: Reverse Inner Loop Comparison',
    question: 'What will be the output?',
    code: 'int i, j;\nfor(i = 1; i <= 3; i++) {\n    for(j = 3; j >= 1; j--) {\n        if(i == j)\n            printf("A ");\n        else\n            printf("B ");\n    }\n}',
    options: ['B B A B A B A B B', 'A B B B A B B B A', 'B A B A B A B A B', 'A A A B B B B B B'],
    correctAnswer: 0,
    points: 10,
    explanation: 'i=1,j=3,2,1 -> B B A; i=2,j=3,2,1 -> B A B; i=3,j=3,2,1 -> A B B -> B B A B A B A B B.'
  },
  {
    id: 'q75',
    qNumber: 75,
    section: 3,
    title: 'Q75: Anti-Diagonal Sum',
    question: 'What will be the output?',
    code: 'int i, j, sum = 0;\nfor(i = 1; i <= 4; i++) {\n    for(j = 1; j <= 4; j++) {\n        if(i + j == 5)\n            sum += i;\n    }\n}\nprintf("%d", sum);',
    options: ['8', '10', '12', '15'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Matches: (1,4)->+1, (2,3)->+2, (3,2)->+3, (4,1)->+4. Total sum = 1 + 2 + 3 + 4 = 10.'
  }
];

// Group questions by section (1, 2, 3)
export const QUESTION_SECTIONS = {
  1: ALL_QUESTIONS.slice(0, 25),
  2: ALL_QUESTIONS.slice(25, 50),
  3: ALL_QUESTIONS.slice(50, 75)
};

/**
 * Returns all 25 questions for a given section (1, 2, or 3).
 * Defaults to Section 1 if invalid.
 */
export function getSectionQuestions(sectionId) {
  const s = parseInt(sectionId, 10);
  return QUESTION_SECTIONS[s] || QUESTION_SECTIONS[1];
}

/**
 * Get question by its unique id ('q1'..'q75')
 */
export function getQuestionById(qId) {
  return ALL_QUESTIONS.find((q) => q.id === qId) || ALL_QUESTIONS[0];
}

/**
 * Maps the 25 questions of a section to the 14 Skeld stations.
 * 11 stations get 2 questions each, 3 stations get 1 question each.
 * 11 * 2 + 3 = 25 questions total per section.
 */
export function getQuestionsForStation(stationId, sectionId = 1) {
  const questions = getSectionQuestions(sectionId);
  const stationIndex = STATION_IDS.indexOf(stationId);
  if (stationIndex === -1) return [];

  const assigned = [];
  // First question (indices 0 to 13)
  if (stationIndex < questions.length) {
    assigned.push(questions[stationIndex]);
  }
  // Second question for the first 11 stations (indices 14 to 24)
  const secondIndex = 14 + stationIndex;
  if (secondIndex < questions.length) {
    assigned.push(questions[secondIndex]);
  }
  return assigned;
}

/**
 * Returns the next uncompleted question for a station, given a list of completed question IDs.
 * Returns null if all questions for this station have been solved by this player.
 */
export function getNextQuestionForStation(stationId, sectionId = 1, completedQuestionIds = []) {
  const stationQuestions = getQuestionsForStation(stationId, sectionId);
  return stationQuestions.find((q) => !completedQuestionIds.includes(q.id)) || null;
}

/**
 * Returns the list of station IDs that still have pending questions for a player.
 */
export function getRemainingStationsForPlayer(sectionId = 1, completedQuestionIds = []) {
  return STATION_IDS.filter((stId) => {
    return getNextQuestionForStation(stId, sectionId, completedQuestionIds) !== null;
  });
}

// ----------------------------------------------------------------------------
// Sabotage Targets & Bugs (Maintained for Sabotage Repair gameplay)
// ----------------------------------------------------------------------------
export const SABOTAGE_TARGETS = [
  { id: 'reactor',    name: 'Reactor',        label: 'Reactor Meltdown', icon: '⚠️' },
  { id: 'electrical', name: 'Electrical',     label: 'Blackout (Lights)', icon: '⚡' },
  { id: 'o2',         name: 'O2',             label: 'Oxygen Depletion', icon: '💨' },
  { id: 'comms',      name: 'Communications', label: 'Comms Jammed',     icon: '📡' }
];

export const SABOTAGE_BUGS = {
  reactor: {
    title: '⚠️ REACTOR CORE MELTDOWN',
    question: 'Tap the buggy line causing the Infinite Loop / Meltdown:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int fuel = 10;',
      '    while(fuel > 0) {',
      '        fuel += 2;',
      '    }',
      '    return 0;',
      '}'
    ],
    bugLine: 4,
    explanation: 'Line 4 adds to fuel instead of reducing it, causing an infinite loop!'
  },
  electrical: {
    title: '⚡ ELECTRICAL LIGHTS OUT',
    question: 'Tap the buggy line attempting to dereference a NULL pointer:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int *breaker = NULL;',
      '    *breaker = 1;',
      '    printf("%d", *breaker);',
      '    return 0;',
      '}'
    ],
    bugLine: 3,
    explanation: 'Line 3 attempts to dereference NULL pointer *breaker, crashing the circuit!'
  },
  o2: {
    title: '💨 O2 DEPLETION IMMINENT',
    question: 'Tap the syntax error trapping the oxygen scrubber loop:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int oxygen = 0;',
      '    while(oxygen < 100); {',
      '        oxygen += 10;',
      '    }',
      '    return 0;',
      '}'
    ],
    bugLine: 4,
    explanation: 'Line 4 has an extra semicolon after while(...); trapping O2!'
  },
  comms: {
    title: '📡 COMMS SABOTAGED',
    question: 'Tap the line writing Out of Bounds:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int signal[3] = {10, 20, 30};',
      '    signal[5] = 99;',
      '    printf("Signal: %d", signal[0]);',
      '    return 0;',
      '}'
    ],
    bugLine: 4,
    explanation: 'Line 4 writes to signal[5] when the array only holds indices 0..2!'
  }
};

export function getSabotageBug(stationId) {
  return SABOTAGE_BUGS[stationId] || SABOTAGE_BUGS.reactor;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightCCode(raw) {
  if (!raw) return '';
  const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|#[a-zA-Z_]+|\b(?:int|float|char|void|return|for|while|do|if|else|switch|case|break|continue|default|sizeof|static|struct|const|NULL)\b|\b(?:printf|scanf|malloc|free|main)\b|[<>&]|[a-zA-Z_][a-zA-Z0-9_]*|\s+|.)/g;

  let result = '';
  let match;
  while ((match = tokenRegex.exec(raw)) !== null) {
    const text = match[0];
    if (text.startsWith('//') || text.startsWith('/*')) {
      result += `<span style="color:#8b949e;font-style:italic;">${escapeHtml(text)}</span>`;
    } else if (text.startsWith('"')) {
      result += `<span style="color:#a5d6ff;">${escapeHtml(text)}</span>`;
    } else if (text.startsWith('#')) {
      result += `<span style="color:#7ee787;font-weight:700;">${escapeHtml(text)}</span>`;
    } else if (/^(?:int|float|char|void|return|for|while|do|if|else|switch|case|break|continue|default|sizeof|static|struct|const|NULL)$/.test(text)) {
      result += `<span style="color:#ff7b72;font-weight:700;">${text}</span>`;
    } else if (/^(?:printf|scanf|malloc|free|main)$/.test(text)) {
      result += `<span style="color:#d2a8ff;">${text}</span>`;
    } else if (text === '<') {
      result += '&lt;';
    } else if (text === '>') {
      result += '&gt;';
    } else if (text === '&') {
      result += '&amp;';
    } else {
      result += text;
    }
  }
  return result;
}
