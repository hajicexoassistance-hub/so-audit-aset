import React, { useState } from 'react';
import { Asset, ConditionType, StatusAuditType, RincianKondisi } from '../types';
import { QuickAuditModal } from './QuickAuditModal';
import { Filter, CheckCircle2, Clock, AlertTriangle, ShieldAlert, ChevronRight, Building2, Flame, History, MapPin, UserCheck, Check, Edit2 } from 'lucide-react';
import { formatDateIndonesian } from '../utils/dateUtils';
import { getActiveAuditor, setActiveAuditor } from '../services/apiService';

interface AuditTabProps {
  assets: Asset[];
  activeSessionId: string;
  searchQuery: string;
  onSaveAudit: (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Keterangan_SO: string;
  }) => Promise<void>;
  isSaving: boolean;
  onGoToManage?: () => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  assets,
  activeSessionId,
  searchQuery,
  onSaveAudit,
  isSaving,
  onGoToManage,
}) => {
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Belum SO' | 'Sudah SO'>('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [unitFilter, setUnitFilter] = useState('Semua');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const [auditorName, setAuditorName] = useState(getActiveAuditor());
  const [isEditingAuditor, setIsEditingAuditor] = useState(false);
  const [tempAuditor, setTempAuditor] = useState(auditorName);

  const handleSaveAuditor = () => {
    if (!tempAuditor.trim()) return;
    setActiveAuditor(tempAuditor);
    setAuditorName(tempAuditor.trim());
    setIsEditingAuditor(false);
  };

  const categories = [
    'Semua',
    ...Array.from(
      new Set(assets.map((a) => String(a.Kategori || '').trim()).filter(Boolean))
    ),
  ];

  const units = [
    'Semua',
    ...Array.from(
      new Set(assets.map((a) => String(a.Unit_Kerja || '').trim()).filter(Boolean))
    ),
  ];

  // 1. Filter by Category, Unit, and Search Query first
  const categoryUnitSearchFiltered = assets.filter((a) => {
    if (categoryFilter !== 'Semua') {
      const catA = String(a.Kategori || '').trim().toLowerCase();
      const catF = String(categoryFilter).trim().toLowerCase();
      if (catA !== catF) return false;
    }

    if (unitFilter !== 'Semua') {
      const unitA = String(a.Unit_Kerja || '').trim().toLowerCase();
      const unitF = String(unitFilter).trim().toLowerCase();
      if (unitA !== unitF) return false;
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = String(a.Nama_Asset || '').toLowerCase().includes(q);
      const matchId = String(a.ID_Asset || '').toLowerCase().includes(q);
      const matchKat = String(a.Kategori || '').toLowerCase().includes(q);
      const matchJenis = String(a.Jenis || '').toLowerCase().includes(q);
      const matchPic = String(a.Penanggung_Jawab || '').toLowerCase().includes(q);
      const matchUnit = String(a.Unit_Kerja || '').toLowerCase().includes(q);
      const matchLokasi = a.Lokasi ? String(a.Lokasi).toLowerCase().includes(q) : false;
      const matchTahun = a.Tahun_Beli ? String(a.Tahun_Beli).toLowerCase().includes(q) : false;
      const matchKet = a.Keterangan_SO ? String(a.Keterangan_SO).toLowerCase().includes(q) : false;

      if (
        !matchName &&
        !matchId &&
        !matchKat &&
        !matchJenis &&
        !matchPic &&
        !matchUnit &&
        !matchLokasi &&
        !matchTahun &&
        !matchKet
      ) {
        return false;
      }
    }

    return true;
  });

  // Dynamic counts for status filter chips based on active category/unit/search filter
  const countSemua = categoryUnitSearchFiltered.length;
  const countBelum = categoryUnitSearchFiltered.filter((a) => a.Status_Audit === 'Belum SO').length;
  const countSudah = categoryUnitSearchFiltered.filter((a) => a.Status_Audit === 'Sudah SO').length;

  // 2. Apply status filter for final rendered assets list
  const filteredAssets = categoryUnitSearchFiltered.filter((a) => {
    if (statusFilter !== 'Semua' && a.Status_Audit !== statusFilter) return false;
    return true;
  });

  const getConditionBadge = (kondisi: ConditionType, status: StatusAuditType) => {
    if (status === 'Belum SO') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          <Clock className="w-3 h-3 text-slate-400" />
          Belum SO
        </span>
      );
    }

    const badgeConfig: Record<ConditionType, { bg: string; icon: React.ComponentType<{ className?: string }> }> = {
      Baik: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2,
      },
      'Rusak Ringan': {
        bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: AlertTriangle,
      },
      'Rusak Berat': {
        bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        icon: AlertTriangle,
      },
      Hilang: {
        bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: ShieldAlert,
      },
      Musnah: {
        bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: Flame,
      },
    };

    const cfg = badgeConfig[kondisi] || badgeConfig['Baik'];
    const IconComp = cfg.icon;

    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg}`}>
        <IconComp className="w-3 h-3" />
        {kondisi}
      </span>
    );
  };

  const handleSaveModal = async (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Keterangan_SO: string;
  }) => {
    await onSaveAudit(payload);
    setSelectedAsset(null);
  };

  return (
    <div className="space-y-3 pb-24 pt-2 animate-in fade-in">
      {/* 1. Active Auditor Profile Bar (Swapped from Header to Content) */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">Petugas SO:</span>
          {isEditingAuditor ? (
            <input
              type="text"
              value={tempAuditor}
              onChange={(e) => setTempAuditor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAuditor()}
              autoFocus
              className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-0.5 rounded text-xs font-bold border border-blue-500 focus:outline-none min-w-0 flex-1"
            />
          ) : (
            <strong className="text-slate-900 dark:text-white font-bold truncate text-xs">
              {auditorName}
            </strong>
          )}
        </div>

        {isEditingAuditor ? (
          <button
            onClick={handleSaveAuditor}
            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 ml-1"
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

      {/* 2. Status Horizontal Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(['Semua', 'Belum SO', 'Sudah SO'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              statusFilter === st
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {st === 'Semua' && `Semua (${countSemua})`}
            {st === 'Belum SO' && `Belum SO (${countBelum})`}
            {st === 'Sudah SO' && `Sudah SO (${countSudah})`}
          </button>
        ))}
      </div>

      {/* 3. Category & Unit Dropdowns */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm truncate"
        >
          <option value="Semua">Kategori: Semua</option>
          {categories.filter((c) => c !== 'Semua').map((c, idx) => (
            <option key={`${c}-${idx}`} value={c}>
              Kategori: {c}
            </option>
          ))}
        </select>

        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm truncate"
        >
          <option value="Semua">Unit: Semua</option>
          {units.filter((u) => u !== 'Semua').map((u, idx) => (
            <option key={`${u}-${idx}`} value={u}>
              Unit: {u}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Asset Cards List */}
      <div className="space-y-2.5 pt-1">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {assets.length === 0 ? 'Belum Ada Master Aset' : 'Aset Tidak Ditemukan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {assets.length === 0
                ? 'Unggah file Excel atau tambahkan aset baru di tab Kelola untuk memulai audit.'
                : `Tidak ada aset yang cocok dengan filter kategori (${categoryFilter}) atau kata kunci.`}
            </p>
            {assets.length === 0 && onGoToManage && (
              <button
                onClick={onGoToManage}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Buka Tab Kelola / Import Excel
              </button>
            )}
          </div>
        ) : (
          filteredAssets.map((asset, idx) => {
            const isAudited = asset.Status_Audit === 'Sudah SO';
            const prev = asset.Audit_Sebelumnya;
            const rincian = asset.Rincian_Kondisi;
            return (
              <div
                key={`${asset.ID_Asset}-${idx}`}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer shadow-sm active:scale-[0.99] group relative"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                        {asset.ID_Asset}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        {asset.Kategori}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {asset.Nama_Asset}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {getConditionBadge(asset.Kondisi, asset.Status_Audit)}
                  </div>
                </div>

                {/* Sub Metadata Row 1: Unit, PIC, Lokasi */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2.5 mt-2">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span className="flex items-center gap-1 shrink-0">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <strong className="text-slate-700 dark:text-slate-300 font-semibold">{asset.Unit_Kerja}</strong>
                    </span>
                    {asset.Lokasi && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1 shrink-0 truncate">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          <span className="truncate">{asset.Lokasi}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs shrink-0 pl-2">
                    <span className="text-[11px]">Audit ({asset.Jumlah}/{asset.Jumlah_Asal !== undefined ? asset.Jumlah_Asal : asset.Jumlah})</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Sub Metadata Row 2: PIC & Tahun Beli */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="truncate">PIC: <strong>{asset.Penanggung_Jawab}</strong></span>
                  {asset.Tahun_Beli && <span className="shrink-0 text-slate-400">Thn Beli: {asset.Tahun_Beli}</span>}
                </div>

                {/* Single Asset Multi-Condition Breakdown Preview */}
                {rincian && isAudited && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {rincian.Baik > 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{rincian.Baik} Baik</span>}
                    {rincian.Rusak_Ringan > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">{rincian.Rusak_Ringan} Rusak Ringan</span>}
                    {rincian.Rusak_Berat > 0 && <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">{rincian.Rusak_Berat} Rusak Berat</span>}
                    {rincian.Hilang > 0 && <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">{rincian.Hilang} Hilang</span>}
                    {rincian.Musnah > 0 && <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">{rincian.Musnah} Musnah</span>}
                  </div>
                )}

                {prev && (
                  <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3" />
                      Lalu: {prev.Jumlah} unit ({prev.Kondisi}) · {formatDateIndonesian(prev.Tanggal_SO)}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <QuickAuditModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onSave={handleSaveModal}
        isSaving={isSaving}
      />
    </div>
  );
};
