/**
 * Task Catalog — 14 Skeld C Programming MCQ Tasks & 4 Sabotage Bug Puzzles
 */
export const SKELD_STATIONS = [
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    x: 1760,
    y: 150,
    color: '#38bdf8',
    taskTitle: 'Upload Data: Pointer Dereference',
    taskQuestion: 'What does this C code output?',
    code: `#include <stdio.h>\nint main() {\n    int a = 10, b = 20;\n    int *p = &a;\n    *p = b + 5;\n    printf("%d", a);\n    return 0;\n}`,
    options: ['10', '20', '25', 'Compilation Error'],
    correctAnswer: 2,
    points: 10,
    explanation: '*p modifies a directly to 20 + 5 = 25.'
  },
  {
    id: 'weapons',
    name: 'Weapons',
    x: 2160,
    y: 295,
    color: '#ef4444',
    taskTitle: 'Clear Asteroids: Bitwise Mask',
    taskQuestion: 'What value is printed by this targeting filter?',
    code: `#include <stdio.h>\nint main() {\n    int mask = 0x0F;\n    int val = 0x36;\n    printf("%d", val & mask);\n    return 0;\n}`,
    options: ['6', '15', '54', '0'],
    correctAnswer: 0,
    points: 10,
    explanation: '0x36 & 0x0F keeps the lower 4 bits (0110) = 6.'
  },
  {
    id: 'navigation',
    name: 'Navigation',
    x: 2585,
    y: 760,
    color: '#3b82f6',
    taskTitle: 'Chart Course: Loop Multiplier',
    taskQuestion: 'Trace the thruster value after loop execution:',
    code: `#include <stdio.h>\nint main() {\n    int rpm = 1;\n    for (int i = 0; i < 3; i++) {\n        rpm *= 3;\n    }\n    printf("%d", rpm);\n    return 0;\n}`,
    options: ['9', '27', '81', '3'],
    correctAnswer: 1,
    points: 10,
    explanation: 'The loop multiplies rpm by 3 three times: 1 * 3 * 3 * 3 = 27.'
  },
  {
    id: 'shields',
    name: 'Shields',
    x: 2150,
    y: 1220,
    color: '#10b981',
    taskTitle: 'Prime Shields: Pointer Offset',
    taskQuestion: 'What array element is printed using pointer offset?',
    code: `#include <stdio.h>\nint main() {\n    int shields[] = {12, 24, 36, 48};\n    printf("%d", *(shields + 2));\n    return 0;\n}`,
    options: ['12', '24', '36', '48'],
    correctAnswer: 2,
    points: 10,
    explanation: '*(shields + 2) equals shields[2], which is 36.'
  },
  {
    id: 'admin',
    name: 'Admin',
    x: 1920,
    y: 935,
    color: '#eab308',
    taskTitle: 'Swipe Card: Post-Increment',
    taskQuestion: 'Evaluate the post-increment expression:',
    code: `#include <stdio.h>\nint main() {\n    int x = 5;\n    int y = (x++) + 10;\n    printf("%d", y);\n    return 0;\n}`,
    options: ['15', '16', '14', 'Undefined'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Post-increment uses 5 first, then increments x. 5 + 10 = 15.'
  },
  {
    id: 'storage',
    name: 'Storage',
    x: 1345,
    y: 1465,
    color: '#f97316',
    taskTitle: 'Fuel Engines: Switch Fall-Through',
    taskQuestion: 'Analyze switch case fall-through output:',
    code: `#include <stdio.h>\nint main() {\n    int tank = 2, fuel = 10;\n    switch(tank) {\n        case 1: fuel += 15;\n        case 2: fuel += 20;\n        case 3: fuel += 25; break;\n        default: fuel = 0;\n    }\n    printf("%d", fuel);\n    return 0;\n}`,
    options: ['30', '45', '55', '20'],
    correctAnswer: 2,
    points: 10,
    explanation: 'Matches case 2 (30) and falls through to case 3 (55) before break.'
  },
  {
    id: 'electrical',
    name: 'Electrical',
    x: 930,
    y: 990,
    color: '#a855f7',
    taskTitle: 'Fix Wiring: Ternary Logic',
    taskQuestion: 'Evaluate the ternary circuit expression:',
    code: `#include <stdio.h>\nint main() {\n    int a = 12, b = 4;\n    int res = (a > 10 && b < 5) ? (a / b) : (a * b);\n    printf("%d", res);\n    return 0;\n}`,
    options: ['3', '48', '12', '4'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Condition is true, so a / b = 12 / 4 = 3.'
  },
  {
    id: 'medbay',
    name: 'MedBay',
    x: 960,
    y: 620,
    color: '#06b6d4',
    taskTitle: 'Submit Scan: Recursion Trace',
    taskQuestion: 'What does this recursive scan function return?',
    code: `#include <stdio.h>\nint scan(int n) {\n    if (n <= 1) return 1;\n    return n + scan(n - 2);\n}\nint main() {\n    printf("%d", scan(5));\n    return 0;\n}`,
    options: ['5', '9', '15', '8'],
    correctAnswer: 1,
    points: 10,
    explanation: 'scan(5) = 5 + 3 + 1 = 9.'
  },
  {
    id: 'reactor',
    name: 'Reactor',
    x: 280,
    y: 680,
    color: '#6366f1',
    taskTitle: 'Start Reactor: Modulo Loop',
    taskQuestion: 'What does this reactor parity loop print?',
    code: `#include <stdio.h>\nint main() {\n    int sum = 0;\n    for (int i = 1; i <= 5; i++) {\n        if (i % 2 == 1) sum += i;\n    }\n    printf("%d", sum);\n    return 0;\n}`,
    options: ['6', '9', '15', '5'],
    correctAnswer: 1,
    points: 10,
    explanation: 'Odd numbers 1 + 3 + 5 = 9.'
  },
  {
    id: 'o2',
    name: 'O2',
    x: 1980,
    y: 610,
    color: '#22c55e',
    taskTitle: 'Clean O2 Filter: Short-Circuit',
    taskQuestion: 'What is printed due to short-circuit evaluation?',
    code: `#include <stdio.h>\nint main() {\n    int a = 0, b = 5;\n    if (a && ++b) printf("%d", b);\n    else printf("%d", b);\n    return 0;\n}`,
    options: ['5', '6', '0', 'Error'],
    correctAnswer: 0,
    points: 10,
    explanation: 'Because a is 0, && short-circuits and skips ++b, leaving b = 5.'
  },
  {
    id: 'upper_engine',
    name: 'Upper Engine',
    x: 455,
    y: 230,
    color: '#38bdf8',
    taskTitle: 'Align Upper Engine: Integer Division',
    taskQuestion: 'What does integer division & modulo print?',
    code: `#include <stdio.h>\nint main() {\n    int a = 17, b = 4;\n    printf("%d,%d", a / b, a % b);\n    return 0;\n}`,
    options: ['4,1', '4.25,1', '3,5', '4,4'],
    correctAnswer: 0,
    points: 10,
    explanation: '17 / 4 = 4 (integer division) and 17 % 4 = 1.'
  },
  {
    id: 'lower_engine',
    name: 'Lower Engine',
    x: 455,
    y: 1380,
    color: '#38bdf8',
    taskTitle: 'Align Lower Engine: ASCII Math',
    taskQuestion: 'What character is printed?',
    code: `#include <stdio.h>\nint main() {\n    char ch = 'A';\n    printf("%c", ch + 2);\n    return 0;\n}`,
    options: ['A', 'B', 'C', '67'],
    correctAnswer: 2,
    points: 10,
    explanation: "'A' + 2 shifts two ASCII positions forward to 'C'."
  },
  {
    id: 'security',
    name: 'Security',
    x: 680,
    y: 760,
    color: '#f43f5e',
    taskTitle: 'Check Cams: Pre-Increment',
    taskQuestion: 'What value is printed for b?',
    code: `#include <stdio.h>\nint main() {\n    int a = 3;\n    int b = ++a * 2;\n    printf("%d", b);\n    return 0;\n}`,
    options: ['6', '8', '7', '4'],
    correctAnswer: 1,
    points: 10,
    explanation: '++a increments a to 4 first, then 4 * 2 = 8.'
  },
  {
    id: 'comms',
    name: 'Communications',
    x: 1900,
    y: 1490,
    color: '#14b8a6',
    taskTitle: 'Download Data: Type Casting',
    taskQuestion: 'What integer is printed?',
    code: `#include <stdio.h>\nint main() {\n    float f = 5.75;\n    int n = (int)f + 2;\n    printf("%d", n);\n    return 0;\n}`,
    options: ['7', '8', '7.75', '5'],
    correctAnswer: 0,
    points: 10,
    explanation: '(int)5.75 truncates to 5, and 5 + 2 = 7.'
  }
];

export const SABOTAGE_TARGETS = [
  { id: 'reactor',    name: 'Reactor',        icon: '☢️', label: 'Reactor Meltdown' },
  { id: 'electrical', name: 'Electrical',     icon: '⚡', label: 'Fix Lights (Electrical)' },
  { id: 'o2',         name: 'O2',             icon: '🫁', label: 'O2 Depletion' },
  { id: 'comms',      name: 'Communications', icon: '📡', label: 'Comms Sabotage' }
];

export const SABOTAGE_BUGS = {
  reactor: {
    title: '☢️ REACTOR MELTDOWN',
    question: 'Tap the line causing Segmentation Fault in Reactor Core:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int *core = NULL;',
      '    *core = 100;',
      '    printf("%d", *core);',
      '    return 0;',
      '}'
    ],
    bugLine: 4,
    explanation: 'Line 4 dereferences a NULL pointer (*core = 100), crashing Reactor!'
  },
  electrical: {
    title: '⚡ LIGHTS / ELECTRICAL SABOTAGE',
    question: 'Tap the line using an Uninitialized Variable:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int voltage;',
      '    voltage += 230;',
      '    printf("Power: %d", voltage);',
      '    return 0;',
      '}'
    ],
    bugLine: 4,
    explanation: 'Line 4 reads uninitialized local variable voltage!'
  },
  o2: {
    title: '🫁 O2 DEPLETION ALERT',
    question: 'Tap the line causing an Infinite Loop in O2 Filter:',
    lines: [
      '#include <stdio.h>',
      'int main() {',
      '    int oxygen = 0;',
      '    while (oxygen < 100);',
      '    {',
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

export function highlightCCode(raw) {
  let s = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  s = s.replace(/(".*?")/g, '<span style="color:#a5d6ff;">$1</span>');
  s = s.replace(
    /\b(int|float|char|void|return|for|while|if|else|switch|case|break|default|NULL)\b/g,
    '<span style="color:#ff7b72;font-weight:700;">$1</span>'
  );
  s = s.replace(/\b(printf|malloc|free|main)\b/g, '<span style="color:#d2a8ff;">$1</span>');
  s = s.replace(/(#[a-zA-Z_]+)/g, '<span style="color:#7ee787;font-weight:700;">$1</span>');
  return s;
}
