/**
 * GOOGLE APPS SCRIPT BACKEND: Multi-Tab Asset Management & Stock Opname (SO)
 * VERSIONS FOR REAL DATA: Creates 5 master sheets: Master_Assets, Master_Kategori, Master_Unit, Sesi_SO, and SO_SESI_001.
 *
 * PETUNJUK DEPLOYMENT:
 * 1. Buka Google Sheets baru -> Ekstensi (Extensions) -> Apps Script.
 * 2. Tempelkan seluruh kode di bawah ini.
 * 3. Jalankan fungsi 'setupDatabase()' 1x untuk membuat seluruh Sheet master.
 * 4. Terapkan (Deploy) sebagai Aplikasi Web (Akses: Siapa saja / Anyone).
 * 5. Salin Web App Deployment URL dan tempelkan di aplikasi web!
 */

function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Master_Assets
  var sheetMaster = ss.getSheetByName('Master_Assets') || ss.insertSheet('Master_Assets');
  var headersMaster = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 
    'Unit_Kerja', 'Jumlah', 'Kondisi_Terakhir', 
    'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Petugas_SO_Terakhir', 'Tanggal_SO_Terakhir', 'Sesi_SO_Terakhir'
  ];
  if (sheetMaster.getLastRow() === 0) {
    sheetMaster.appendRow(headersMaster);
    sheetMaster.getRange(1, 1, 1, headersMaster.length).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
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
    'Jumlah', 'Kondisi', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Petugas_SO', 'Keterangan_SO', 'Tanggal_SO', 'Status_Audit'
  ];
  if (sheetSesiActive.getLastRow() === 0) {
    sheetSesiActive.appendRow(headersSO);
    sheetSesiActive.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#1d4ed8').setFontColor('#ffffff');
    sheetSesiActive.autoResizeColumns(1, headersSO.length);
  }

  Logger.log('Inisialisasi database Real Google Sheets dengan Master Kategori & Unit berhasil!');
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
    else throw new Error('Action tidak dikenal: ' + action);
    
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
  
  var sheetSO = ss.getSheetByName(targetSheetName) || sheetMaster;
  var assets = sheetToObjects(sheetSO);
  
  // Baca Master Kategori
  var categories = getListFromSingleColSheet(sheetKat);
  // Baca Master Unit
  var units = getListFromSingleColSheet(sheetUnit);

  return {
    assets: assets,
    sessions: sessions,
    categories: categories,
    units: units
  };
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
  
  if (!sheetSO) throw new Error('Sheet Sesi SO ' + sheetName + ' tidak ditemukan');
  
  var dataSO = sheetSO.getDataRange().getValues();
  var idAsset = payload.ID_Asset;
  var colMap = {};
  dataSO[0].forEach(function(h, idx) { colMap[h] = idx; });
  
  var foundRow = -1;
  for (var i = 1; i < dataSO.length; i++) {
    if (String(dataSO[i][colMap['ID_Asset']]) === String(idAsset)) {
      foundRow = i + 1;
      break;
    }
  }
  
  if (foundRow === -1) throw new Error('Asset tidak ditemukan di sheet sesi ' + sheetName);
  
  var nowStr = payload.Tanggal_SO || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var petugas = payload.Petugas_SO || 'Petugas SO';
  
  if (payload.Rincian_Kondisi) {
    sheetSO.getRange(foundRow, colMap['Jml_Baik'] + 1).setValue(payload.Rincian_Kondisi.Baik || 0);
    sheetSO.getRange(foundRow, colMap['Jml_Rusak_Ringan'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Ringan || 0);
    sheetSO.getRange(foundRow, colMap['Jml_Rusak_Berat'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Berat || 0);
    sheetSO.getRange(foundRow, colMap['Jml_Hilang'] + 1).setValue(payload.Rincian_Kondisi.Hilang || 0);
    sheetSO.getRange(foundRow, colMap['Jml_Musnah'] + 1).setValue(payload.Rincian_Kondisi.Musnah || 0);
  }
  
  if (payload.Kondisi !== undefined) sheetSO.getRange(foundRow, colMap['Kondisi'] + 1).setValue(payload.Kondisi);
  if (payload.Jumlah !== undefined) sheetSO.getRange(foundRow, colMap['Jumlah'] + 1).setValue(payload.Jumlah);
  sheetSO.getRange(foundRow, colMap['Petugas_SO'] + 1).setValue(petugas);
  if (payload.Keterangan_SO !== undefined) sheetSO.getRange(foundRow, colMap['Keterangan_SO'] + 1).setValue(payload.Keterangan_SO);
  sheetSO.getRange(foundRow, colMap['Tanggal_SO'] + 1).setValue(nowStr);
  sheetSO.getRange(foundRow, colMap['Status_Audit'] + 1).setValue('Sudah SO');
  
  if (sheetMaster) {
    var dataMaster = sheetMaster.getDataRange().getValues();
    var colMapM = {};
    dataMaster[0].forEach(function(h, idx) { colMapM[h] = idx; });
    
    for (var m = 1; m < dataMaster.length; m++) {
      if (String(dataMaster[m][colMapM['ID_Asset']]) === String(idAsset)) {
        var mRow = m + 1;
        if (payload.Kondisi !== undefined) sheetMaster.getRange(mRow, colMapM['Kondisi_Terakhir'] + 1).setValue(payload.Kondisi);
        if (payload.Jumlah !== undefined) sheetMaster.getRange(mRow, colMapM['Jumlah'] + 1).setValue(payload.Jumlah);
        if (payload.Rincian_Kondisi) {
          sheetMaster.getRange(mRow, colMapM['Jml_Baik'] + 1).setValue(payload.Rincian_Kondisi.Baik || 0);
          sheetMaster.getRange(mRow, colMapM['Jml_Rusak_Ringan'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Ringan || 0);
          sheetMaster.getRange(mRow, colMapM['Jml_Rusak_Berat'] + 1).setValue(payload.Rincian_Kondisi.Rusak_Berat || 0);
          sheetMaster.getRange(mRow, colMapM['Jml_Hilang'] + 1).setValue(payload.Rincian_Kondisi.Hilang || 0);
          sheetMaster.getRange(mRow, colMapM['Jml_Musnah'] + 1).setValue(payload.Rincian_Kondisi.Musnah || 0);
        }
        sheetMaster.getRange(mRow, colMapM['Petugas_SO_Terakhir'] + 1).setValue(petugas);
        sheetMaster.getRange(mRow, colMapM['Tanggal_SO_Terakhir'] + 1).setValue(nowStr);
        sheetMaster.getRange(mRow, colMapM['Sesi_SO_Terakhir'] + 1).setValue(payload.Sesi_SO_Terakhir);
        break;
      }
    }
  }
  
  return getInitialDataInternal(sheetName);
}

function addAssetInternal(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMaster = ss.getSheetByName('Master_Assets');
  var sheetSesiList = ss.getSheetByName('Sesi_SO');
  var sessions = sheetToObjects(sheetSesiList);
  var activeSesi = sessions.filter(function(s) { return s.Status_Sesi === 'Aktif'; })[0] || sessions[0];
  var sheetName = activeSesi ? activeSesi.Sheet_Name : 'SO_SESI_001';
  var sheetSO = ss.getSheetByName(sheetName);
  
  var idAsset = payload.ID_Asset || ('AST-' + Math.floor(1000 + Math.random() * 9000));
  var jml = Number(payload.Jumlah) || 1;

  // Auto-sync ke sheet Master_Kategori & Master_Unit
  ensureMasterCategory(payload.Kategori);
  ensureMasterUnit(payload.Unit_Kerja);
  
  if (sheetMaster) {
    sheetMaster.appendRow([
      idAsset, payload.Nama_Asset, payload.Kategori, payload.Jenis, payload.Penanggung_Jawab,
      payload.Unit_Kerja, jml, payload.Kondisi || 'Baik',
      jml, 0, 0, 0, 0,
      '-', '', ''
    ]);
  }
  
  if (sheetSO) {
    sheetSO.appendRow([
      idAsset, payload.Nama_Asset, payload.Kategori, payload.Jenis, payload.Penanggung_Jawab,
      payload.Unit_Kerja, jml, payload.Kondisi || 'Baik',
      jml, 0, 0, 0, 0,
      payload.Petugas_SO || 'Auditor Utama', '', '', 'Belum SO'
    ]);
  }
  
  return getInitialDataInternal(sheetName);
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
  for (var i = 1; i < sesiData.length; i++) {
    sheetSesiList.getRange(i + 1, 7).setValue('Selesai');
  }
  
  sheetSesiList.appendRow([idSesi, namaSesi, sheetName, tglMulai, targetUnit, petugasUtama, 'Aktif']);
  
  var sheetNewSO = ss.insertSheet(sheetName);
  var headersSO = [
    'ID_Asset', 'Nama_Asset', 'Kategori', 'Jenis', 'Penanggung_Jawab', 'Unit_Kerja',
    'Jumlah', 'Kondisi', 'Jml_Baik', 'Jml_Rusak_Ringan', 'Jml_Rusak_Berat', 'Jml_Hilang', 'Jml_Musnah',
    'Petugas_SO', 'Keterangan_SO', 'Tanggal_SO', 'Status_Audit'
  ];
  sheetNewSO.appendRow(headersSO);
  sheetNewSO.getRange(1, 1, 1, headersSO.length).setFontWeight('bold').setBackground('#2563eb').setFontColor('#ffffff');
  
  if (sheetMaster) {
    var dataMaster = sheetMaster.getDataRange().getValues();
    var colMap = {};
    dataMaster[0].forEach(function(h, idx) { colMap[h] = idx; });
    
    for (var m = 1; m < dataMaster.length; m++) {
      var rowM = dataMaster[m];
      var unitAset = rowM[colMap['Unit_Kerja']];
      if (targetUnit === 'Semua' || unitAset === targetUnit) {
        sheetNewSO.appendRow([
          rowM[colMap['ID_Asset']],
          rowM[colMap['Nama_Asset']],
          rowM[colMap['Kategori']],
          rowM[colMap['Jenis']],
          rowM[colMap['Penanggung_Jawab']],
          rowM[colMap['Unit_Kerja']],
          rowM[colMap['Jumlah']],
          rowM[colMap['Kondisi_Terakhir']] || 'Baik',
          rowM[colMap['Jml_Baik']] || rowM[colMap['Jumlah']],
          rowM[colMap['Jml_Rusak_Ringan']] || 0,
          rowM[colMap['Jml_Rusak_Berat']] || 0,
          rowM[colMap['Jml_Hilang']] || 0,
          rowM[colMap['Jml_Musnah']] || 0,
          petugasUtama,
          '',
          '',
          'Belum SO'
        ]);
      }
    }
    sheetNewSO.autoResizeColumns(1, headersSO.length);
  }
  
  return getInitialDataInternal(sheetName);
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = data[i][j];
    
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
}

