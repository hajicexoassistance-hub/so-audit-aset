import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, HelpCircle, Save } from 'lucide-react';
import { getStoredGasUrl, setStoredGasUrl } from '../services/apiService';

interface CodeGsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: (url: string) => void;
}

export const CodeGsModal: React.FC<CodeGsModalProps> = ({ isOpen, onClose, onUrlUpdated }) => {
  const [copied, setCopied] = useState(false);
  const [inputUrl, setInputUrl] = useState(getStoredGasUrl());
  const [activeTab, setActiveTab] = useState<'instructions' | 'code'>('instructions');

  if (!isOpen) return null;

  const codeGsContent = `/**
 * GOOGLE APPS SCRIPT BACKEND: Multi-Tab Asset Management & Stock Opname (SO)
 * VERSIONS FOR REAL DATA: Creates 5 master sheets: Master_Assets, Master_Kategori, Master_Unit, Sesi_SO, and SO_SESI_001.
 *
 * CARA PENGGUNAAN:
 * 1. Buka Google Sheets baru -> Ekstensi (Extensions) -> Apps Script.
 * 2. Tempelkan seluruh kode di bawah ini.
 * 3. Jalankan 'setupDatabase()' 1x untuk membuat Sheet 'Master_Assets', 'Master_Kategori', 'Master_Unit', 'Sesi_SO', dan 'SO_SESI_001'.
 * 4. Terapkan (Deploy) sebagai Aplikasi Web (Akses: Siapa saja / Anyone).
 * 5. Salin URL Web App dan tempelkan ke aplikasi web!
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets') || ss.insertSheet('Master_Assets');
  var headersMaster = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 
    'Unit_Kerja', 'Tahun_Beli', 'Lokasi', 'Jumlah_Asal', 'Jumlah', 'Kondisi_Terakhir', 
    'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Petugas_SO_Terakhir', 'Tanggal_SO_Terakhir', 'Sesi_SO_Terakhir'
  ];
  if (sheetMaster.getLastRow() === 0) {
    sheetMaster.appendRow(headersMaster);
    sheetMaster.getRange(1, 1, 1, headersMaster.length).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
    sheetMaster.appendRow(['AST-101', 'Cangkul Heavy Duty Ultra', 'Peralatan', 'Alat Kebun', 'Sulaeman', 'Nursery Ciminyak', '2023', 'Gudang Kebun Blok A', 10, 10, 'Baik', 10, 0, 0, 0, 0, 'Auditor Utama', '', 'SESI-001']);
    sheetMaster.appendRow(['AST-102', 'Sprayer Elektrik 16 Liter', 'Peralatan', 'Alat Semprot', 'Bambang Hartono', 'Nursery Ciminyak', '2024', 'Gudang Alat R.01', 3, 3, 'Baik', 3, 0, 0, 0, 0, 'Auditor Utama', '', 'SESI-001']);
    sheetMaster.appendRow(['AST-103', 'Komputer Kasir All-In-One HP', 'Elektronik', 'Hardware IT', 'Rudi Hermansyah', 'Office Ciminyak', '2022', 'Ruang Admin', 2, 2, 'Baik', 2, 0, 0, 0, 0, 'Auditor Utama', '', 'SESI-001']);
    sheetMaster.autoResizeColumns(1, headersMaster.length);
  }
  
  // 2. Setup Sheet Master_Kategori
  var sheetKat = ss.getSheetByName('Master_Kategori') || ss.insertSheet('Master_Kategori');
  if (sheetKat.getLastRow() === 0) {
    sheetKat.appendRow(['Nama_Kategori']);
    sheetKat.getRange(1, 1).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
    var defaultKategori = ['Peralatan', 'Perlengkapan', 'Habis Pakai', 'Elektronik', 'Kendaraan'];
    defaultKategori.forEach(function(k) { sheetKat.appendRow([k]); });
    sheetKat.autoResizeColumns(1, 1);
  }

  // 3. Setup Sheet Master_Unit
  var sheetUnit = ss.getSheetByName('Master_Unit') || ss.insertSheet('Master_Unit');
  if (sheetUnit.getLastRow() === 0) {
    sheetUnit.appendRow(['Nama_Unit']);
    sheetUnit.getRange(1, 1).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
    var defaultUnit = ['Nursery Ciminyak', 'Office Ciminyak', 'Gudang Utama'];
    defaultUnit.forEach(function(u) { sheetUnit.appendRow([u]); });
    sheetUnit.autoResizeColumns(1, 1);
  }

  // 4. Setup Sheet Sesi_SO
  var sheetSesi = ss.getSheetByName('Sesi_SO') || ss.insertSheet('Sesi_SO');
  var headersSesi = ['ID_Sesi', 'Nama_Sesi', 'Sheet_Name', 'Tanggal_Mulai', 'Target_Unit_Kerja', 'Petugas_Utama', 'Status_Sesi'];
  if (sheetSesi.getLastRow() === 0) {
    sheetSesi.appendRow(headersSesi);
    sheetSesi.getRange(1, 1, 1, headersSesi.length).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
    var tglToday = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    sheetSesi.appendRow(['SESI-001', 'Stock Opname Awal', 'SO_SESI_001', tglToday, 'Semua', 'Auditor Utama', 'Aktif']);
    sheetSesi.autoResizeColumns(1, headersSesi.length);
  }

  // 5. Setup Sheet SO_SESI_001
  var sheetSesiActive = ss.getSheetByName('SO_SESI_001') || ss.insertSheet('SO_SESI_001');
  var headersSO = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 'Unit_Kerja',
    'Tahun_Beli', 'Lokasi', 'Jumlah_Asal', 'Jumlah', 'Kondisi', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Petugas_SO', 'Keterangan_SO', 'Tanggal_SO', 'Status_Audit'
  ];
  if (sheetSesiActive.getLastRow() === 0) {
    sheetSesiActive.appendRow(headersSO);
    sheetSesiActive.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#1d4ed8').setFontColor('#ffffff');
    sheetSesiActive.appendRow(['AST-101', 'Cangkul Heavy Duty Ultra', 'Peralatan', 'Alat Kebun', 'Sulaeman', 'Nursery Ciminyak', '2023', 'Gudang Kebun Blok A', 10, 10, 'Baik', 10, 0, 0, 0, 0, 'Auditor Utama', '', '', 'Belum SO']);
    sheetSesiActive.appendRow(['AST-102', 'Sprayer Elektrik 16 Liter', 'Peralatan', 'Alat Semprot', 'Bambang Hartono', 'Nursery Ciminyak', '2024', 'Gudang Alat R.01', 3, 3, 'Baik', 3, 0, 0, 0, 0, 'Auditor Utama', '', '', 'Belum SO']);
    sheetSesiActive.appendRow(['AST-103', 'Komputer Kasir All-In-One HP', 'Elektronik', 'Hardware IT', 'Rudi Hermansyah', 'Office Ciminyak', '2022', 'Ruang Admin', 2, 2, 'Baik', 2, 0, 0, 0, 0, 'Auditor Utama', '', '', 'Belum SO']);
    sheetSesiActive.autoResizeColumns(1, headersSO.length);
  }
}

function doGet(e) {
  try {
    var sheetName = e && e.parameter ? e.parameter.sheet : null;
    return createJsonResponse({ status: 'success', data: getInitialDataInternal(sheetName) });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    var payload = postData.payload || {};
    var result;
    
    if (action === 'getInitialData') result = getInitialDataInternal(payload.activeSheetName);
    else if (action === 'updateStockOpname') result = updateStockOpnameInternal(payload);
    else if (action === 'addAsset') result = addAssetInternal(payload);
    else if (action === 'createSession') result = createSessionInternal(payload);
    else if (action === 'addCategory') result = addCategoryInternal(payload.name);
    else if (action === 'addUnit') result = addUnitInternal(payload.name);
    else throw new Error('Action tidak dikenal');
    
    return createJsonResponse({ status: 'success', data: result });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function getInitialDataInternal(activeSheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  var sheetSesiList = ss.getSheetByName('Sesi_SO');
  var sheetKat = ss.getSheetByName('Master_Kategori');
  var sheetUnit = ss.getSheetByName('Master_Unit');
  
  if (!sheetMaster || !sheetSesiList || !sheetKat || !sheetUnit) {
    setupDatabase();
    sheetMaster = ss.getSheetByName('Master_Assets');
    sheetSesiList = ss.getSheetByName('Sesi_SO');
    sheetKat = ss.getSheetByName('Master_Kategori');
    sheetUnit = ss.getSheetByName('Master_Unit');
  }
  
  var sessions = sheetToObjects(sheetSesiList);
  var targetSheetName = activeSheetName;
  
  if (!targetSheetName) {
    var activeSesiObj = sessions.filter(function(s) { return s.Status_Sesi === 'Aktif'; })[0] || sessions[0];
    targetSheetName = activeSesiObj ? (activeSesiObj.Sheet_Name || 'SO_SESI_001') : 'SO_SESI_001';
  }
  
  var sheetSO = ss.getSheetByName(targetSheetName);
  var assets = [];
  if (sheetSO) {
    assets = sheetToObjects(sheetSO);
  }

  // Jika sheet sesi masih kosong tetapi Master_Assets sudah diisi oleh pengguna:
  if (assets.length === 0 && sheetMaster) {
    var masterAssets = sheetToObjects(sheetMaster);
    if (masterAssets.length > 0) {
      if (sheetSO && sheetSO.getName() !== sheetMaster.getName()) {
        syncMasterToSO(sheetMaster, sheetSO);
        assets = sheetToObjects(sheetSO);
      }
      if (assets.length === 0) {
        assets = masterAssets;
      }
    }
  }
  
  var categories = getListFromSingleColSheet(sheetKat);
  var units = getListFromSingleColSheet(sheetUnit);

  return {
    assets: assets,
    sessions: sessions,
    categories: categories,
    units: units
  };
}

function syncMasterToSO(sheetMaster, sheetSO) {
  var dataM = sheetMaster.getDataRange().getValues();
  if (dataM.length <= 1) return;
  var colMap = {};
  dataM[0].forEach(function(h, idx) { colMap[String(h).trim()] = idx; });
  
  for (var i = 1; i < dataM.length; i++) {
    var row = dataM[i];
    if (!row.some(function(c) { return String(c).trim() !== ''; })) continue;
    var idA = row[colMap['ID_Asset']] || ('AST-' + (100 + i));
    var nmA = row[colMap['Nama_Asset']] || 'Barang';
    var kat = row[colMap['Kategori']] || 'Peralatan';
    var jns = row[colMap['Jenis']] || '';
    var pic = row[colMap['Penanggung_Jawab']] || '-';
    var unt = row[colMap['Unit_Kerja']] || 'Nursery Ciminyak';
    var thn = colMap['Tahun_Beli'] !== undefined ? row[colMap['Tahun_Beli']] : '';
    var lok = colMap['Lokasi'] !== undefined ? row[colMap['Lokasi']] : '';
    var jmlAsal = colMap['Jumlah_Asal'] !== undefined ? (Number(row[colMap['Jumlah_Asal']]) || 1) : 1;
    var jml = Number(row[colMap['Jumlah']]) || jmlAsal;
    var kond = row[colMap['Kondisi_Terakhir']] || row[colMap['Kondisi']] || 'Baik';
    var b = Number(row[colMap['Jml_Baik']]) || (kond === 'Baik' ? jml : 0);
    var rr = Number(row[colMap['Jml_Rusak_Ringan']]) || (kond === 'Rusak Ringan' ? jml : 0);
    var rb = Number(row[colMap['Jml_Rusak_Berat']]) || (kond === 'Rusak Berat' ? jml : 0);
    var hlg = Number(row[colMap['Jml_Hilang']]) || (kond === 'Hilang' ? jml : 0);
    var msn = Number(row[colMap['Jml_Musnah']]) || (kond === 'Musnah' ? jml : 0);
    
    sheetSO.appendRow([
      idA, nmA, kat, jns, pic, unt, thn, lok, jmlAsal, jml, kond,
      b, rr, rb, hlg, msn, 'Petugas SO', '', '', 'Belum SO'
    ]);
  }
}

function getListFromSingleColSheet(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var val = String(data[i][0]).trim();
    if (val && list.indexOf(val) === -1) list.push(val);
  }
  return list;
}

function ensureMasterCategory(categoryName) {
  if (!categoryName) return;
  var name = String(categoryName).trim();
  if (!name) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master_Kategori') || ss.insertSheet('Master_Kategori');
  var current = getListFromSingleColSheet(sheet);
  if (current.indexOf(name) === -1) {
    sheet.appendRow([name]);
  }
}

function ensureMasterUnit(unitName) {
  if (!unitName) return;
  var name = String(unitName).trim();
  if (!name) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Master_Unit') || ss.insertSheet('Master_Unit');
  var current = getListFromSingleColSheet(sheet);
  if (current.indexOf(name) === -1) {
    sheet.appendRow([name]);
  }
}

function addCategoryInternal(name) {
  ensureMasterCategory(name);
  return getInitialDataInternal();
}

function addUnitInternal(name) {
  ensureMasterUnit(name);
  return getInitialDataInternal();
}

function updateStockOpnameInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSesiList = ss.getSheetByName('Sesi_SO');
  var sessions = sheetToObjects(sheetSesiList);
  var targetSesi = sessions.filter(function(s) { return s.ID_Sesi === payload.Sesi_SO_Terakhir; })[0];
  var sheetName = targetSesi ? targetSesi.Sheet_Name : 'SO_SESI_001';
  var sheetSO = ss.getSheetByName(sheetName);
  var sheetMaster = ss.getSheetByName('Master_Assets');
  if (!sheetSO) sheetSO = sheetMaster;
  
  var dataSO = sheetSO.getDataRange().getValues();
  var idAsset = payload.ID_Asset;
  var colMap = {}; dataSO[0].forEach(function(h, idx) { colMap[String(h).trim()] = idx; });
  var foundRow = -1;
  for (var i = 1; i < dataSO.length; i++) {
    if (String(dataSO[i][colMap['ID_Asset']]) === String(idAsset)) { foundRow = i + 1; break; }
  }
  
  var nowStr = payload.Tanggal_SO || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var petugas = payload.Petugas_SO || 'Petugas SO';
  
  if (foundRow !== -1) {
    if (payload.Rincian_Kondisi) {
      if (colMap['Jml_Baik'] !== undefined) sheetSO.getRange(foundRow, colMap['Jml_Baik'] + 1).setValue(payload.Rincian_Kondisi.Baik || 0);
      if (colMap['Jml_Rusak_Ringan'] !== undefined) sheetSO.getRange(foundRow, colMap['Jml_Rusak_Ringan'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Ringan || 0);
      if (colMap['Jml_Rusak_Berat'] !== undefined) sheetSO.getRange(foundRow, colMap['Jml_Rusak_Berat'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Berat || 0);
      if (colMap['Jml_Hilang'] !== undefined) sheetSO.getRange(foundRow, colMap['Jml_Hilang'] + 1).setValue(payload.Rincian_Kondisi.Hilang || 0);
      if (colMap['Jml_Musnah'] !== undefined) sheetSO.getRange(foundRow, colMap['Jml_Musnah'] + 1).setValue(payload.Rincian_Kondisi.Musnah || 0);
    }
    if (payload.Kondisi !== undefined && colMap['Kondisi'] !== undefined) sheetSO.getRange(foundRow, colMap['Kondisi'] + 1).setValue(payload.Kondisi);
    if (payload.Jumlah !== undefined && colMap['Jumlah'] !== undefined) sheetSO.getRange(foundRow, colMap['Jumlah'] + 1).setValue(payload.Jumlah);
    if (colMap['Petugas_SO'] !== undefined) sheetSO.getRange(foundRow, colMap['Petugas_SO'] + 1).setValue(petugas);
    if (payload.Keterangan_SO !== undefined && colMap['Keterangan_SO'] !== undefined) sheetSO.getRange(foundRow, colMap['Keterangan_SO'] + 1).setValue(payload.Keterangan_SO);
    if (colMap['Tanggal_SO'] !== undefined) sheetSO.getRange(foundRow, colMap['Tanggal_SO'] + 1).setValue(nowStr);
    if (colMap['Status_Audit'] !== undefined) sheetSO.getRange(foundRow, colMap['Status_Audit'] + 1).setValue('Sudah SO');
  }

  // Update juga ke Master_Assets
  if (sheetMaster) {
    var dataM = sheetMaster.getDataRange().getValues();
    var colM = {}; dataM[0].forEach(function(h, idx) { colM[String(h).trim()] = idx; });
    for (var m = 1; m < dataM.length; m++) {
      if (String(dataM[m][colM['ID_Asset']]) === String(idAsset)) {
        var mRow = m + 1;
        if (payload.Kondisi !== undefined && colM['Kondisi_Terakhir'] !== undefined) sheetMaster.getRange(mRow, colM['Kondisi_Terakhir'] + 1).setValue(payload.Kondisi);
        if (payload.Jumlah !== undefined && colM['Jumlah'] !== undefined) sheetMaster.getRange(mRow, colM['Jumlah'] + 1).setValue(payload.Jumlah);
        if (colM['Petugas_SO_Terakhir'] !== undefined) sheetMaster.getRange(mRow, colM['Petugas_SO_Terakhir'] + 1).setValue(petugas);
        if (colM['Tanggal_SO_Terakhir'] !== undefined) sheetMaster.getRange(mRow, colM['Tanggal_SO_Terakhir'] + 1).setValue(nowStr);
        if (colM['Sesi_SO_Terakhir'] !== undefined) sheetMaster.getRange(mRow, colM['Sesi_SO_Terakhir'] + 1).setValue(payload.Sesi_SO_Terakhir);
        break;
      }
    }
  }
  return getInitialDataInternal(sheetName);
}

function addAssetInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  var idAsset = payload.ID_Asset || ('AST-' + Math.floor(1000 + Math.random() * 9000));
  var jml = Number(payload.Jumlah) || 1;
  var jmlAsal = payload.Jumlah_Asal !== undefined ? Number(payload.Jumlah_Asal) : jml;
  var thn = payload.Tahun_Beli || '';
  var lok = payload.Lokasi || '';
  ensureMasterCategory(payload.Kategori);
  ensureMasterUnit(payload.Unit_Kerja);
  if (sheetMaster) {
    sheetMaster.appendRow([idAsset, payload.Nama_Asset, payload.Kategori, payload.Jenis, payload.Penanggung_Jawab, payload.Unit_Kerja, thn, lok, jmlAsal, jml, payload.Kondisi || 'Baik', jml, 0, 0, 0, 0, '-', '', '']);
  }
  return getInitialDataInternal();
}

function createSessionInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSesiList = ss.getSheetByName('Sesi_SO');
  var sheetMaster = ss.getSheetByName('Master_Assets');
  var idSesi = payload.ID_Sesi || ('SESI-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd'));
  var namaSesi = payload.Nama_Sesi || 'Sesi SO Incidental';
  var sheetName = 'SO_' + idSesi.replace(/[^a-zA-Z0-9]/g, '_');
  var tglMulai = payload.Tanggal_Mulai || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var targetUnit = payload.Target_Unit_Kerja || 'Semua';
  var petugasUtama = payload.Petugas_Utama || 'Petugas SO';
  ensureMasterUnit(targetUnit);
  var sesiData = sheetSesiList.getDataRange().getValues();
  for (var i = 1; i < sesiData.length; i++) sheetSesiList.getRange(i + 1, 7).setValue('Selesai');
  sheetSesiList.appendRow([idSesi, namaSesi, sheetName, tglMulai, targetUnit, petugasUtama, 'Aktif']);
  var sheetNewSO = ss.insertSheet(sheetName);
  var headersSO = ['ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 'Unit_Kerja', 'Tahun_Beli', 'Lokasi', 'Jumlah_Asal', 'Jumlah', 'Kondisi', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah', 'Petugas_SO', 'Keterangan_SO', 'Tanggal_SO', 'Status_Audit'];
  sheetNewSO.appendRow(headersSO);
  sheetNewSO.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
  if (sheetMaster) {
    var dataMaster = sheetMaster.getDataRange().getValues();
    var colMap = {}; dataMaster[0].forEach(function(h, idx) { colMap[String(h).trim()] = idx; });
    for (var m = 1; m < dataMaster.length; m++) {
      var rowM = dataMaster[m];
      var unitAset = rowM[colMap['Unit_Kerja']];
      if (targetUnit === 'Semua' || unitAset === targetUnit) {
        var thnRow = colMap['Tahun_Beli'] !== undefined ? rowM[colMap['Tahun_Beli']] : '';
        var lokRow = colMap['Lokasi'] !== undefined ? rowM[colMap['Lokasi']] : '';
        var jmlAsalRow = colMap['Jumlah_Asal'] !== undefined ? rowM[colMap['Jumlah_Asal']] : rowM[colMap['Jumlah']];
        sheetNewSO.appendRow([rowM[colMap['ID_Asset']], rowM[colMap['Nama_Asset']], rowM[colMap['Kategori']], rowM[colMap['Jenis']], rowM[colMap['Penanggung_Jawab']], rowM[colMap['Unit_Kerja']], thnRow, lokRow, jmlAsalRow, rowM[colMap['Jumlah']], rowM[colMap['Kondisi_Terakhir']] || 'Baik', rowM[colMap['Jml_Baik']] || rowM[colMap['Jumlah']], rowM[colMap['Jml_Rusak_Ringan']] || 0, rowM[colMap['Jml_Rusak_Berat']] || 0, rowM[colMap['Jml_Hilang']] || 0, rowM[colMap['Jml_Musnah']] || 0, petugasUtama, '', '', 'Belum SO']);
      }
    }
    sheetNewSO.autoResizeColumns(1, headersSO.length);
  }
  return getInitialDataInternal(sheetName);
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0], result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row.some(function(c) { return String(c).trim() !== ''; })) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var h = String(headers[j]).trim();
      if (h) obj[h] = row[j];
    }
    if (!obj['ID_Asset'] || String(obj['ID_Asset']).trim() === '') {
      obj['ID_Asset'] = 'AST-' + (100 + i);
    }
    if (!obj['Kondisi'] && obj['Kondisi_Terakhir']) {
      obj['Kondisi'] = obj['Kondisi_Terakhir'];
    }
    obj['Rincian_Kondisi'] = {
      Baik: Number(obj['Jml_Baik']) || 0,
      Rusak_Ringan: Number(obj['Jml_Rusak_Ringan']) || 0,
      Rusak_Berat: Number(obj['Jml_Rusak_Berat']) || 0,
      Hilang: Number(obj['Jml_Hilang']) || 0,
      Musnah: Number(obj['Jml_Musnah']) || 0
    };
    result.push(obj);
  }
  return result;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeGsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    setStoredGasUrl(inputUrl);
    onUrlUpdated(inputUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              GS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Tab Google Sheet API
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Backend Apps Script (Master_Assets & Tab Sesi SO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 pt-2 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Panduan & Connect URL
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kode Backend Multi-Tab (Code.gs)
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'instructions' ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-2">
                <label className="block text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                  GAS Web App Deployment URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveUrl}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Biarkan kosong jika ingin mencoba aplikasi dalam <strong>Mode Hybrid (Mock Local Storage)</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Langkah Setup Google Spreadsheet:
                </h3>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 font-medium leading-relaxed">
                  <li>Buka <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3"/></a> baru.</li>
                  <li>Buka menu <strong>Ekstensi (Extensions) &rarr; Apps Script</strong>.</li>
                  <li>Salin kode pada tab <strong>Kode Backend Multi-Tab (Code.gs)</strong> di atas dan tempelkan.</li>
                  <li>Jalankan fungsi <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 font-mono">setupDatabase()</code> 1x.</li>
                  <li>Klik <strong>Terapkan (Deploy) &rarr; Menerapkan sebagai Aplikasi Web</strong> (Akses: <strong>Anyone / Siapa saja</strong>).</li>
                  <li>Salin URL Web App dan tempelkan ke form di atas.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Code.gs (Multi-Tab Version)
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua Kode'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 text-slate-100 rounded-2xl text-[10px] font-mono overflow-x-auto border border-slate-800 max-h-80 leading-relaxed">
                {codeGsContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
