import React, { useState, useEffect } from 'react';
import { Asset, ConditionType, RincianKondisi } from '../types';
import { X, Minus, Plus, Building2, User, FileText, CheckCircle2, History, AlertTriangle, ShieldAlert, Flame, UserCheck, MapPin, Calendar } from 'lucide-react';
import { getActiveAuditor } from '../services/apiService';
import { formatDateIndonesian } from '../utils/dateUtils';

interface QuickAuditModalProps {
  asset: Asset | null;
  onClose: () => void;
  onSave: (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO: string;
    Keterangan_SO: string;
  }) => void;
  isSaving: boolean;
}

export const QuickAuditModal: React.FC<QuickAuditModalProps> = ({
  asset,
  onClose,
  onSave,
  isSaving,
}) => {
  const [rincian, setRincian] = useState<RincianKondisi>({
    Baik: 0,
    Rusak_Ringan: 0,
    Rusak_Berat: 0,
    Hilang: 0,
    Musnah: 0,
  });
  const [petugas, setPetugas] = useState<string>(getActiveAuditor());
  const [keterangan, setKeterangan] = useState<string>('');

  useEffect(() => {
    if (asset) {
      if (asset.Rincian_Kondisi) {
        setRincian({ ...asset.Rincian_Kondisi });
      } else {
        const jml = asset.Jumlah || 1;
        setRincian({
          Baik: asset.Kondisi === 'Baik' ? jml : 0,
          Rusak_Ringan: asset.Kondisi === 'Rusak Ringan' ? jml : 0,
          Rusak_Berat: asset.Kondisi === 'Rusak Berat' ? jml : 0,
          Hilang: asset.Kondisi === 'Hilang' ? jml : 0,
          Musnah: asset.Kondisi === 'Musnah' ? jml : 0,
        });
      }
      setPetugas(getActiveAuditor());
      setKeterangan(asset.Keterangan_SO || '');
    }
  }, [asset]);

  if (!asset) return null;

  const handleCounterChange = (field: keyof RincianKondisi, delta: number) => {
    setRincian((prev) => {
      const val = Math.max(0, (prev[field] || 0) + delta);
      return {
        ...prev,
        [field]: val,
      };
    });
  };

  const totalCalculated =
    rincian.Baik + rincian.Rusak_Ringan + rincian.Rusak_Berat + rincian.Hilang + rincian.Musnah;

  const determineDominantCondition = (): ConditionType => {
    if (rincian.Baik >= rincian.Rusak_Ringan && rincian.Baik >= rincian.Rusak_Berat && rincian.Baik >= rincian.Hilang && rincian.Baik >= rincian.Musnah && rincian.Baik > 0) return 'Baik';
    if (rincian.Rusak_Ringan >= rincian.Rusak_Berat && rincian.Rusak_Ringan >= rincian.Hilang && rincian.Rusak_Ringan >= rincian.Musnah && rincian.Rusak_Ringan > 0) return 'Rusak Ringan';
    if (rincian.Rusak_Berat >= rincian.Hilang && rincian.Rusak_Berat >= rincian.Musnah && rincian.Rusak_Berat > 0) return 'Rusak Berat';
    if (rincian.Musnah >= rincian.Hilang && rincian.Musnah > 0) return 'Musnah';
    if (rincian.Hilang > 0) return 'Hilang';
    return 'Baik';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dominantKondisi = determineDominantCondition();
    onSave({
      ID_Asset: asset.ID_Asset,
      Kondisi: dominantKondisi,
      Jumlah: totalCalculated,
      Rincian_Kondisi: rincian,
      Petugas_SO: petugas,
      Keterangan_SO: keterangan,
    });
  };

  const prevAudit = asset.Audit_Sebelumnya;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl overflow-hidden border-t border-slate-200 dark:border-slate-800 z-10 max-h-[94vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                {asset.ID_Asset}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {asset.Kategori}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {asset.Nama_Asset}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Asset Metadata & Auditor Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">Unit: <strong>{asset.Unit_Kerja}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">PIC: <strong>{asset.Penanggung_Jawab}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Lokasi: <strong>{asset.Lokasi || '-'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Thn Beli: <strong>{asset.Tahun_Beli || '-'}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 font-medium">
              <span>Jumlah Asal: <strong>{asset.Jumlah_Asal !== undefined ? asset.Jumlah_Asal : asset.Jumlah} Unit</strong></span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Auditor: {petugas}</span>
            </div>
          </div>

          {/* PERBANDINGAN: Hasil Audit Sebelumnya */}
          <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                Hasil Audit Sesi Sebelumnya
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {formatDateIndonesian(prevAudit?.Tanggal_SO || asset.Tanggal_SO)}
              </span>
            </div>

            {prevAudit?.Petugas_SO && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Auditor Lalu: <strong>{prevAudit.Petugas_SO}</strong>
              </p>
            )}

            {prevAudit?.Rincian ? (
              <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-emerald-600 font-bold">{prevAudit.Rincian.Baik} Baik</span>
                <span>·</span>
                <span className="text-amber-600 font-bold">{prevAudit.Rincian.Rusak_Ringan} RR</span>
                <span>·</span>
                <span className="text-orange-600 font-bold">{prevAudit.Rincian.Rusak_Berat} RB</span>
                <span>·</span>
                <span className="text-rose-600 font-bold">{prevAudit.Rincian.Hilang} Hilang</span>
                <span>·</span>
                <span className="text-purple-600 font-bold">{prevAudit.Rincian.Musnah} Musnah</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">Kondisi Lalu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {prevAudit?.Kondisi || asset.Kondisi || 'Baik'}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Lalu:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {prevAudit?.Jumlah !== undefined ? prevAudit.Jumlah : asset.Jumlah} Unit
                  </span>
                </div>
              </div>
            )}

            {(prevAudit?.Keterangan_SO || asset.Keterangan_SO) && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                Catatan Lalu: "{prevAudit?.Keterangan_SO || asset.Keterangan_SO}"
              </p>
            )}
          </div>

          {/* INPUT AUDIT SEKARANG: Multi-Quantity Breakdown Rows */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Input Rincian Fisik Sesi Ini
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Total: {totalCalculated} Unit
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Kondisi Baik
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Baik', -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-7 text-center tabular-nums">
                    {rincian.Baik}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Baik', 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Rusak Ringan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Ringan', -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-7 text-center tabular-nums">
                    {rincian.Rusak_Ringan}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Ringan', 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-xs font-bold text-orange-900 dark:text-orange-200">
                    Rusak Berat
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Berat', -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-7 text-center tabular-nums">
                    {rincian.Rusak_Berat}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Rusak_Berat', 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Hilang
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Hilang', -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-7 text-center tabular-nums">
                    {rincian.Hilang}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Hilang', 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                    Musnah
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Musnah', -1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white w-7 text-center tabular-nums">
                    {rincian.Musnah}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCounterChange('Musnah', 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-300 dark:border-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Catatan Hasil SO Sekarang
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Catatan hasil verifikasi fisik lapangan..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all min-h-[48px]"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Simpan SO (Petugas: {petugas})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
