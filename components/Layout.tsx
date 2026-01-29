
import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F5F5F7] selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/20 overflow-hidden">
        {children}
      </div>
      <footer className="mt-12 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-medium flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <span>Précision</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Confort</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Style</span>
        </div>
        <div className="opacity-40 text-[8px] tracking-[0.5em] font-bold">Optical Center</div>
      </footer>
    </div>
  );
};
