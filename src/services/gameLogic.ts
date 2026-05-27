
import { Difficulty, Problem, ProblemDigits } from '../types';
import { OPERATORS_MAP } from '../constants';
import { evaluateEquation, extractNumbersFromEquation, validateNumbersInEquation } from '../utils/helpers';

// Generates a unique ID for problems
let problemIdCounter = 0;

export function generateProblem(difficulty: Difficulty, problemDigits: ProblemDigits, targetDigits: 2 | 3): Problem {
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

  const minTarget = targetDigits === 2 ? 10 : 100;
  const maxTarget = targetDigits === 2 ? 99 : 999;

  // Attempt to generate a solvable target
  while ((target === null || target < minTarget || target > maxTarget || String(target).startsWith('0')) && attempts < 200) { // Increased attempts
    const numsToUse = [...numbers].sort(() => 0.5 - Math.random()).slice(0, Math.min(numbers.length, Math.floor(Math.random() * 2) + 2)); // 2 or 3 numbers
    if (numsToUse.length < 2 && numbers.length >=2) { // Ensure at least 2 numbers are used if available
        attempts++;
        continue;
    }
    if (numsToUse.length < 1 && numbers.length === 1) { // Handle single number case for ops like factorial/sqrt
         // allow single number expressions if problem has only one number (though unlikely with current gen)
    } else if (numsToUse.length < 2) {
        attempts++;
        continue;
    }

    let expression = String(numsToUse[0]);
    let expressionValid = true;

    for (let i = 1; i < numsToUse.length; i++) {
      const op = availableOperators[Math.floor(Math.random() * availableOperators.length)];
      
      if (op === '!' || op === 'sqrt') { // These ops apply to a single number or an expression
        if (Math.random() < 0.5 && i === numsToUse.length -1) { // Apply to last number
             if (op === '!' && (numsToUse[i] > 7 || numsToUse[i] < 0)) { expressionValid = false; break;}
             if (op === 'sqrt' && numsToUse[i] < 0) { expressionValid = false; break;}
             expression = `(${expression} ${availableOperators[Math.floor(Math.random() * availableOperators.filter(o => o !== '!' && o !== 'sqrt').length)]} (${op === '!' ? `${numsToUse[i]}!` : `sqrt(${numsToUse[i]})`}))`;
        } else { // Apply to the whole expression so far
            if (op === '!') { expression = `(${expression})!`; } 
            else if (op === 'sqrt') { expression = `sqrt(${expression})`;}
        }
      } else if (op === '**') { // Power
        const expVal = Math.random() < 0.5 ? 2 : 3; // limit exponent for sanity
        expression = `(${expression} ${op} ${expVal})`;
      }
      else {
        expression = `(${expression} ${op} ${numsToUse[i]})`;
      }
    }
    if (!expressionValid) { attempts++; continue;}
    
    let tempTarget: number | null = null;
    try {
        tempTarget = evaluateEquation(expression.replace(/\^/g, '**'));
        if (tempTarget !== null) {
            tempTarget = Number(tempTarget.toFixed(0)); // Round to nearest integer for target
        }
    } catch { /* ignore errors for generation */ }

    if (tempTarget !== null && !isNaN(tempTarget) && isFinite(tempTarget) && tempTarget >= minTarget && tempTarget <= maxTarget && !String(tempTarget).startsWith('0') && Number.isInteger(tempTarget)) {
      const expressionNumbers = extractNumbersFromEquation(expression);
      if (expressionNumbers.length > 0) {
          target = tempTarget;
      }
    }
    attempts++;
  }

  if (target === null) { // Fallback if generation fails
    if (targetDigits === 2) {
      target = Math.floor(Math.random() * (99 - 10 + 1)) + 10; // 10-99
    } else { // targetDigits === 3
      target = Math.floor(Math.random() * (999 - 100 + 1)) + 100; // 100-999
    }
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