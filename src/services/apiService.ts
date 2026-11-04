import { Asset, SesiSO, InitialDataResponse, ConditionType, RincianKondisi } from '../types';

export const DEFAULT_GAS_WEB_APP_URL: string = "https://script.google.com/macros/s/AKfycbwQeR0vlOVNmI9UwVOijAd20mvpjfuMw9TCRElhK7T6L21VGUbCjHwMPumIY1hO1DO5/exec";

const STORAGE_KEYS = {
  GAS_URL: 'so_gas_web_app_url',
  ASSETS: 'so_assets_data_real_v2',
  SESSIONS: 'so_sessions_data_real_v2',
  CATEGORIES: 'so_categories_real_v2',
  UNITS: 'so_units_real_v2',
  ACTIVE_AUDITOR: 'so_active_auditor_v2',
};

export function getActiveAuditor(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_AUDITOR) || 'Arno Kristanto';
}

export function setActiveAuditor(name: string) {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_AUDITOR, name.trim());
}

// Default initial master lists
const DEFAULT_CATEGORIES = ['Peralatan', 'Perlengkapan', 'Habis Pakai', 'Elektronik', 'Kendaraan'];
const DEFAULT_UNITS = ['Nursery Ciminyak', 'Office Ciminyak', 'Gudang Utama'];

const INITIAL_REAL_ASSETS: Asset[] = [];

const INITIAL_REAL_SESSIONS: SesiSO[] = [
  {
    ID_Sesi: 'SESI-001',
    Nama_Sesi: 'Stock Opname Awal',
    Sheet_Name: 'SO_SESI_001',
    Tanggal_Mulai: new Date().toISOString().substring(0, 10),
    Target_Unit_Kerja: 'Semua',
    Petugas_Utama: 'Arno Kristanto',
    Status_Sesi: 'Aktif',
  }
];

export function getStoredGasUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.GAS_URL);
  if (!stored || stored.trim() === '') {
    localStorage.setItem(STORAGE_KEYS.GAS_URL, DEFAULT_GAS_WEB_APP_URL);
    return DEFAULT_GAS_WEB_APP_URL;
  }
  return stored;
}

export function setStoredGasUrl(url: string) {
  localStorage.setItem(STORAGE_KEYS.GAS_URL, url.trim());
}

function getLocalAssets(): Asset[] {
  const data = localStorage.getItem(STORAGE_KEYS.ASSETS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(INITIAL_REAL_ASSETS));
    return INITIAL_REAL_ASSETS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REAL_ASSETS;
  }
}

function saveLocalAssets(assets: Asset[]) {
  localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
}

function getLocalSessions(): SesiSO[] {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_REAL_SESSIONS));
    return INITIAL_REAL_SESSIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_REAL_SESSIONS;
  }
}

function saveLocalSessions(sessions: SesiSO[]) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getLocalCategories(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(list: string[]) {
  const unique = Array.from(new Set(list.filter(Boolean)));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(unique));
}

export function getLocalUnits(): string[] {
  const data = localStorage.getItem(STORAGE_KEYS.UNITS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  }
  try {
    const list = JSON.parse(data);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
}

export function saveLocalUnits(list: string[]) {
  const unique = Array.from(new Set(list.filter(Boolean)));
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(unique));
}


// Local storage helpers & internal sync functions
function updateLocalStockOpnameInternal(payload: {
  ID_Asset: string;
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO_Terakhir: string;
}): InitialDataResponse {
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const assets = getLocalAssets();
  const updated = assets.map((a) => {
    if (a.ID_Asset === payload.ID_Asset) {
      const prevAuditHistory = a.Kondisi
        ? {
            Kondisi: a.Kondisi,
            Jumlah: a.Jumlah,
            Rincian: a.Rincian_Kondisi || { Baik: a.Jumlah, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 },
            Tanggal_SO: a.Tanggal_SO || 'Sebelumnya',
            Petugas_SO: a.Petugas_SO || 'Petugas Lalu',
            Keterangan_SO: a.Keterangan_SO || '-',
            Sesi_SO: a.Sesi_SO_Terakhir || '-',
          }
        : a.Audit_Sebelumnya;

      return {
        ...a,
        Audit_Sebelumnya: prevAuditHistory,
        Kondisi: payload.Kondisi,
        Jumlah: payload.Jumlah,
        Rincian_Kondisi: payload.Rincian_Kondisi,
        Petugas_SO: payload.Petugas_SO,
        Keterangan_SO: payload.Keterangan_SO,
        Tanggal_SO: nowStr,
        Sesi_SO_Terakhir: payload.Sesi_SO_Terakhir,
        Status_Audit: 'Sudah SO' as const,
      };
    }
    return a;
  });
  saveLocalAssets(updated);
  return {
    assets: updated,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
  };
}

function addLocalAssetInternal(
  newAsset: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>
): InitialDataResponse {
  const jml = Number(newAsset.Jumlah) || 1;
  const initialRincian: RincianKondisi = { Baik: jml, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 };
  const currentAuditor = getActiveAuditor();
  const jmlAsal = newAsset.Jumlah_Asal !== undefined ? Number(newAsset.Jumlah_Asal) : jml;

  const currentKats = getLocalCategories();
  if (newAsset.Kategori && !currentKats.includes(newAsset.Kategori)) {
    saveLocalCategories([...currentKats, newAsset.Kategori]);
  }
  const currentUnits = getLocalUnits();
  if (newAsset.Unit_Kerja && !currentUnits.includes(newAsset.Unit_Kerja)) {
    saveLocalUnits([...currentUnits, newAsset.Unit_Kerja]);
  }

  const assets = getLocalAssets();
  const createdAsset: Asset = {
    ...newAsset,
    Jumlah_Asal: jmlAsal,
    Rincian_Kondisi: initialRincian,
    Petugas_SO: currentAuditor,
    Tanggal_SO: '',
    Sesi_SO_Terakhir: '',
    Status_Audit: 'Belum SO',
  };
  const updated = [createdAsset, ...assets];
  saveLocalAssets(updated);
  return {
    assets: updated,
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
  };
}

function createLocalSessionInternal(payload: {
  Nama_Sesi: string;
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Petugas_Utama: string;
  autoReset?: boolean;
}): InitialDataResponse {
  const newId = `SESI-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
  const sheetName = `SO_${newId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const sessions = getLocalSessions().map((s) => ({ ...s, Status_Sesi: 'Selesai' as const }));
  const newSession: SesiSO = {
    ID_Sesi: newId,
    Nama_Sesi: payload.Nama_Sesi,
    Sheet_Name: sheetName,
    Tanggal_Mulai: payload.Tanggal_Mulai,
    Target_Unit_Kerja: payload.Target_Unit_Kerja,
    Petugas_Utama: payload.Petugas_Utama,
    Status_Sesi: 'Aktif',
  };
  const updatedSessions = [newSession, ...sessions];
  saveLocalSessions(updatedSessions);

  let assets = getLocalAssets();
  if (payload.autoReset !== false) {
    assets = assets.map((a) => {
      if (payload.Target_Unit_Kerja === 'Semua' || a.Unit_Kerja === payload.Target_Unit_Kerja) {
        return {
          ...a,
          Petugas_SO: payload.Petugas_Utama,
          Status_Audit: 'Belum SO' as const,
        };
      }
      return a;
    });
    saveLocalAssets(assets);
  }

  return {
    assets,
    sessions: updatedSessions,
    categories: getLocalCategories(),
    units: getLocalUnits(),
  };
}

export function normalizeRawAsset(raw: any, idx: number, seenIds: Map<string, number>): Asset {
  let rawId = String(raw.ID_Asset || raw.Kode_Asset || raw['ID Asset'] || '').trim();
  if (!rawId) {
    rawId = `AST-${100 + idx}`;
  }
  const count = seenIds.get(rawId) || 0;
  seenIds.set(rawId, count + 1);
  const idAsset = count === 0 ? rawId : `${rawId}-${count + 1}`;

  const namaAsset = String(raw.Nama_Asset || raw['Nama Asset'] || raw.Nama_Barang || raw.Nama || 'Barang Tanpa Nama').trim();
  const kategori = String(raw.Kategori || 'Peralatan').trim();
  const jenis = String(raw.Jenis || raw.Tipe || '').trim();
  const pic = String(raw.Penanggung_Jawab || raw['PIC Master'] || raw.PIC || '-').trim();
  const unit = String(raw.Unit_Kerja || raw['Unit Kerja'] || raw.Unit || 'Nursery Ciminyak').trim();
  const tahunBeli = raw.Tahun_Beli || raw['Tahun Beli'] || '';
  const lokasi = raw.Lokasi || raw['Lokasi Barang'] || '';

  const jumlahAsal = Number(raw.Jumlah_Asal) || Number(raw['Jumlah Asal']) || Number(raw.Jumlah) || 1;

  const baik = Number(raw.Jml_Baik) || (raw.Kondisi_Terakhir === 'Baik' || raw.Kondisi === 'Baik' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const rr = Number(raw.Jml_Rusak_Ringan) || (raw.Kondisi_Terakhir === 'Rusak Ringan' || raw.Kondisi === 'Rusak Ringan' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const rb = Number(raw.Jml_Rusak_Berat) || (raw.Kondisi_Terakhir === 'Rusak Berat' || raw.Kondisi === 'Rusak Berat' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const hilang = Number(raw.Jml_Hilang) || (raw.Kondisi_Terakhir === 'Hilang' || raw.Kondisi === 'Hilang' ? (Number(raw.Jumlah) || jumlahAsal) : 0);
  const musnah = Number(raw.Jml_Musnah) || (raw.Kondisi_Terakhir === 'Musnah' || raw.Kondisi === 'Musnah' ? (Number(raw.Jumlah) || jumlahAsal) : 0);

  const conditionSum = baik + rr + rb + hilang + musnah;
  const totalJumlah = Number(raw.Jumlah) || (conditionSum > 0 ? conditionSum : jumlahAsal);

  let kondisi: ConditionType = 'Baik';
  const rawKondisi = String(raw.Kondisi || raw.Kondisi_Terakhir || '').trim();
  if (['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang', 'Musnah'].includes(rawKondisi)) {
    kondisi = rawKondisi as ConditionType;
  } else if (rr > 0 && rr >= baik) {
    kondisi = 'Rusak Ringan';
  } else if (rb > 0 && rb >= baik) {
    kondisi = 'Rusak Berat';
  } else if (musnah > 0) {
    kondisi = 'Musnah';
  } else if (hilang > 0) {
    kondisi = 'Hilang';
  }

  const isAudited = Boolean(raw.Tanggal_SO || raw.Status_Audit === 'Sudah SO');

  return {
    ID_Asset: idAsset,
    Nama_Asset: namaAsset,
    Kategori: kategori,
    Jenis: jenis,
    Penanggung_Jawab: pic,
    Unit_Kerja: unit,
    Tahun_Beli: tahunBeli ? String(tahunBeli) : undefined,
    Lokasi: lokasi ? String(lokasi) : undefined,
    Jumlah_Asal: jumlahAsal,
    Jumlah: totalJumlah,
    Kondisi: kondisi,
    Rincian_Kondisi: {
      Baik: baik || (kondisi === 'Baik' ? totalJumlah : 0),
      Rusak_Ringan: rr || (kondisi === 'Rusak Ringan' ? totalJumlah : 0),
      Rusak_Berat: rb || (kondisi === 'Rusak Berat' ? totalJumlah : 0),
      Hilang: hilang || (kondisi === 'Hilang' ? totalJumlah : 0),
      Musnah: musnah || (kondisi === 'Musnah' ? totalJumlah : 0),
    },
    Petugas_SO: String(raw.Petugas_SO || ''),
    Keterangan_SO: String(raw.Keterangan_SO || raw.Catatan || (raw.Petugas_SO_Terakhir && !raw.Tanggal_SO ? raw.Petugas_SO_Terakhir : '')),
    Tanggal_SO: String(raw.Tanggal_SO || ''),
    Sesi_SO_Terakhir: String(raw.Sesi_SO_Terakhir || 'SESI-001'),
    Status_Audit: isAudited ? 'Sudah SO' : 'Belum SO',
  };
}

export async function fetchInitialData(activeSheetName?: string): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();

  if (!gasUrl) {
    const assets = getLocalAssets();
    const categoriesFromAssets = assets.map((a) => a.Kategori).filter(Boolean);
    const unitsFromAssets = assets.map((a) => a.Unit_Kerja).filter(Boolean);
    const categories = Array.from(new Set([...getLocalCategories(), ...categoriesFromAssets]));
    const units = Array.from(new Set([...getLocalUnits(), ...unitsFromAssets]));
    saveLocalCategories(categories);
    saveLocalUnits(units);

    return {
      assets,
      sessions: getLocalSessions(),
      categories,
      units,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const urlWithParam = activeSheetName ? `${gasUrl}?sheet=${encodeURIComponent(activeSheetName)}` : gasUrl;
    const res = await fetch(urlWithParam, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      let rawAssets = Array.isArray(json.data.assets) ? json.data.assets : [];

      // If active session sheet has 0 assets, automatically fall back to Master_Assets!
      if (rawAssets.length === 0 && !activeSheetName) {
        try {
          const masterCtrl = new AbortController();
          const masterTimeout = setTimeout(() => masterCtrl.abort(), 9000);
          const masterRes = await fetch(`${gasUrl}?sheet=Master_Assets`, { method: 'GET', signal: masterCtrl.signal });
          clearTimeout(masterTimeout);
          const masterJson = await masterRes.json();
          if (masterJson.status === 'success' && Array.isArray(masterJson.data?.assets) && masterJson.data.assets.length > 0) {
            rawAssets = masterJson.data.assets;
            if (masterJson.data.categories) json.data.categories = masterJson.data.categories;
            if (masterJson.data.units) json.data.units = masterJson.data.units;
          }
        } catch (mErr) {
          console.warn('Fallback to Master_Assets failed:', mErr);
        }
      }

      const seenIds = new Map<string, number>();
      const normalizedAssets = rawAssets.map((a: any, idx: number) => normalizeRawAsset(a, idx, seenIds));

      const dynamicCats = Array.from(
        new Set([...(json.data.categories || getLocalCategories()), ...normalizedAssets.map((a: Asset) => a.Kategori)].filter(Boolean))
      );
      const dynamicUnits = Array.from(
        new Set([...(json.data.units || getLocalUnits()), ...normalizedAssets.map((a: Asset) => a.Unit_Kerja)].filter(Boolean))
      );

      saveLocalAssets(normalizedAssets);
      saveLocalSessions(json.data.sessions || []);
      saveLocalCategories(dynamicCats);
      saveLocalUnits(dynamicUnits);

      return {
        assets: normalizedAssets,
        sessions: json.data.sessions || [],
        categories: dynamicCats,
        units: dynamicUnits,
      };
    }
    throw new Error(json.message || 'Gagal mengambil data dari Google Sheet');
  } catch (err) {
    console.warn('Fallback to LocalStorage due to API fetch error:', err);
    return {
      assets: getLocalAssets(),
      sessions: getLocalSessions(),
      categories: getLocalCategories(),
      units: getLocalUnits(),
    };
  }
}

export async function updateStockOpname(payload: {
  ID_Asset: string;
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO_Terakhir: string;
}): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  if (!gasUrl) {
    return updateLocalStockOpnameInternal(payload);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'updateStockOpname',
        payload: {
          ...payload,
          Tanggal_SO: nowStr,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      saveLocalAssets(json.data.assets);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return json.data;
    }
    throw new Error(json.message || 'Gagal memperbarui data SO');
  } catch (err) {
    console.warn('GAS POST failed, falling back to local update:', err);
    return updateLocalStockOpnameInternal(payload);
  }
}

export async function addAsset(
  newAsset: Omit<Asset, 'Tanggal_SO' | 'Sesi_SO_Terakhir' | 'Status_Audit' | 'Rincian_Kondisi' | 'Petugas_SO'>
): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();
  const jml = Number(newAsset.Jumlah) || 1;
  const initialRincian: RincianKondisi = { Baik: jml, Rusak_Ringan: 0, Rusak_Berat: 0, Hilang: 0, Musnah: 0 };
  const currentAuditor = getActiveAuditor();
  const jmlAsal = newAsset.Jumlah_Asal !== undefined ? Number(newAsset.Jumlah_Asal) : jml;

  if (!gasUrl) {
    return addLocalAssetInternal(newAsset);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'addAsset',
        payload: {
          ...newAsset,
          Jumlah_Asal: jmlAsal,
          Rincian_Kondisi: initialRincian,
          Petugas_SO: currentAuditor,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      saveLocalAssets(json.data.assets);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return json.data;
    }
    throw new Error(json.message || 'Gagal menambah aset');
  } catch (err) {
    console.warn('GAS addAsset failed, using local update:', err);
    return addLocalAssetInternal(newAsset);
  }
}

export async function addCategory(name: string): Promise<InitialDataResponse> {
  const clean = name.trim();
  if (!clean) return fetchInitialData();

  const current = getLocalCategories();
  if (!current.includes(clean)) saveLocalCategories([...current, clean]);

  const gasUrl = getStoredGasUrl();
  if (!gasUrl) return fetchInitialData();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({ action: 'addCategory', payload: { name: clean } }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      if (json.data.categories) saveLocalCategories(json.data.categories);
      return json.data;
    }
    return fetchInitialData();
  } catch (err) {
    return fetchInitialData();
  }
}

export async function addUnit(name: string): Promise<InitialDataResponse> {
  const clean = name.trim();
  if (!clean) return fetchInitialData();

  const current = getLocalUnits();
  if (!current.includes(clean)) saveLocalUnits([...current, clean]);

  const gasUrl = getStoredGasUrl();
  if (!gasUrl) return fetchInitialData();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({ action: 'addUnit', payload: { name: clean } }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      if (json.data.units) saveLocalUnits(json.data.units);
      return json.data;
    }
    return fetchInitialData();
  } catch (err) {
    return fetchInitialData();
  }
}

export async function createSession(payload: {
  Nama_Sesi: string;
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Petugas_Utama: string;
  autoReset?: boolean;
}): Promise<InitialDataResponse> {
  const gasUrl = getStoredGasUrl();

  if (!gasUrl) {
    return createLocalSessionInternal(payload);
  }

  try {
    const newId = `SESI-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      signal: controller.signal,
      body: JSON.stringify({
        action: 'createSession',
        payload: {
          ID_Sesi: newId,
          ...payload,
        },
      }),
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      saveLocalAssets(json.data.assets);
      saveLocalSessions(json.data.sessions);
      if (json.data.categories) saveLocalCategories(json.data.categories);
      if (json.data.units) saveLocalUnits(json.data.units);
      return json.data;
    }
    throw new Error(json.message || 'Gagal membuat sesi SO baru');
  } catch (err) {
    console.warn('GAS createSession failed, falling back to local update:', err);
    return createLocalSessionInternal(payload);
  }
}

export function resetDemoData(): InitialDataResponse {
  localStorage.removeItem(STORAGE_KEYS.ASSETS);
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.UNITS);
  return {
    assets: getLocalAssets(),
    sessions: getLocalSessions(),
    categories: getLocalCategories(),
    units: getLocalUnits(),
  };
}

