
export enum Difficulty {
  Easy = "ระดับ 1 (ป.1-ป.3)",
  Medium = "ระดับ 2 (ป.4-ป.6)",
  Hard = "ระดับ 3 (ม.1-ม.6)",
}

export enum ProblemDigits {
  Four = "4 ตัวเลข",
  Five = "5 ตัวเลข",
}

export interface Problem {
  id: number;
  numbers: number[];
  target: number;
  availableOperators: string[];
}

export interface PlayerAnswer {
  problem: Problem;
  equation: string;
  isCorrect: boolean | null; // null if skipped
  timeTaken: number; // in seconds
  aiSolution?: string;
  aiAlternative?: string;
  status: 'correct' | 'incorrect' | 'skipped';
}

export interface GameSettings {
  playerName: string;
  difficulty: Difficulty;
  problemDigits: ProblemDigits;
}

export interface GameSession extends GameSettings {
  answers: PlayerAnswer[];
  totalTime: number;
  score: number;
  accuracy: number;
}

export type ScreenView = "home" | "game" | "results";

// For AI interaction
export interface AISolutionRequest {
  problemNumbers: number[];
  target: number;
  operators: string[];
  playerEquation?: string; // For incorrect answers or providing context
  isCorrectAttempt?: boolean; // True if player got it right, seeking alternatives
}