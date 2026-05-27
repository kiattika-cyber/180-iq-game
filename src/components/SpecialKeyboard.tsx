
import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_OPERATORS_DISPLAY, PARENTHESES, BACKSPACE, CLEAR } from '../constants';

interface SpecialKeyboardProps {
  problemNumbers: number[];
  difficulty: Difficulty;
  onKeyPress: (key: string) => void;
}

const SpecialKeyboard: React.FC<SpecialKeyboardProps> = ({ problemNumbers, difficulty, onKeyPress }) => {
  const difficultyOperators = DIFFICULTY_OPERATORS_DISPLAY[difficulty] || [];
  const numericKeys = [...new Set(problemNumbers)].sort((a, b) => a - b); // Unique, sorted numbers

  // Filter operators that are actually in DIFFICULTY_OPERATORS_DISPLAY for the current difficulty
  // and also include comma and parentheses.
  let operatorKeysForDisplay: string[] = [];
  if (difficultyOperators.includes('Σ')) {
    operatorKeysForDisplay.push('Σ'); // Keep Σ visually
  }
  operatorKeysForDisplay.push(...difficultyOperators.filter(op => op !== 'Σ')); // Add other ops for current difficulty
  operatorKeysForDisplay.push(...PARENTHESES);
  operatorKeysForDisplay.push(','); // Add comma

  // Ensure unique keys if some ops are also in PARENTHESES (though not typical)
  operatorKeysForDisplay = [...new Set(operatorKeysForDisplay)];


  const renderButton = (key: string | number, className: string = '', colSpan: number = 1, textOverride?: string) => {
    const displayKey = textOverride || key;
    // Special handling for Sigma button to send the template string
    const pressKey = key === 'Σ' ? "Σ(i," : String(key);

    return (
      <button
        key={String(key)} 
        onClick={() => onKeyPress(pressKey)}
        className={`col-span-${colSpan} bg-slate-700 hover:bg-sky-600 active:bg-sky-700 text-slate-100 font-semibold py-3 px-2 rounded-md shadow-md transition-colors duration-150 text-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-transform ease-in-out hover:scale-105 active:scale-95 ${className}`}
        aria-label={String(displayKey)}
        title={String(displayKey)}
      >
        {displayKey}
      </button>
    );
  };
  
  return (
    <div className="grid grid-cols-5 gap-2 p-2 bg-slate-800 rounded-lg shadow-inner mt-4 select-none">
      {/* Number Keys */}
      {numericKeys.map(num => renderButton(num, 'bg-slate-600 hover:bg-slate-500 active:bg-slate-400'))}
      {/* Fill remaining numeric row spots if less than 5 unique numbers to align subsequent rows */}
      {numericKeys.length % 5 !== 0 && Array(Math.max(0, 5 - (numericKeys.length % 5))).fill(null).map((_, i) => 
         <div key={`fill-num-align-${i}`} className="col-span-1" aria-hidden="true"></div>
      )}
      
      {/* Operator, Parentheses & Comma Keys */}
      {operatorKeysForDisplay.map(op => renderButton(op))}
      
      {/* Fill remaining slots before controls if combined ops don't end on a multiple of 5 */}
      {operatorKeysForDisplay.length % 5 !== 0 && Array(Math.max(0, 5 - (operatorKeysForDisplay.length % 5))).fill(null).map((_, i) => (
        <div key={`fill-op-align-${i}`} className="col-span-1" aria-hidden="true"></div>
      ))}
      
      {/* Control Keys: Clear (2), Backspace (3) to make a full row of 5 */}
      {renderButton(CLEAR, 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700', 2)}
      {renderButton(BACKSPACE, 'bg-red-600 hover:bg-red-500 active:bg-red-700', 3, '⌫')}
    </div>
  );
};

export default SpecialKeyboard;