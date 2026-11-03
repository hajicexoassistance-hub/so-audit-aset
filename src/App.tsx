import React, { useState, useEffect } from 'react';
import { Asset, SesiSO, ConditionType, RincianKondisi } from './types';
import {
  fetchInitialData,
  updateStockOpname,
  addAsset,
  addCategory,
  addUnit,
  createSession,
  getStoredGasUrl,
  getActiveAuditor,
  resetDemoData,
} from './services/apiService';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardTab } from './components/DashboardTab';
import { AuditTab } from './components/AuditTab';
import { ManageTab } from './components/ManageTab';
import { CodeGsModal } from './components/CodeGsModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sessions, setSessions] = useState<SesiSO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [gasUrl, setGasUrl] = useState<string>(getStoredGasUrl());
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      text,
      type,
    });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInitialData();
      setAssets(data.assets || []);
      setSessions(data.sessions || []);
      setCategories(data.categories || []);
      setUnits(data.units || []);

      const activeSesi = data.sessions?.find((s) => s.Status_Sesi === 'Aktif') || data.sessions?.[0];
      if (activeSesi) {
        setActiveSessionId(activeSesi.ID_Sesi);
      }
    } catch (err) {
      showToast('Gagal memuat data. Menggunakan data lokal.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAudit = async (payload: {
    ID_Asset: string;
    Kondisi: ConditionType;
    Jumlah: number;
    Rincian_Kondisi: RincianKondisi;
    Petugas_SO?: string;
    Keterangan_SO: string;
  }) => {
    setIsSaving(true);
    try {
      const auditor = payload.Petugas_SO || getActiveAuditor();
      const res = await updateStockOpname({
        ...payload,
        Petugas_SO: auditor,
        Sesi_SO_Terakhir: activeSessionId,
      });
      setAssets(res.assets);
      setSessions(res.sessions);
      showToast(`Hasil SO ${payload.ID_Asset} (${payload.Jumlah} Unit) disimpan!`, 'success');
    } catch (err) {
      showToast('Gagal menyimpan hasil SO', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSession = async (payload: {
    Nama_Sesi: string;
    Tanggal_Mulai: string;
    Target_Unit_Kerja: string;
    Petugas_Utama: string;
    autoReset: boolean;
  }) => {
    setIsSaving(true);
    try {
      const res = await createSession(payload);
      setAssets(res.assets);
      setSessions(res.sessions);
      const newActive = res.sessions.find((s) => s.Status_Sesi === 'Aktif') || res.sessions[0];
      if (newActive) setActiveSessionId(newActive.ID_Sesi);
      showToast(`Sesi SO "${payload.Nama_Sesi}" & Sheet Baru berhasil diaktifkan!`, 'success');
      setActiveTab('dashboard');
    } catch (err) {
      showToast('Gagal membuat sesi baru', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAsset = async (payload: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>) => {
    setIsSaving(true);
    try {
      const res = await addAsset(payload);
      setAssets(res.assets);
      setSessions(res.sessions);
      if (res.categories) setCategories(res.categories);
      if (res.units) setUnits(res.units);
      showToast(`Aset baru "${payload.Nama_Asset}" ditambahkan ke Master!`, 'success');
      setActiveTab('audit');
    } catch (err) {
      showToast('Gagal menambah aset', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async (name: string) => {
    setIsSaving(true);
    try {
      const res = await addCategory(name);
      if (res.categories) setCategories(res.categories);
      showToast(`Kategori "${name}" ditambahkan ke Master_Kategori!`, 'success');
    } catch (err) {
      showToast('Gagal menambah kategori', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUnit = async (name: string) => {
    setIsSaving(true);
    try {
      const res = await addUnit(name);
      if (res.units) setUnits(res.units);
      showToast(`Unit Kerja "${name}" ditambahkan ke Master_Unit!`, 'success');
    } catch (err) {
      showToast('Gagal menambah unit kerja', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportExcel = (
    importedAssets: Asset[],
    importedSessions?: SesiSO[],
    importedCategories?: string[],
    importedUnits?: string[]
  ) => {
    setAssets(importedAssets);
    if (importedSessions && importedSessions.length > 0) {
      setSessions(importedSessions);
      const activeSesi = importedSessions.find((s) => s.Status_Sesi === 'Aktif') || importedSessions[0];
      if (activeSesi) setActiveSessionId(activeSesi.ID_Sesi);
    }
    if (importedCategories && importedCategories.length > 0) {
      setCategories(importedCategories);
    }
    if (importedUnits && importedUnits.length > 0) {
      setUnits(importedUnits);
    }
    localStorage.setItem('so_assets_data_v4', JSON.stringify(importedAssets));
    showToast(`Berhasil mengimpor ${importedAssets.length} aset dari Excel!`, 'success');
    setActiveTab('audit');
  };

  const handleResetDemo = () => {
    const res = resetDemoData();
    setAssets(res.assets);
    setSessions(res.sessions);
    setCategories(res.categories || []);
    setUnits(res.units || []);
    if (res.sessions[0]) setActiveSessionId(res.sessions[0].ID_Sesi);
    showToast('Data demo berhasil di-reset ke kondisi awal.', 'info');
  };

  const handleUrlUpdated = (newUrl: string) => {
    setGasUrl(newUrl);
    loadData();
    if (newUrl) {
      showToast('URL Google Apps Script diperbarui! Menghubungkan...', 'info');
    } else {
      showToast('Berubah ke Mode Hybrid Mock Data (Offline)', 'info');
    }
  };

  const pendingAuditCount = assets.filter((a) => a.Status_Audit === 'Belum SO').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center transition-colors">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="w-full max-w-xl md:max-w-2xl min-h-screen bg-white dark:bg-slate-900 shadow-xl flex flex-col relative">
        <Header
          gasUrl={gasUrl}
          onOpenGasModal={() => setIsGasModalOpen(true)}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        <main className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Memuat data Stock Opname Multi-Tab...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  assets={assets}
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={setActiveSessionId}
                  onGoToAudit={() => setActiveTab('audit')}
                  onGoToManage={() => setActiveTab('manage')}
                  onOpenGasModal={() => setIsGasModalOpen(true)}
                  gasUrl={gasUrl}
                />
              )}

              {activeTab === 'audit' && (
                <AuditTab
                  assets={assets}
                  activeSessionId={activeSessionId}
                  onSaveAudit={handleSaveAudit}
                  isSaving={isSaving}
                  onGoToManage={() => setActiveTab('manage')}
                />
              )}

              {activeTab === 'manage' && (
                <ManageTab
                  sessions={sessions}
                  assets={assets}
                  categories={categories}
                  units={units}
                  onCreateSession={handleCreateSession}
                  onAddAsset={handleAddAsset}
                  onAddCategory={handleAddCategory}
                  onAddUnit={handleAddUnit}
                  onImportExcel={handleImportExcel}
                  onOpenGasModal={() => setIsGasModalOpen(true)}
                  onResetDemo={handleResetDemo}
                  isSaving={isSaving}
                />
              )}
            </>
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingAuditCount={pendingAuditCount}
        />

        <CodeGsModal
          isOpen={isGasModalOpen}
          onClose={() => setIsGasModalOpen(false)}
          onUrlUpdated={handleUrlUpdated}
        />
      </div>
    </div>
  );
}
