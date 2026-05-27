
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
  evalEquation = evalEquation.replace(/√(\d+)/g, (match, num) => `Math.sqrt(${num})`);
  evalEquation = evalEquation.replace(/√\((\d+)\)/g, (match, num) => `Math.sqrt(${num})`);

  // Handle Sigma: Σ(lower,upper) - simple version, variable is implied
  // Example: Σ(1,4) -> 1+2+3+4 = 10
  evalEquation = evalEquation.replace(/Σ\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (match, lowerStr, upperStr) => {
    const lower = parseInt(lowerStr, 10);
    const upper = parseInt(upperStr, 10);

    if (isNaN(lower) || isNaN(upper) || lower > upper) {
      console.error(`Invalid Sigma bounds: Σ(${lowerStr},${upperStr})`);
      return 'NaN'; // Return NaN string which will cause evaluation to fail later
    }
    let sum = 0;
    for (let i = lower; i <= upper; i++) {
      sum += i;
    }
    return String(sum);
  });
  
  // Handle Sigma: Σ(variable,lower,upper) -> sum from lower to upper
  // Example: Σ(n,1,4) -> 1+2+3+4 = 10. The 'variable' (e.g., 'n') is a placeholder.
  // This regex attempts to match Σ(any_chars_except_comma_and_paren, digits, digits)
  evalEquation = evalEquation.replace(/Σ\s*\(([^,)]+)\s*,\s*(\d+)\s*,\s*(\d+)\)/g, (match, _variable, lowerStr, upperStr) => {
    const lower = parseInt(lowerStr, 10);
    const upper = parseInt(upperStr, 10);

    if (isNaN(lower) || isNaN(upper) || lower > upper) {
      console.error(`Invalid Sigma bounds: Σ(${_variable},${lowerStr},${upperStr})`);
      return 'NaN'; // Return NaN string which will cause evaluation to fail later
    }

    let sum = 0;
    for (let i = lower; i <= upper; i++) {
      sum += i;
    }
    return String(sum);
  });


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
