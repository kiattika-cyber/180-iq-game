
import React, { useState, useEffect } from 'react';
import { PlayerAnswer, AISolutionRequest } from '../types';
import { getAiHelp } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import { CheckIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon } from './IconComponents';


interface ResultCardProps {
  answer: PlayerAnswer;
  index: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ answer, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(answer.aiSolution || answer.aiAlternative || null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showAiInsight, setShowAiInsight] = useState(false);

  useEffect(() => {
    if (aiInsight && !isLoadingAi) {
      setShowAiInsight(true);
    } else {
      setShowAiInsight(false);
    }
  }, [aiInsight, isLoadingAi]);


  const { problem, equation, status, timeTaken } = answer;

  const fetchAiInsight = async () => {
    if (isLoadingAi) return;
    setShowAiInsight(false); // Hide while loading new one
    setIsLoadingAi(true);
    const request: AISolutionRequest = {
      problemNumbers: problem.numbers,
      target: problem.target,
      operators: problem.availableOperators,
      playerEquation: status !== 'skipped' ? equation : undefined,
      isCorrectAttempt: status === 'correct',
    };
    try {
      const insight = await getAiHelp(request);
      setAiInsight(insight);
      if (status === 'correct') answer.aiAlternative = insight;
      else answer.aiSolution = insight;

    } catch (error) {
      console.error("Failed to fetch AI insight:", error);
      setAiInsight("ไม่สามารถโหลดคำแนะนำจาก AI ได้ในขณะนี้");
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const cardBgColor = status === 'correct' ? 'bg-green-800/40 hover:bg-green-700/50' : status === 'incorrect' ? 'bg-red-800/40 hover:bg-red-700/50' : 'bg-slate-700/60 hover:bg-slate-600/70';
  const borderColor = status === 'correct' ? 'border-green-700' : status === 'incorrect' ? 'border-red-700' : 'border-slate-600';

  return (
    <div className={`border ${borderColor} rounded-lg shadow-md overflow-hidden transition-all duration-300 ${cardBgColor}`}>
      <div className="p-4 cursor-pointer flex justify-between items-center" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-sky-400">
            ข้อที่ {index + 1}: <span className="font-mono bg-slate-700 px-1 rounded-sm">{problem.numbers.join(', ')}</span> → <span className="text-amber-400">{problem.target}</span>
          </h3>
          <p className={`text-sm ${status === 'correct' ? 'text-green-400' : status === 'incorrect' ? 'text-red-400' : 'text-amber-400'}`}>
            <span className="font-semibold">สถานะ:</span> {status === 'correct' ? 'ถูกต้อง' : status === 'incorrect' ? 'ผิด' : 'ข้าม'}
            {status !== 'skipped' && equation && <span className="block md:inline mt-1 md:mt-0 md:ml-2"> <span className="font-semibold">คำตอบ:</span> <code className="font-mono bg-slate-600/70 px-1.5 py-0.5 rounded text-sm">{equation}</code></span>}
          </p>
        </div>
        <div className="flex items-center ml-2 flex-shrink-0">
          {status === 'correct' && <CheckIcon className="text-green-500 w-7 h-7 mr-2" />}
          {status === 'incorrect' && <XMarkIcon className="text-red-500 w-7 h-7 mr-2" />}
          {isExpanded ? <ChevronUpIcon className="text-slate-400 w-6 h-6" /> : <ChevronDownIcon className="text-slate-400 w-6 h-6" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/70">
          <p className="text-sm text-slate-300 mb-1"><strong>เวลาที่ใช้:</strong> {(timeTaken / 1000).toFixed(2)} วินาที</p>
          {status !== 'skipped' && equation && <p className="text-sm text-slate-300 mb-3"><strong>สมการของคุณ:</strong> <span className="font-mono bg-slate-700 px-1.5 py-0.5 rounded">{equation}</span></p>}
          
          { (status === 'incorrect' || status === 'skipped' || status === 'correct') && (
            <div className="mt-3">
              <button
                onClick={fetchAiInsight}
                disabled={isLoadingAi}
                className="flex items-center text-sm bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:opacity-70 text-white py-2 px-3 rounded-md shadow transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95"
              >
                <SparklesIcon className="mr-2" />
                {isLoadingAi ? 'กำลังโหลด...' : (aiInsight && !aiInsight.startsWith("ไม่สามารถ") && !aiInsight.startsWith("ข้อผิดพลาด")) ? (status === 'correct' ? 'แสดงวิธีคิดแบบอื่นจาก AI อีกครั้ง' : 'แสดงเฉลยจาก AI อีกครั้ง') : (status === 'correct' ? 'ดูวิธีคิดแบบอื่นจาก AI' : 'ดูเฉลยจาก AI')}
              </button>
              {isLoadingAi && <div className="mt-2"><LoadingSpinner size="sm" text="AI กำลังคิด..." /></div>}
              {aiInsight && !isLoadingAi && (
                <div className={`mt-3 p-3 bg-slate-700/80 rounded whitespace-pre-wrap text-sm text-slate-200 shadow-inner transition-opacity duration-500 ease-in-out ${showAiInsight ? 'opacity-100' : 'opacity-0'}`}>
                  <p className="font-semibold text-sky-300 mb-1">{status === 'correct' ? '✨ แนวทางเพิ่มเติมจาก AI ✨' : '💡 เฉลยและคำแนะนำจาก AI 💡'}</p>
                  {aiInsight}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
