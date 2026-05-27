import React, { useState, useEffect, useCallback } from 'react';
import { Problem, PlayerAnswer, GameSettings, GameSession, Difficulty } from '../types';
import { generateProblem, checkPlayerAnswer } from '../services/gameLogic';
import SpecialKeyboard from './SpecialKeyboard';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon } from './IconComponents'; 
import { TOTAL_PROBLEMS, DIFFICULTY_OPERATORS_DISPLAY, APP_TITLE, BACKSPACE, CLEAR } from '../constants';


interface GameScreenProps {
  settings: GameSettings;
  onGameEnd: (session: GameSession) => void;
}


const GameScreen: React.FC<GameScreenProps> = ({ settings, onGameEnd }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [currentEquation, setCurrentEquation] = useState<string>('');
  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [overallGameTimer, setOverallGameTimer] = useState<number>(0); // Overall game timer in ms
  const [questionTimer, setQuestionTimer] = useState<number>(0); // Timer for current question in ms
  const [showIncorrectModal, setShowIncorrectModal] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null); // For text feedback
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'incorrect' | null>(null); // For icon feedback
  const [showCorrectFeedback, setShowCorrectFeedback] = useState<boolean>(false);




  useEffect(() => {
    document.title = `${APP_TITLE} - กำลังเล่น...`;
    const initialProblems = Array.from({ length: TOTAL_PROBLEMS }, () =>
      generateProblem(settings.difficulty, settings.problemDigits, settings.targetDigits) // Pass targetDigits
    );
    setProblems(initialProblems);
    setOverallGameTimer(0);
    setQuestionTimer(0);
    setCurrentProblemIndex(0);
    setCurrentEquation('');
    setFeedbackMessage(null);
    setFeedbackStatus(null);
    setShowCorrectFeedback(false);
  }, [settings]);


  // Overall game timer
  useEffect(() => {
    if (problems.length === 0 || currentProblemIndex >= TOTAL_PROBLEMS) return;


    const intervalId = setInterval(() => {
      setOverallGameTimer(prev => prev + 100);
    }, 100);
    return () => clearInterval(intervalId);
  }, [problems, currentProblemIndex]);


   // Per-question timer
  useEffect(() => {
    if (problems.length === 0 || currentProblemIndex >= TOTAL_PROBLEMS || showIncorrectModal || feedbackStatus === 'correct') {
      return;
    }
    const intervalId = setInterval(() => {
      setQuestionTimer(prev => prev + 100);
    }, 100);
    return () => clearInterval(intervalId);
  }, [problems, currentProblemIndex, showIncorrectModal, feedbackStatus]);




  const currentProblem = problems[currentProblemIndex];


  const proceedToNextQuestion = useCallback(() => {
    setCurrentEquation('');
    setFeedbackMessage(null);
    setFeedbackStatus(null);
    setShowCorrectFeedback(false);
    setQuestionTimer(0);
    if (currentProblemIndex + 1 < TOTAL_PROBLEMS) {
      setCurrentProblemIndex(prev => prev + 1);
    }
  }, [currentProblemIndex]);




  const handleSubmitAnswer = useCallback(() => {
    if (!currentProblem || !currentEquation.trim() || feedbackStatus === 'correct') return;


    const validationResult = checkPlayerAnswer(currentEquation, currentProblem);
    const playerAnswer: PlayerAnswer = {
      problem: currentProblem,
      equation: currentEquation,
      isCorrect: validationResult.isValid,
      timeTaken: questionTimer,
      status: validationResult.isValid ? 'correct' : 'incorrect',
    };
    console.log("Current answers before this submission:", answers); // <--- เพิ่มบรรทัดนี้เพื่อใช้งานตัวแปร
    setAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers, playerAnswer];
     
      if (validationResult.isValid) {
        setFeedbackMessage('ถูกต้อง!');
        setFeedbackStatus('correct');
        setShowCorrectFeedback(true); // Trigger fade-in
        setTimeout(() => {
          setShowCorrectFeedback(false); // Start fade-out
          setTimeout(() => { // After fade-out, proceed
            if (currentProblemIndex + 1 < TOTAL_PROBLEMS) {
              proceedToNextQuestion();
            } else {
              const correctAnswersCount = updatedAnswers.filter(a => a.status === 'correct').length;
              onGameEnd({
                ...settings,
                answers: updatedAnswers,
                totalTime: overallGameTimer,
                score: correctAnswersCount * 10,
                accuracy: (correctAnswersCount / TOTAL_PROBLEMS) * 100,
              });
            }
          }, 500); // Match transition duration
        }, 1000); // Duration of feedback before fade-out
      } else {
        let specificFeedback = `ยังไม่ถูก (ผลลัพธ์: ${validationResult.evaluatedResult ?? 'N/A'})`;
        if (!validationResult.areNumbersUsedCorrectly) {
            specificFeedback = "ใช้ตัวเลขไม่ถูกต้อง! กรุณาใช้ตัวเลขจากโจทย์ และใช้ให้ครบทุกตัว (หากโจทย์มีเลขซ้ำ ก็ต้องใช้ซ้ำตามจำนวน)";
        }
        setFeedbackMessage(specificFeedback);
        setFeedbackStatus('incorrect');
        setShowIncorrectModal(true);
      }
      return updatedAnswers;
    });


  }, [currentProblem, currentEquation, questionTimer, proceedToNextQuestion, feedbackStatus, onGameEnd, settings, overallGameTimer, currentProblemIndex]);
 
  const handleKeyPress = useCallback((key: string) => {
    if (feedbackStatus === 'correct' && showCorrectFeedback) return;


    if (feedbackStatus === 'incorrect' && !showIncorrectModal) {
        setFeedbackMessage(null);
        setFeedbackStatus(null);
    }
   
    if (key === BACKSPACE) {
      setCurrentEquation(prev => prev.slice(0, -1));
    } else if (key === CLEAR) {
      setCurrentEquation('');
    } else {
      // Append the key (which could be "Σ(i," or a number, operator, comma, etc.)
      if (currentEquation.length < 100) {
         setCurrentEquation(prev => prev + key);
      }
    }
  }, [feedbackStatus, showIncorrectModal, currentEquation, showCorrectFeedback]);




  const handleEditAnswer = () => {
    setShowIncorrectModal(false);
    setFeedbackMessage(null); // Clear feedback message from modal
    setFeedbackStatus(null);
  };


  const handleSkipQuestion = () => {
    setShowIncorrectModal(false);
    if (!currentProblem || (feedbackStatus === 'correct' && showCorrectFeedback) ) return;


    const skippedAnswer: PlayerAnswer = {
      problem: currentProblem,
      equation: '',
      isCorrect: null,
      timeTaken: questionTimer,
      status: 'skipped',
    };
    console.log("Current answers before skipping:", answers); // <--- เพิ่มบรรทัดนี้เพื่อใช้งานตัวแปร
    setAnswers(prevAnswers => {
      const updatedAnswers = [...prevAnswers, skippedAnswer];
      if (currentProblemIndex + 1 < TOTAL_PROBLEMS) {
         // proceedToNextQuestion will be called after state update if not handled by timeout logic for correct feedback
      } else {
        const correctAnswersCount = updatedAnswers.filter(a => a.status === 'correct').length;
        onGameEnd({
          ...settings,
          answers: updatedAnswers,
          totalTime: overallGameTimer,
          score: correctAnswersCount * 10,
          accuracy: (correctAnswersCount / TOTAL_PROBLEMS) * 100,
        });
      }
      return updatedAnswers;
    });
    if (currentProblemIndex + 1 < TOTAL_PROBLEMS) {
        proceedToNextQuestion();
    }
  };


  if (!currentProblem) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-900"><LoadingSpinner text="กำลังสร้างโจทย์..." /></div>;
  }


  const displayOperators = DIFFICULTY_OPERATORS_DISPLAY[settings.difficulty as Difficulty].join('  ');


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-100">
      <div className="w-full max-w-lg bg-slate-800 shadow-xl rounded-lg p-6">
        <div className="flex justify-between items-center mb-4 text-slate-400">
          <span>ข้อที่: {currentProblemIndex + 1} / {TOTAL_PROBLEMS}</span>
          <span>ผู้เล่น: {settings.playerName}</span>
          <span>เวลาเกม: {(overallGameTimer / 1000).toFixed(1)} วิ</span>
        </div>


        {/* Problem Display */}
        <div className="bg-slate-700 p-6 rounded-lg mb-6 text-center shadow-md">
          <p className="text-slate-300 text-sm mb-1">สร้างสมการจากตัวเลขเหล่านี้:</p>
          <div className="flex justify-center items-center space-x-3 my-2">
            {currentProblem.numbers.map((num, idx) => (
                <span key={idx} className="text-4xl font-bold text-sky-400 bg-slate-800 px-3 py-1 rounded-md shadow-sm">
                {num}
                </span>
            ))}
          </div>
          <p className="text-slate-300 text-sm mb-1">เพื่อให้ได้ผลลัพธ์:</p>
          <p className="text-5xl font-bold text-amber-400">
            {currentProblem.target}
          </p>
           <p className="text-xs text-slate-500 mt-1">เวลาข้อนี้: {(questionTimer / 1000).toFixed(1)} วิ</p>
          <p className="text-xs text-slate-500 mt-3">เครื่องหมายที่ใช้ได้: {displayOperators}</p>
        </div>


        {/* Equation Input Area */}
        <div className="relative mb-1">
          <div className="w-full min-h-[5rem] p-4 bg-slate-900 text-slate-100 border-2 border-slate-700 rounded-md text-2xl text-center tracking-wider focus-within:border-sky-500 break-all flex items-center justify-center">
            {currentEquation || <span className="text-slate-500">พิมพ์สมการของคุณที่นี่...</span>}
          </div>
          {/* Correct Feedback Icon with Fade */}
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity duration-500 ease-in-out ${showCorrectFeedback ? 'opacity-100' : 'opacity-0'}`}>
            {feedbackStatus === 'correct' && <CheckIcon className="text-green-500 w-8 h-8" />}
          </div>
        </div>
         {/* Correct Feedback Message with Fade */}
        <div className={`text-center text-green-400 font-semibold mb-2 transition-opacity duration-500 ease-in-out min-h-[1.5rem] ${showCorrectFeedback ? 'opacity-100' : 'opacity-0'}`}>
            {feedbackStatus === 'correct' ? feedbackMessage : ''}
        </div>
       
        {/* Submit & Skip Buttons - only show if no active correct feedback animation */}
         {!(feedbackStatus === 'correct' && showCorrectFeedback) && (
            <div className="space-y-2 mb-4">
                 <button
                    onClick={handleSkipQuestion}
                    disabled={(feedbackStatus === 'correct' && showCorrectFeedback)}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-slate-900 font-semibold py-3 px-4 rounded-md shadow-md transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ข้ามข้อนี้
                </button>
                <button
                onClick={handleSubmitAnswer}
                disabled={!currentEquation.trim() || (feedbackStatus === 'correct' && showCorrectFeedback)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 px-4 rounded-md shadow-md transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                ส่งคำตอบ (หลัก)
                </button>
            </div>
         )}




        {/* Special Keyboard */}
        <SpecialKeyboard
          problemNumbers={currentProblem.numbers}
          difficulty={settings.difficulty as Difficulty}
          onKeyPress={handleKeyPress}
        />


        {/* Incorrect Answer Modal */}
        <Modal isOpen={showIncorrectModal} title="คำตอบไม่ถูกต้อง!" onClose={handleEditAnswer}>
          <p className="text-slate-300 mb-6">{feedbackMessage || "คำตอบของคุณยังไม่ถูกต้อง ลองตรวจสอบดูอีกครั้ง หรือจะข้ามข้อนี้ไปก่อนก็ได้"}</p>
          <div className="flex space-x-4">
            <button
              onClick={handleEditAnswer}
              className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-md shadow transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95"
            >
              แก้ไข (สู้ต่อ)
            </button>
            <button
              onClick={() => {
                setShowIncorrectModal(false);
                handleSkipQuestion();
              }}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md shadow transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95"
            >
              ข้าม (ไปข้อถัดไป)
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};


export default GameScreen;