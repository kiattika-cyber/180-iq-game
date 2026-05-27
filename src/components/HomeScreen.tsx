
import React, { useState, useEffect } from 'react';
import { Difficulty, ProblemDigits, GameSettings } from '../types';
import { APP_TITLE } from '../constants';

interface HomeScreenProps {
  onStartGame: (settings: GameSettings) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [problemDigits, setProblemDigits] = useState<ProblemDigits>(ProblemDigits.Four);
  const [targetDigits, setTargetDigits] = useState<2 | 3>(2); // New state for target digits

  useEffect(() => {
    const savedName = localStorage.getItem('iq180PlayerName');
    if (savedName) {
      setPlayerName(savedName);
    }
    // Set document title for Home screen
    document.title = `${APP_TITLE} - หน้าหลัก`;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert('กรุณากรอกชื่อผู้เล่น');
      return;
    }
    localStorage.setItem('iq180PlayerName', playerName.trim());
    onStartGame({
      playerName: playerName.trim(),
      difficulty,
      problemDigits,
      targetDigits, // Include targetDigits in settings
    });
  };

  const inputClass = "w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-slate-100 placeholder-slate-400";
  const labelClass = "block mb-2 text-sm font-medium text-sky-300";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <div className="w-full max-w-md p-8 bg-slate-800 shadow-2xl rounded-xl">
        <img src="https://picsum.photos/seed/iqgame/120/120" alt="Game Logo" className="mx-auto mb-6 rounded-full shadow-lg border-2 border-sky-500" />
        <h1 className="text-4xl font-bold text-center text-sky-400 mb-2">{APP_TITLE}</h1>
        <p className="text-center text-slate-400 mb-8">ฝึกสมอง ประลองปัญญา กับเกมส์คณิตศาสตร์สุดท้าทาย</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className={labelClass}>ชื่อผู้เล่น:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={inputClass}
              placeholder="เช่น อัจฉริยะน้อย"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="difficulty" className={labelClass}>ระดับความยาก:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={inputClass}
            >
              {Object.values(Difficulty).map(d => <option key={d} value={d} className="bg-slate-700 text-slate-100">{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="problemFormat" className={labelClass}>จำนวนตัวเลขในโจทย์:</label>
            <select
              id="problemFormat"
              value={problemDigits}
              onChange={(e) => setProblemDigits(e.target.value as ProblemDigits)}
              className={inputClass}
            >
              {Object.values(ProblemDigits).map(pf => <option key={pf} value={pf} className="bg-slate-700 text-slate-100">{pf}</option>)}
            </select>
          </div>

          {/* New Dropdown for Target Digits */}
          <div>
            <label htmlFor="targetDigits" className={labelClass}>จำนวนหลักของผลลัพธ์:</label>
            <select
              id="targetDigits"
              value={targetDigits}
              onChange={(e) => setTargetDigits(parseInt(e.target.value, 10) as 2 | 3)}
              className={inputClass}
            >
              <option value={2} className="bg-slate-700 text-slate-100">2 หลัก</option>
              <option value={3} className="bg-slate-700 text-slate-100">3 หลัก</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-4 rounded-md shadow-lg transition-transform duration-150 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
          >
            เริ่มทดสอบ IQ
          </button>
        </form>
      </div>
       <footer className="text-center text-slate-500 mt-8 text-sm">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Create&Design :  9n00m & Kru Piang | Programing :  AI & Team..</p>
      </footer>
    </div>
  );
};

export default HomeScreen;