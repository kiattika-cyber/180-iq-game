
// Basic factorial function
export function factorial(n: number): number {
  if (n < 0) return NaN; // Factorial is not defined for negative numbers
  if (n === 0) return 1;
  let result = 1;
  for (let i = n; i > 0; i--) {
    result *= i;
  }
  return result;
}

// Simple string-based math evaluator (use with extreme caution, limited safety)
// Tries to replace display operators with JS evaluable operators
export function evaluateEquation(equation: string): number | null {
  let evalEquation = equation
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\^/g, '**'); // Power operator

  // Handle factorial: replace "N!" with "factorial(N)"
  // This regex finds numbers followed by ! and ensures they are not part of a larger word
  evalEquation = evalEquation.replace(/(\d+)!/g, (match, num) => `factorial(${num})`);
  
  // Handle square root: replace "√N" or "√(N)" with "Math.sqrt(N)"
  // This is tricky with freeform input. A simple regex might be:
  evalEquation = evalEquation.replace(/√(\d+)/g, (match, num) => `Math.sqrt(${num})`);
  evalEquation = evalEquation.replace(/√\((\d+)\)/g, (match, num) => `Math.sqrt(${num})`);


  try {
    // Create a function with access to Math and our factorial helper
    const func = new Function('factorial', 'return ' + evalEquation);
    const result = func(factorial);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Number(result.toFixed(5)); // Round to avoid floating point issues
    }
    return null;
  } catch (error) {
    console.error("Evaluation error:", error);
    return null;
  }
}

// Extracts numbers from an equation string
export function extractNumbersFromEquation(equation: string): number[] {
    const matches = equation.match(/\d+(\.\d+)?/g);
    return matches ? matches.map(Number) : [];
}

// Checks if the equation uses only numbers from the problem set, and uses each required number at least once.
export function validateNumbersInEquation(equationNumbers: number[], problemNumbers: number[]): boolean {
    if (equationNumbers.length === 0 && problemNumbers.length > 0) return false;

    const problemNumCounts = problemNumbers.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const equationNumCounts = equationNumbers.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    // Check if all numbers in equation are from problem numbers (considering counts for duplicates)
    for (const num in equationNumCounts) {
        if (!problemNumCounts[num] || equationNumCounts[num] > problemNumCounts[num]) {
            return false;
        }
    }
    
    // Check if all problem numbers (considering counts) are used in the equation
    for (const num in problemNumCounts) {
        if (!equationNumCounts[num] || equationNumCounts[num] < problemNumCounts[num]) {
           return false;
        }
    }
    return true;
}