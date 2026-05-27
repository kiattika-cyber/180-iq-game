
import { Difficulty, Problem, ProblemDigits } from '../types';
import { OPERATORS_MAP } from '../constants';
import { evaluateEquation, extractNumbersFromEquation, validateNumbersInEquation, factorial } from '../utils/helpers';

// Generates a unique ID for problems
let problemIdCounter = 0;

export function generateProblem(difficulty: Difficulty, problemDigits: ProblemDigits): Problem {
  problemIdCounter++;
  const numDigits = problemDigits === ProblemDigits.Four ? 4 : 5;
  const numbers: number[] = [];
  const numCounts: Record<number, number> = {};

  // Generate unique numbers for the problem set
  while (numbers.length < numDigits) {
    const randNum = Math.floor(Math.random() * 10); // 0-9
    if (randNum === 0 && numbers.filter(n => n === 0).length >= 1) {
      continue; // Max one 0
    }
    if ((numCounts[randNum] || 0) < 2) { // Max two duplicates of any number
      numbers.push(randNum);
      numCounts[randNum] = (numCounts[randNum] || 0) + 1;
    }
  }
  
  numbers.sort(() => Math.random() - 0.5); // Shuffle them for problem presentation

  const availableOperators = OPERATORS_MAP[difficulty];
  let target: number | null = null;
  let attempts = 0;

  // Attempt to generate a solvable target
  while ((target === null || target < 10 || target > 999 || String(target).startsWith('0')) && attempts < 100) {
    // Simple target generation: pick 2-3 numbers, 1-2 ops, calculate
    const numsToUse = [...numbers].sort(() => 0.5 - Math.random()).slice(0, Math.min(numbers.length, Math.floor(Math.random() * 2) + 2)); // 2 or 3 numbers
    if (numsToUse.length < 2) {
        attempts++;
        continue;
    }

    let expression = String(numsToUse[0]);
    for (let i = 1; i < numsToUse.length; i++) {
      const op = availableOperators[Math.floor(Math.random() * availableOperators.length)];
      if (op === '!' && numsToUse[i] > 7) continue; // Avoid large factorials for simple target gen
      if (op === 'sqrt' && numsToUse[i] < 0) continue;

      if (op === '!') {
        expression = `(${expression})${op}`; // Not quite right for combining, simple case for one num
         if (numsToUse.length === 1) expression = `${numsToUse[0]}!`; else continue; // Factorial typically applies to one num
      } else if (op === 'sqrt') {
         if (numsToUse.length === 1) expression = `sqrt(${numsToUse[0]})`; else continue; // Sqrt applies to one num
      }
      else {
        expression = `(${expression} ${op} ${numsToUse[i]})`;
      }
    }
    
    // Use a simplified version of evaluateEquation for internal target generation
    // This is a very naive way and might not cover all ops perfectly for generation
    let tempTarget: number | null = null;
    try {
        let evalExpr = expression
            .replace('sqrt(', 'Math.sqrt(')
            .replace(/(\d+)!/g, (m, n) => `factorial(${n})`);
        const func = new Function('factorial', 'return ' + evalExpr);
        tempTarget = Number(func(factorial).toFixed(0));
    } catch { /* ignore errors for generation */ }


    if (tempTarget !== null && !isNaN(tempTarget) && isFinite(tempTarget) && tempTarget >= 10 && tempTarget <= 999 && !String(tempTarget).startsWith('0')) {
      target = tempTarget;
    }
    attempts++;
  }

  if (target === null) { // Fallback if generation fails
    target = Math.floor(Math.random() * 900) + 100; // Random 3-digit number
  }
  
  return {
    id: problemIdCounter,
    numbers: numbers,
    target: target,
    availableOperators: availableOperators,
  };
}

export interface ValidationResult {
  isValid: boolean;
  isSyntaxValid?: boolean; // For basic syntax check if needed
  areNumbersUsedCorrectly?: boolean;
  evaluatedResult?: number | null;
}

export function checkPlayerAnswer(
  equation: string,
  problem: Problem
): ValidationResult {
  if (!equation.trim()) {
    return { isValid: false, evaluatedResult: null, areNumbersUsedCorrectly: false };
  }

  const equationNumbers = extractNumbersFromEquation(equation);
  const numbersUsedCorrectly = validateNumbersInEquation(equationNumbers, problem.numbers);

  if (!numbersUsedCorrectly) {
     return { isValid: false, evaluatedResult: null, areNumbersUsedCorrectly: false };
  }

  const evaluatedResult = evaluateEquation(equation);
  
  if (evaluatedResult === null) {
    return { isValid: false, evaluatedResult: null, areNumbersUsedCorrectly: true }; // Syntax or math error during eval
  }

  // Using a tolerance for floating point comparisons
  const tolerance = 0.0001;
  const isCorrect = Math.abs(evaluatedResult - problem.target) < tolerance;

  return {
    isValid: isCorrect,
    evaluatedResult: evaluatedResult,
    areNumbersUsedCorrectly: numbersUsedCorrectly,
  };
}