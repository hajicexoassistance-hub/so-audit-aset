import React, { useState } from 'react';
import { Asset, SesiSO, ConditionType } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert, Layers, Building2, Calendar, ArrowRight, Flame, FileSpreadsheet, Link } from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';

interface DashboardTabProps {
  assets: Asset[];
  sessions: SesiSO[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onGoToAudit: () => void;
  onGoToManage: () => void;
  onOpenGasModal: () => void;
  gasUrl?: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  assets,
  sessions,
  activeSessionId,
  onSelectSession,
  onGoToAudit,
  onGoToManage,
  onOpenGasModal,
  gasUrl,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('Semua');

  const activeSession = sessions.find((s) => s.ID_Sesi === activeSessionId) || sessions[0];
  const isConnected = Boolean(gasUrl && gasUrl.trim().length > 0);

  const unitList = ['Semua', ...Array.from(new Set(assets.map((a) => a.Unit_Kerja).filter(Boolean)))];

  const filteredAssets = assets.filter((a) => {
    if (selectedUnit !== 'Semua' && a.Unit_Kerja !== selectedUnit) return false;
    return true;
  });

  const totalAssets = filteredAssets.length;
  const auditedAssets = filteredAssets.filter((a) => a.Status_Audit === 'Sudah SO').length;
  const pendingAssets = totalAssets - auditedAssets;
  const progressPercent = totalAssets > 0 ? Math.round((auditedAssets / totalAssets) * 100) : 0;

  const conditionCounts: Record<ConditionType, number> = {
    Baik: filteredAssets.filter((a) => a.Kondisi === 'Baik').length,
    'Rusak Ringan': filteredAssets.filter((a) => a.Kondisi === 'Rusak Ringan').length,
    'Rusak Berat': filteredAssets.filter((a) => a.Kondisi === 'Rusak Berat').length,
    Hilang: filteredAssets.filter((a) => a.Kondisi === 'Hilang').length,
    Musnah: filteredAssets.filter((a) => a.Kondisi === 'Musnah').length,
  };

  return (
    <div className="space-y-4 pb-20 pt-2 animate-in fade-in">
      {/* Onboarding Callout: Only show if NOT connected and NO assets */}
      {assets.length === 0 && !isConnected && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-lg border border-slate-700 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Database Aset Masih Kosong</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Silakan hubungkan aplikasi dengan Google Spreadsheet Anda atau unggah file Excel template untuk memulai Stock Opname.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onGoToManage}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
            <button
              onClick={onOpenGasModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl border border-slate-600 shadow transition-all"
            >
              <Link className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Sheet</span>
            </button>
          </div>
        </div>
      )}
      {/* 1. Session Selector Dropdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Sesi Stock Opname Aktif
          </label>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {activeSession?.Status_Sesi === 'Aktif' ? 'Sesi Aktif' : 'Selesai'}
          </span>
        </div>
        <select
          value={activeSessionId}
          onChange={(e) => onSelectSession(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
        >
          {sessions.map((s, idx) => (
            <option key={`${s.ID_Sesi}-${idx}`} value={s.ID_Sesi}>
              {s.Nama_Sesi} ({s.Target_Unit_Kerja})
            </option>
          ))}
        </select>
        {activeSession && (
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Dimulai: {formatDateIndonesian(activeSession.Tanggal_Mulai)}</span>
            <span>·</span>
            <span>Target: {activeSession.Target_Unit_Kerja}</span>
          </div>
        )}
      </div>

      {/* 2. Visual Progress Bar Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-md shadow-blue-500/20 relative overflow-hidden">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
              Progres Verifikasi Audit
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight mt-0.5 tabular-nums">
              {progressPercent}%
            </h2>
          </div>
          <button
            onClick={onGoToAudit}
            className="flex items-center gap-1 bg-white text-blue-700 text-xs font-bold px-3 py-2 rounded-xl shadow-sm hover:bg-blue-50 active:scale-95 transition-all shrink-0"
          >
            <span>Mulai Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-full bg-blue-900/40 rounded-full h-3.5 p-0.5 backdrop-blur-sm mb-2">
          <div
            className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-blue-100 font-medium tabular-nums">
          <span>{auditedAssets} Selesai Diperiksa</span>
          <span>{totalAssets} Total Aset</span>
        </div>
      </div>

      {/* 3. Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <div className="w-7 h-7 mx-auto rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-1.5">
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Total Aset</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{totalAssets}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <div className="w-7 h-7 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sudah SO</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{auditedAssets}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <div className="w-7 h-7 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1.5">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Belum SO</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums">{pendingAssets}</p>
        </div>
      </div>

      {/* 4. Unit Kerja Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Filter Unit Kerja
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {selectedUnit}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {unitList.map((unit, idx) => (
            <button
              key={`${unit}-${idx}`}
              onClick={() => setSelectedUnit(unit)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedUnit === unit
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Condition Breakdown Cards (Termasuk Musnah) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Breakdown Kondisi Fisik Aset
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Baik */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">Baik</p>
              <p className="text-base font-bold text-emerald-900 dark:text-emerald-200 tabular-nums">
                {conditionCounts['Baik']} Aset
              </p>
            </div>
          </div>

          {/* Rusak Ringan */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-amber-800 dark:text-amber-300">Rusak Ringan</p>
              <p className="text-base font-bold text-amber-900 dark:text-amber-200 tabular-nums">
                {conditionCounts['Rusak Ringan']} Aset
              </p>
            </div>
          </div>

          {/* Rusak Berat */}
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-orange-800 dark:text-orange-300">Rusak Berat</p>
              <p className="text-base font-bold text-orange-900 dark:text-orange-200 tabular-nums">
                {conditionCounts['Rusak Berat']} Aset
              </p>
            </div>
          </div>

          {/* Hilang */}
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-rose-800 dark:text-rose-300">Hilang</p>
              <p className="text-base font-bold text-rose-900 dark:text-rose-200 tabular-nums">
                {conditionCounts['Hilang']} Aset
              </p>
            </div>
          </div>

          {/* Musnah */}
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-3 col-span-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-purple-800 dark:text-purple-300">Musnah (Hancur Total / Terbakar / Habis Total)</p>
              <p className="text-base font-bold text-purple-900 dark:text-purple-200 tabular-nums">
                {conditionCounts['Musnah']} Aset
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
