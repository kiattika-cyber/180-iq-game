
import { Difficulty } from './types';

export const TOTAL_PROBLEMS = 10;

export const OPERATORS_MAP: Record<Difficulty, string[]> = {
  [Difficulty.Easy]: ['+', '-', '*', '/', '**'], // ** for power
  [Difficulty.Medium]: ['+', '-', '*', '/', '**', 'sqrt'], // sqrt for square root
  [Difficulty.Hard]: ['+', '-', '*', '/', '**', 'sqrt', '!', 'Σ'], // ! for factorial, Σ for Sigma
};

export const DIFFICULTY_OPERATORS_DISPLAY: Record<Difficulty, string[]> = {
  [Difficulty.Easy]: ['+', '−', '×', '÷', '^'],
  [Difficulty.Medium]: ['+', '−', '×', '÷', '^', '√'],
  [Difficulty.Hard]: ['+', '−', '×', '÷', '^', '√', '!', 'Σ'],
};


export const ALL_POSSIBLE_OPERATORS_FOR_KEYBOARD = ['+', '−', '×', '÷', '^', '√', '!', '(', ')', 'Σ', ',']; // Added Comma

export const PARENTHESES = ['(', ')'];
export const BACKSPACE = '⌫';
export const CLEAR = 'C';
export const SUBMIT_ANSWER = 'ส่งคำตอบ'; // Kept for potential other uses, though SpecialKeyboard doesn't send it for main submission now.
// SIGMA_TEMPLATE_KEY is removed as the keyboard now sends the string "Σ(i," directly.

export const AI_MODEL_NAME = 'gemini-3.5-flash';

export const APP_TITLE = "180 IQ : เกมส์คนอัจฉริยะ";