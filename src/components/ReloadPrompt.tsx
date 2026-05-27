
import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker registered:', r);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed right-0 bottom-0 m-4 p-4 bg-slate-700 text-slate-100 rounded-lg shadow-xl z-50 border border-sky-500">
        <div className="mb-2 text-sm">
          {offlineReady ? (
            <span>แอปพร้อมใช้งานแบบออฟไลน์แล้ว!</span>
          ) : (
            <span>มีเวอร์ชันใหม่พร้อมใช้งานแล้ว!</span>
          )}
        </div>
        {needRefresh && (
          <button
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-3 rounded-md shadow-md transition-colors duration-150 text-sm mb-2"
            onClick={() => updateServiceWorker(true)}
          >
            รีโหลดเพื่ออัปเดต
          </button>
        )}
        <button
          className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold py-1 px-3 rounded-md shadow-md transition-colors duration-150 text-xs"
          onClick={() => close()}
        >
          ปิด
        </button>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;
