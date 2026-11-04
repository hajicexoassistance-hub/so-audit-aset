import React, { useState, useRef } from 'react';
import { Asset, SesiSO } from '../types';
import { PlusCircle, Calendar, RefreshCcw, Code2, Tag, FileSpreadsheet, Download, Upload, CheckCircle2, UserCheck, Layers, Building2 } from 'lucide-react';
import { downloadExcelTemplate, exportAuditReportToExcel, parseUploadedExcel } from '../services/excelService';
import { getActiveAuditor, setActiveAuditor } from '../services/apiService';
import { formatDateIndonesian } from '../utils/dateUtils';

interface ManageTabProps {
  sessions: SesiSO[];
  assets: Asset[];
  categories: string[];
  units: string[];
  onCreateSession: (payload: {
    Nama_Sesi: string;
    Tanggal_Mulai: string;
    Target_Unit_Kerja: string;
    Petugas_Utama: string;
    autoReset: boolean;
  }) => Promise<void>;
  onAddAsset: (payload: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>) => Promise<void>;
  onAddCategory: (name: string) => Promise<void>;
  onAddUnit: (name: string) => Promise<void>;
  onImportExcel: (importedAssets: Asset[], importedSessions?: SesiSO[], importedCategories?: string[], importedUnits?: string[]) => void;
  onOpenGasModal: () => void;
  onResetDemo: () => void;
  isSaving: boolean;
}

export const ManageTab: React.FC<ManageTabProps> = ({
  sessions,
  assets,
  categories,
  units,
  onCreateSession,
  onAddAsset,
  onAddCategory,
  onAddUnit,
  onImportExcel,
  onOpenGasModal,
  onResetDemo,
  isSaving,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'excel' | 'session' | 'asset' | 'master_ref' | 'history'>('excel');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Form Sesi State
  const [namaSesi, setNamaSesi] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState(new Date().toISOString().substring(0, 10));
  const [targetUnit, setTargetUnit] = useState('Semua');
  const [petugasUtama, setPetugasUtama] = useState(getActiveAuditor());
  const [autoReset, setAutoReset] = useState(true);

  // Form Aset State
  const [namaAsset, setNamaAsset] = useState('');
  const [kategori, setKategori] = useState(categories[0] || 'Peralatan');
  const [jenis, setJenis] = useState('Alat Kebun');
  const [pic, setPic] = useState('');
  const [unitKerja, setUnitKerja] = useState(units[0] || 'Nursery Ciminyak');
  const [tahunBeli, setTahunBeli] = useState<string | number>(new Date().getFullYear());
  const [lokasi, setLokasi] = useState('');
  const [jumlahAsal, setJumlahAsal] = useState<number>(1);
  const [jumlah, setJumlah] = useState<number>(1);

  // Master Ref Form State
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newUnitInput, setNewUnitInput] = useState('');

  const unitList = ['Semua', ...units];
  const kategoriList = categories;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Membaca file Excel Multi-Sheet...');
    try {
      const parsed = await parseUploadedExcel(file);
      if (parsed.assets && parsed.assets.length > 0) {
        onImportExcel(parsed.assets, parsed.sessions, parsed.categories, parsed.units);
        setUploadStatus(`Berhasil mengimpor ${parsed.assets.length} aset dari Excel!`);
      } else {
        setUploadStatus('File Excel tidak berisi data aset yang valid.');
      }
    } catch (err: any) {
      setUploadStatus(err.message || 'Gagal mengimpor file Excel.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSesi.trim() || !petugasUtama.trim()) return;
    setActiveAuditor(petugasUtama);
    await onCreateSession({
      Nama_Sesi: namaSesi,
      Tanggal_Mulai: tanggalMulai,
      Target_Unit_Kerja: targetUnit,
      Petugas_Utama: petugasUtama,
      autoReset,
    });
    setNamaSesi('');
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAsset.trim() || !pic.trim()) return;
    const newId = `AST-${Math.floor(100 + Math.random() * 900)}`;
    await onAddAsset({
      ID_Asset: newId,
      Nama_Asset: namaAsset,
      Kategori: kategori,
      Jenis: jenis,
      Penanggung_Jawab: pic,
      Unit_Kerja: unitKerja,
      Tahun_Beli: tahunBeli,
      Lokasi: lokasi,
      Jumlah_Asal: jumlahAsal,
      Jumlah: jumlah,
      Kondisi: 'Baik',
      Keterangan_SO: '',
    });
    setNamaAsset('');
    setPic('');
    setLokasi('');
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    await onAddCategory(newCategoryInput);
    setNewCategoryInput('');
  };

  const handleAddUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitInput.trim()) return;
    await onAddUnit(newUnitInput);
    setNewUnitInput('');
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-in fade-in">
      {/* Segment Selector Tabs */}
      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFormTab('excel')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeFormTab === 'excel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Import / Export
        </button>
        <button
          onClick={() => setActiveFormTab('master_ref')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeFormTab === 'master_ref'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Kategori & Unit
        </button>
        <button
          onClick={() => setActiveFormTab('session')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeFormTab === 'session'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Sesi SO
        </button>
        <button
          onClick={() => setActiveFormTab('asset')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeFormTab === 'asset'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          + Aset
        </button>
        <button
          onClick={() => setActiveFormTab('history')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeFormTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* 1. Panel Import & Export Excel Multi-Sheet */}
      {activeFormTab === 'excel' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Kelola Data Multi-Sheet Excel
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data Master_Assets & Tiap Tab Sheet Sesi SO terpisah.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={downloadExcelTemplate}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-left transition-all flex items-start gap-3 group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Download Template Multi-Sheet
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  File .xlsx lengkap dengan Sheet Master_Assets & Sheet Sesi SO
                </p>
              </div>
            </button>

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excelFileInput"
              />
              <label
                htmlFor="excelFileInput"
                className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800/60 text-left transition-all flex items-start gap-3 cursor-pointer group shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Upload & Impor File Excel
                  </p>
                  <p className="text-[10px] text-blue-700 dark:text-blue-300">
                    Membaca Sheet Master & Sheet Sesi SO otomatis
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => exportAuditReportToExcel(assets, sessions)}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Multi-Tab Report ke Excel (.xlsx)</span>
            </button>
          </div>

          {uploadStatus && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-xs font-medium flex items-center gap-2 border border-blue-200 dark:border-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Panel Kelola Master Kategori & Master Unit Kerja */}
      {activeFormTab === 'master_ref' && (
        <div className="space-y-4">
          {/* Master Kategori Form & List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Master Kategori (Sheet: Master_Kategori)
              </h2>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Tambah kategori baru (mis: Elektronik)..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {categories.map((kat, idx) => (
                <span
                  key={`${kat}-${idx}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                >
                  {kat}
                </span>
              ))}
            </div>
          </div>

          {/* Master Unit Kerja Form & List */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Master Unit Kerja (Sheet: Master_Unit)
              </h2>
            </div>

            <form onSubmit={handleAddUnitSubmit} className="flex gap-2">
              <input
                type="text"
                value={newUnitInput}
                onChange={(e) => setNewUnitInput(e.target.value)}
                placeholder="Tambah unit baru (mis: Gudang Utama)..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {units.map((u, idx) => (
                <span
                  key={`${u}-${idx}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Form Sesi SO Baru (Menyalin Master_Assets ke Tab Sheet Baru) */}
      {activeFormTab === 'session' && (
        <form onSubmit={handleCreateSessionSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Buat Sesi Stock Opname (Tab Sheet Baru)
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Sesi SO *
            </label>
            <input
              type="text"
              required
              value={namaSesi}
              onChange={(e) => setNamaSesi(e.target.value)}
              placeholder="Contoh: SO_Nursery_Ciminyak_Q2_2026"
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              Nama Petugas SO (Auditor Penanggung Jawab) *
            </label>
            <input
              type="text"
              required
              value={petugasUtama}
              onChange={(e) => setPetugasUtama(e.target.value)}
              placeholder="Nama auditor/petugas pemeriksaan"
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Unit Kerja
              </label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {unitList.map((u, idx) => (
                  <option key={`${u}-${idx}`} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="autoReset"
              checked={autoReset}
              onChange={(e) => setAutoReset(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="autoReset" className="text-xs text-blue-900 dark:text-blue-200 cursor-pointer font-medium leading-snug">
              <strong>Otomatis Buat Tab Sheet Baru Sesi Ini</strong>
              <span className="block text-[11px] text-blue-700 dark:text-blue-300">
                Otomatis menyalin data dari <em>Master_Assets</em> ke Sheet Sesi Baru dan mereset status audit siap diaudit oleh {petugasUtama}.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Buat Sesi & Tab Sheet Baru</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 3. Form Tambah Master Aset */}
      {activeFormTab === 'asset' && (
        <form onSubmit={handleAddAssetSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tambah Master Aset Induk (Master_Assets)
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Aset *
            </label>
            <input
              type="text"
              required
              value={namaAsset}
              onChange={(e) => setNamaAsset(e.target.value)}
              placeholder="Contoh: Cangkul Baja, Sprayer, Pupuk NPK"
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {kategoriList.map((k, idx) => (
                  <option key={`${k}-${idx}`} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis / Sub Tipe
              </label>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                placeholder="Alat Kebun / Hardware"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PIC Master Barang *
              </label>
              <input
                type="text"
                required
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Nama penanggung jawab"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Kerja
              </label>
              <select
                value={unitKerja}
                onChange={(e) => setUnitKerja(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {unitList.filter((u) => u !== 'Semua').map((u, idx) => (
                  <option key={`${u}-${idx}`} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tahun Beli
              </label>
              <input
                type="text"
                value={tahunBeli}
                onChange={(e) => setTahunBeli(e.target.value)}
                placeholder="2024"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Barang / Ruangan
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Gudang A, R.302"
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Asal (Stok Awal)
              </label>
              <input
                type="number"
                min={1}
                value={jumlahAsal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setJumlahAsal(val);
                  setJumlah(val);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Saat Ini
              </label>
              <input
                type="number"
                min={1}
                value={jumlah}
                onChange={(e) => setJumlah(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Aset ke Master_Assets</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 4. Riwayat Sesi Multi-Tab List */}
      {activeFormTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
          <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Riwayat Tab Sheet Sesi SO
          </h2>
          <div className="space-y-2">
            {sessions.map((s, idx) => (
              <div
                key={`${s.ID_Sesi}-${idx}`}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      Tab: {s.Sheet_Name || s.ID_Sesi}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.Status_Sesi === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {s.Status_Sesi}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {s.Nama_Sesi}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mulai: {formatDateIndonesian(s.Tanggal_Mulai)} · Auditor: <strong>{s.Petugas_Utama || 'Auditor'}</strong> · Target: {s.Target_Unit_Kerja}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Settings & Utilities Panel */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Pengaturan Integrasi & Utility
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenGasModal}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-left transition-all group"
          >
            <Code2 className="w-5 h-5 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">GAS Script API</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Multi-Tab Code.gs</p>
          </button>

          <button
            onClick={onResetDemo}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 text-left transition-all group"
          >
            <RefreshCcw className="w-5 h-5 text-amber-600 mb-1 group-hover:rotate-180 transition-transform duration-500" />
            <p className="text-xs font-bold text-slate-900 dark:text-white">Reset Demo Data</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Kembali data awal</p>
          </button>
        </div>
      </div>
    </div>
  );
};
