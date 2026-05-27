import React, { useState } from 'react';
import { GameSession } from '../types';
import { generatePdfReport } from '../services/pdfService';
import ResultCard from './ResultCard';
import LoadingSpinner from './LoadingSpinner';
import { APP_TITLE } from '../constants';
import { ArrowPathIcon, HomeIcon, DocumentArrowDownIcon } from './IconComponents';

interface ResultsScreenProps {
  session: GameSession;
  onRestart: () => void;
  onGoHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ session, onRestart, onGoHome }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport(session);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("ไม่สามารถสร้าง PDF ได้");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8 text-slate-100">
      <div className="max-w-3xl mx-auto bg-slate-800 shadow-2xl rounded-xl p-6 md:p-8">
        <img src="https://picsum.photos/seed/iqresults/100/100" alt="Results Trophy" className="mx-auto mb-4 rounded-full shadow-lg border-2 border-amber-400" />
        <h1 className="text-3xl md:text-4xl font-bold text-center text-sky-400 mb-2">{APP_TITLE}</h1>
        <h2 className="text-xl md:text-2xl font-semibold text-center text-amber-400 mb-6">สรุปผลการทดสอบ IQ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-center">
          <div className="bg-slate-700/80 p-4 rounded-lg shadow-md">
            <p className="text-sm text-slate-400">ผู้เล่น</p>
            <p className="text-xl font-semibold text-sky-300">{session.playerName}</p>
          </div>
          <div className="bg-slate-700/80 p-4 rounded-lg shadow-md">
            <p className="text-sm text-slate-400">ระดับ</p>
            <p className="text-xl font-semibold text-sky-300">{session.difficulty} ({session.problemDigits})</p>
          </div>
          <div className="bg-slate-700/80 p-4 rounded-lg shadow-md">
            <p className="text-sm text-slate-400">คะแนน</p>
            <p className="text-2xl font-bold text-green-400">{session.score} / {session.answers.length * 10}</p>
          </div>
          <div className="bg-slate-700/80 p-4 rounded-lg shadow-md">
            <p className="text-sm text-slate-400">ความแม่นยำ</p>
            <p className="text-2xl font-bold text-amber-400">{session.accuracy.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-700/80 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
            <p className="text-sm text-slate-400">เวลาเฉลี่ยต่อข้อ / เวลารวม</p>
            <p className="text-xl font-semibold text-sky-300">
              {(session.answers.length > 0 ? (session.totalTime / 1000 / session.answers.length) : 0).toFixed(2)} วิ / {(session.totalTime / 1000).toFixed(2)} วิ
            </p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-sky-300 mb-4 mt-8">ผลลัพธ์รายข้อ:</h3>
        <div className="space-y-3 mb-8">
          {session.answers.map((ans, index) => (
            <ResultCard key={ans.problem.id || `ans-${index}`} answer={ans} index={index} />
          ))}
        </div>

        {isGeneratingPdf && <div className="my-4"><LoadingSpinner text="กำลังสร้างรายงาน PDF..." /></div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={onRestart}
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition-colors duration-150 transform hover:scale-105"
          >
            <ArrowPathIcon className="mr-2" /> ทดสอบอีกครั้ง
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center justify-center w-full bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition-colors duration-150 transform hover:scale-105"
          >
            <HomeIcon className="mr-2" /> กลับหน้าหลัก
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center justify-center w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition-colors duration-150 transform hover:scale-105 disabled:bg-slate-500 disabled:opacity-70 disabled:cursor-not-allowed"
          >
           <DocumentArrowDownIcon className="mr-2" /> ดาวน์โหลดรายงาน (PDF)
          </button>
        </div>
      </div>
       <footer className="text-center text-slate-500 mt-10 pb-6 text-sm">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}.</p>
      </footer>
    </div>
  );
};

export default ResultsScreen;