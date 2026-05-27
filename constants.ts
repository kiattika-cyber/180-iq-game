
import { Difficulty } from './types';

export const TOTAL_PROBLEMS = 10;

export const OPERATORS_MAP: Record<Difficulty, string[]> = {
  [Difficulty.Easy]: ['+', '-', '*', '/', '**'], // ** for power
  [Difficulty.Medium]: ['+', '-', '*', '/', '**', 'sqrt'], // sqrt for square root
  [Difficulty.Hard]: ['+', '-', '*', '/', '**', 'sqrt', '!'], // ! for factorial
};

export const DIFFICULTY_OPERATORS_DISPLAY: Record<Difficulty, string[]> = {
  [Difficulty.Easy]: ['+', '−', '×', '÷', '^'],
  [Difficulty.Medium]: ['+', '−', '×', '÷', '^', '√'],
  [Difficulty.Hard]: ['+', '−', '×', '÷', '^', '√', '!'],
};


export const ALL_POSSIBLE_OPERATORS_FOR_KEYBOARD = ['+', '−', '×', '÷', '^', '√', '!', '(', ')'];

export const PARENTHESES = ['(', ')'];
export const BACKSPACE = '⌫';
export const CLEAR = 'C';

export const AI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const APP_TITLE = "180 IQ : เกมส์คนอัจฉริยะ";