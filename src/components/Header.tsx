import React, { useState } from 'react';
import { Database, Code2, RefreshCw, Smartphone, Monitor, UserCheck, Check, Edit2 } from 'lucide-react';
import { getActiveAuditor, setActiveAuditor } from '../services/apiService';

interface HeaderProps {
  gasUrl: string;
  onOpenGasModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gasUrl,
  onOpenGasModal,
  onRefresh,
  isLoading,
}) => {
  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);
  const [auditorName, setAuditorName] = useState(getActiveAuditor());
  const [isEditingAuditor, setIsEditingAuditor] = useState(false);
  const [tempAuditor, setTempAuditor] = useState(auditorName);

  const handleSaveAuditor = () => {
    if (!tempAuditor.trim()) return;
    setActiveAuditor(tempAuditor);
    setAuditorName(tempAuditor.trim());
    setIsEditingAuditor(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 transition-colors">
      <div className="flex flex-col gap-2 max-w-xl mx-auto">
        {/* Top Row: Brand & System Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Lockup */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 shrink-0">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                Asset SO Incidental
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Mobile & Tablet Stock Opname
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenGasModal}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
              }`}
              title={isConnected ? 'Tersambung ke Google Sheet Multi-Tab' : 'Klik untuk hubungkan Google Sheet API'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="truncate max-w-[85px] sm:max-w-none">
                {isConnected ? 'Live Sheet' : 'Mock Mode'}
              </span>
            </button>

            <button
              onClick={onOpenGasModal}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Lihat Kode Backend Apps Script Multi-Tab"
            >
              <Code2 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Active Auditor Profile Bar */}
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0">Petugas SO:</span>
            {isEditingAuditor ? (
              <input
                type="text"
                value={tempAuditor}
                onChange={(e) => setTempAuditor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAuditor()}
                autoFocus
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-0.5 rounded text-xs font-bold border border-blue-500 focus:outline-none min-w-0 flex-1"
              />
            ) : (
              <strong className="text-slate-900 dark:text-white font-bold truncate">
                {auditorName}
              </strong>
            )}
          </div>

          {isEditingAuditor ? (
            <button
              onClick={handleSaveAuditor}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shrink-0 ml-1"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setTempAuditor(auditorName);
                setIsEditingAuditor(true);
              }}
              className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
              title="Ubah Nama Petugas SO"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
