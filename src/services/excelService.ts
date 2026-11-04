import * as XLSX from 'xlsx';
import { Asset, SesiSO } from '../types';

/**
 * Downloads a pre-formatted Multi-Sheet Excel template file (.xlsx)
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Master_Assets
  const masterAssetsData = [
    [
      'ID_Asset',
      'Nama_Asset',
      'Kategori',
      'Jenis',
      'Penanggung_Jawab',
      'Unit_Kerja',
      'Tahun_Beli',
      'Lokasi',
      'Jumlah_Asal',
      'Jumlah',
      'Kondisi',
      'Jml_Baik',
      'Jml_Rusak_Ringan',
      'Jml_Rusak_Berat',
      'Jml_Hilang',
      'Jml_Musnah',
      'Keterangan_SO',
    ],
    [
      'AST-101',
      'Cangkul Heavy Duty Ultra',
      'Peralatan',
      'Alat Kebun',
      'Sulaeman',
      'Nursery Ciminyak',
      2023,
      'Gudang Kebun Blok A',
      10,
      10,
      'Baik',
      7,
      1,
      1,
      0,
      1,
      '7 Baik, 1 Baret, 1 Gagang retak, 1 Karatan musnah',
    ],
    [
      'AST-102',
      'Sprayer Elektrik 16 Liter',
      'Peralatan',
      'Alat Semprot',
      'Bambang Hartono',
      'Nursery Ciminyak',
      2024,
      'Gudang Alat R.01',
      3,
      3,
      'Rusak Ringan',
      2,
      1,
      0,
      0,
      0,
      '2 Unit mulus, 1 selang bocor',
    ],
    [
      'AST-103',
      'Polybag 30x35 Super (Pak 100pcs)',
      'Habis Pakai',
      'Bibit & Media',
      'Dewi Lestari',
      'Nursery Ciminyak',
      2025,
      'Rak Media 02',
      50,
      50,
      'Baik',
      50,
      0,
      0,
      0,
      0,
      'Stok terhitung 50 pak rapi di gudang',
    ],
    [
      'AST-104',
      'Pupuk NPK Mutiara 50kg',
      'Habis Pakai',
      'Nutrisi Tanaman',
      'Sulaeman',
      'Nursery Ciminyak',
      2024,
      'Gudang Pupuk',
      12,
      12,
      'Musnah',
      0,
      0,
      0,
      0,
      12,
      '12 Karung jebol mencair terkena banjir',
    ],
    [
      'AST-105',
      'Komputer Kasir All-In-One HP',
      'Peralatan',
      'Hardware IT',
      'Rudi Hermansyah',
      'Office Ciminyak',
      2022,
      'Ruang Kasir / Admin',
      2,
      2,
      'Baik',
      2,
      0,
      0,
      0,
      0,
      '2 Unit berfungsi baik',
    ],
    [
      'AST-106',
      'Meja Rapat Kayu Jati 8 Kursi',
      'Perlengkapan',
      'Furniture Office',
      'Siti Rahma',
      'Office Ciminyak',
      2021,
      'Ruang Rapat Utama',
      1,
      1,
      'Baik',
      1,
      0,
      0,
      0,
      0,
      '1 Set mulus di ruang rapat',
    ],
  ];
  const wsMaster = XLSX.utils.aoa_to_sheet(masterAssetsData);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master_Assets');

  // 2. Sheet Master_Kategori
  const kategoriData = [
    ['Nama_Kategori', 'Deskripsi'],
    ['Peralatan', 'Alat kerja, mesin, kompresor, alat kebun, perlengkapan IT'],
    ['Perlengkapan', 'Furniture, meja, kursi, fasilitas gedung'],
    ['Habis Pakai', 'Pupuk, polybag, kertas A4, bahan kimia, ATK'],
    ['Elektronik', 'Komputer, monitor, TV, printer, scanner'],
    ['Kendaraan', 'Sepeda motor, mobil operasional, traktor'],
  ];
  const wsKategori = XLSX.utils.aoa_to_sheet(kategoriData);
  XLSX.utils.book_append_sheet(wb, wsKategori, 'Master_Kategori');

  // 3. Sheet Master_Unit
  const unitData = [
    ['Nama_Unit', 'Keterangan'],
    ['Nursery Ciminyak', 'Unit Pembibitan & Kebun Ciminyak'],
    ['Office Ciminyak', 'Unit Administrasi & Kantor Ciminyak'],
    ['Gudang Utama', 'Pusat Penyimpanan Stok & Alat'],
  ];
  const wsUnit = XLSX.utils.aoa_to_sheet(unitData);
  XLSX.utils.book_append_sheet(wb, wsUnit, 'Master_Unit');

  // 4. Sheet Sesi_SO Default
  const sesiData = [
    ['ID_Sesi', 'Nama_Sesi', 'Sheet_Name', 'Tanggal_Mulai', 'Target_Unit_Kerja', 'Petugas_Utama', 'Status_Sesi'],
    ['SESI-2026-01', 'Stock Opname Q1 2026 (Nursery & Office Ciminyak)', 'SO_2026_Q1', '2026-03-01', 'Semua', 'Auditor Utama', 'Aktif'],
  ];
  const wsSesi = XLSX.utils.aoa_to_sheet(sesiData);
  XLSX.utils.book_append_sheet(wb, wsSesi, 'Sesi_SO');

  // 5. Sheet Contoh Sesi SO (SO_2026_Q1)
  const sampleSoData = [
    [
      'ID_Asset',
      'Nama_Asset',
      'Kategori',
      'Jenis',
      'Penanggung_Jawab',
      'Unit_Kerja',
      'Tahun_Beli',
      'Lokasi',
      'Jumlah_Asal',
      'Jumlah',
      'Kondisi',
      'Jml_Baik',
      'Jml_Rusak_Ringan',
      'Jml_Rusak_Berat',
      'Jml_Hilang',
      'Jml_Musnah',
      'Petugas_SO',
      'Keterangan_SO',
      'Tanggal_SO',
      'Status_Audit',
    ],
    [
      'AST-101',
      'Cangkul Heavy Duty Ultra',
      'Peralatan',
      'Alat Kebun',
      'Sulaeman',
      'Nursery Ciminyak',
      2023,
      'Gudang Kebun Blok A',
      10,
      10,
      'Baik',
      7,
      1,
      1,
      0,
      1,
      'Auditor Utama',
      '7 Baik, 1 Baret, 1 Gagang retak, 1 Karatan musnah',
      '2026-03-01 10:00:00',
      'Sudah SO',
    ],
    [
      'AST-102',
      'Sprayer Elektrik 16 Liter',
      'Peralatan',
      'Alat Semprot',
      'Bambang Hartono',
      'Nursery Ciminyak',
      2024,
      'Gudang Alat R.01',
      3,
      3,
      'Rusak Ringan',
      2,
      1,
      0,
      0,
      0,
      'Auditor Utama',
      '2 Unit mulus, 1 selang bocor',
      '2026-03-01 11:30:00',
      'Sudah SO',
    ],
  ];
  const wsSampleSo = XLSX.utils.aoa_to_sheet(sampleSoData);
  XLSX.utils.book_append_sheet(wb, wsSampleSo, 'SO_2026_Q1');

  // Write file
  XLSX.writeFile(wb, 'Template_Stock_Opname_Multi_Sheet.xlsx');
}

/**
 * Exports Multi-Sheet Excel workbook containing:
 * - Sheet Master_Assets
 * - Sheet Master_Kategori
 * - Sheet Master_Unit
 * - Sheet per SO Session (SO_2026_Q1, dll) with Petugas_SO and Tanggal_SO!
 */
export function exportAuditReportToExcel(assets: Asset[], sessions: SesiSO[], categories?: string[], units?: string[]) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet Master_Assets
  const masterRows = [
    [
      'ID Asset',
      'Nama Asset',
      'Kategori',
      'Jenis',
      'Unit Kerja',
      'PIC Master',
      'Tahun Beli',
      'Lokasi Barang',
      'Jumlah Asal',
      'Total Jumlah',
      'Kondisi Terakhir',
      'Baik',
      'Rusak Ringan',
      'Rusak Berat',
      'Hilang',
      'Musnah',
      'Petugas SO Terakhir',
      'Tanggal SO Terakhir',
    ],
    ...assets.map((a) => [
      a.ID_Asset,
      a.Nama_Asset,
      a.Kategori,
      a.Jenis,
      a.Unit_Kerja,
      a.Penanggung_Jawab,
      a.Tahun_Beli || '-',
      a.Lokasi || '-',
      a.Jumlah_Asal !== undefined ? a.Jumlah_Asal : a.Jumlah,
      a.Jumlah,
      a.Kondisi,
      a.Rincian_Kondisi?.Baik || 0,
      a.Rincian_Kondisi?.Rusak_Ringan || 0,
      a.Rincian_Kondisi?.Rusak_Berat || 0,
      a.Rincian_Kondisi?.Hilang || 0,
      a.Rincian_Kondisi?.Musnah || 0,
      a.Petugas_SO || '-',
      a.Tanggal_SO || '-',
    ]),
  ];
  const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Master_Assets');

  // 2. Sheet Master_Kategori
  const katList = categories && categories.length > 0 ? categories : Array.from(new Set(assets.map(a => a.Kategori).filter(Boolean)));
  const katRows = [['Nama_Kategori'], ...katList.map(k => [k])];
  const wsKat = XLSX.utils.aoa_to_sheet(katRows);
  XLSX.utils.book_append_sheet(wb, wsKat, 'Master_Kategori');

  // 3. Sheet Master_Unit
  const unitList = units && units.length > 0 ? units : Array.from(new Set(assets.map(a => a.Unit_Kerja).filter(Boolean)));
  const unitRows = [['Nama_Unit'], ...unitList.map(u => [u])];
  const wsUnit = XLSX.utils.aoa_to_sheet(unitRows);
  XLSX.utils.book_append_sheet(wb, wsUnit, 'Master_Unit');

  // 4. Sheet per SO Session (SO_2026_Q1, dll)
  sessions.forEach((s) => {
    const sheetName = s.Sheet_Name || `SO_${s.ID_Sesi.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const sessionAssets = assets.filter((a) => s.Target_Unit_Kerja === 'Semua' || a.Unit_Kerja === s.Target_Unit_Kerja);

    const sessionRows = [
      [
        'ID Asset',
        'Nama Asset',
        'Kategori',
        'Jenis',
        'Unit Kerja',
        'Tahun Beli',
        'Lokasi Barang',
        'Jumlah Asal',
        'Petugas SO (Auditor)',
        'Tanggal SO',
        'Status Audit',
        'Kondisi Utama',
        'Total Jumlah',
        'Baik',
        'Rusak Ringan',
        'Rusak Berat',
        'Hilang',
        'Musnah',
        'Catatan Audit',
      ],
      ...sessionAssets.map((a) => [
        a.ID_Asset,
        a.Nama_Asset,
        a.Kategori,
        a.Jenis,
        a.Unit_Kerja,
        a.Tahun_Beli || '-',
        a.Lokasi || '-',
        a.Jumlah_Asal !== undefined ? a.Jumlah_Asal : a.Jumlah,
        a.Petugas_SO || s.Petugas_Utama || 'Auditor',
        a.Tanggal_SO || '-',
        a.Status_Audit,
        a.Kondisi,
        a.Jumlah,
        a.Rincian_Kondisi?.Baik || 0,
        a.Rincian_Kondisi?.Rusak_Ringan || 0,
        a.Rincian_Kondisi?.Rusak_Berat || 0,
        a.Rincian_Kondisi?.Hilang || 0,
        a.Rincian_Kondisi?.Musnah || 0,
        a.Keterangan_SO || '-',
      ]),
    ];

    const wsSession = XLSX.utils.aoa_to_sheet(sessionRows);
    XLSX.utils.book_append_sheet(wb, wsSession, sheetName.substring(0, 30));
  });

  // 5. Sheet Sesi_SO List
  const sessionListRows = [
    ['ID Sesi', 'Nama Sesi', 'Sheet Name', 'Tanggal Mulai', 'Target Unit Kerja', 'Petugas Utama', 'Status Sesi'],
    ...sessions.map((s) => [s.ID_Sesi, s.Nama_Sesi, s.Sheet_Name || s.ID_Sesi, s.Tanggal_Mulai, s.Target_Unit_Kerja, s.Petugas_Utama, s.Status_Sesi]),
  ];
  const wsSessionList = XLSX.utils.aoa_to_sheet(sessionListRows);
  XLSX.utils.book_append_sheet(wb, wsSessionList, 'Daftar_Sesi_SO');

  const now = new Date().toISOString().substring(0, 10);
  XLSX.writeFile(wb, `Laporan_Stock_Opname_MultiTab_${now}.xlsx`);
}

/**
 * Parses an uploaded Excel (.xlsx, .csv) file
 */
export async function parseUploadedExcel(file: File): Promise<{
  assets: Asset[];
  sessions?: SesiSO[];
  units?: string[];
  categories?: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        let parsedAssets: Asset[] = [];
        let parsedSessions: SesiSO[] = [];
        let parsedCategories: string[] = [];
        let parsedUnits: string[] = [];

        // Sheet Master / Assets
        const sheetAssetsName = workbook.SheetNames.find((s) =>
          s.toLowerCase().includes('asset') || s.toLowerCase().includes('master') || s.toLowerCase().includes('sheet1')
        ) || workbook.SheetNames[0];

        if (sheetAssetsName) {
          const wsAssets = workbook.Sheets[sheetAssetsName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(wsAssets, { defval: '' });

          const seenIds = new Map<string, number>();

          parsedAssets = rawRows.map((row, idx) => {
            let baseId = String(
              row.ID_Asset || row.Kode_Asset || row['ID Asset'] || row.ID || `AST-${100 + idx}`
            ).trim();

            if (!baseId) {
              baseId = `AST-${100 + idx}`;
            }

            const count = seenIds.get(baseId) || 0;
            seenIds.set(baseId, count + 1);
            const idAsset = count === 0 ? baseId : `${baseId}-${count + 1}`;

            const namaAsset = row.Nama_Asset || row['Nama Asset'] || row.Nama_Barang || row.Nama || 'Barang Tanpa Nama';
            const kategori = row.Kategori || 'Peralatan';
            const jenis = row.Jenis || row.Tipe || 'Umum';
            const pic = row.Penanggung_Jawab || row['PIC Master'] || row.PIC || '-';
            const unit = row.Unit_Kerja || row['Unit Kerja'] || row.Unit || 'Nursery Ciminyak';
            const petugas = row.Petugas_SO || row['Petugas SO'] || row.Auditor || 'Petugas SO';
            
            const tahunBeli = row.Tahun_Beli || row['Tahun Beli'] || row.Tahun || '';
            const lokasi = row.Lokasi || row['Lokasi Barang'] || row.Ruangan || '';
            const totalJml = Number(row.Jumlah || row['Total Jumlah']) || 1;
            const jumlahAsal = row.Jumlah_Asal !== undefined && row.Jumlah_Asal !== ''
              ? Number(row.Jumlah_Asal || row['Jumlah Asal'])
              : totalJml;

            const baik = Number(row.Jml_Baik || row.Baik) || (row.Kondisi === 'Baik' ? totalJml : 0);
            const rr = Number(row.Jml_Rusak_Ringan || row['Rusak Ringan']) || (row.Kondisi === 'Rusak Ringan' ? totalJml : 0);
            const rb = Number(row.Jml_Rusak_Berat || row['Rusak Berat']) || (row.Kondisi === 'Rusak Berat' ? totalJml : 0);
            const hilang = Number(row.Jml_Hilang || row.Hilang) || (row.Kondisi === 'Hilang' ? totalJml : 0);
            const musnah = Number(row.Jml_Musnah || row.Musnah) || (row.Kondisi === 'Musnah' ? totalJml : 0);

            const calculatedTotal = baik + rr + rb + hilang + musnah || totalJml;
            const isAudited = Boolean(row.Tanggal_SO || row.Status_Audit === 'Sudah SO');

            return {
              ID_Asset: idAsset,
              Nama_Asset: String(namaAsset),
              Kategori: String(kategori),
              Jenis: String(jenis),
              Penanggung_Jawab: String(pic),
              Unit_Kerja: String(unit),
              Tahun_Beli: tahunBeli ? String(tahunBeli) : undefined,
              Lokasi: lokasi ? String(lokasi) : undefined,
              Jumlah_Asal: jumlahAsal,
              Jumlah: calculatedTotal,
              Kondisi: row.Kondisi || row.Kondisi_Terakhir || 'Baik',
              Rincian_Kondisi: { Baik: baik, Rusak_Ringan: rr, Rusak_Berat: rb, Hilang: hilang, Musnah: musnah },
              Petugas_SO: String(petugas),
              Keterangan_SO: String(row.Keterangan_SO || row.Catatan || ''),
              Tanggal_SO: String(row.Tanggal_SO || ''),
              Sesi_SO_Terakhir: String(row.Sesi_SO_Terakhir || 'SESI-IMPORT'),
              Status_Audit: isAudited ? 'Sudah SO' : 'Belum SO',
            };
          });
        }

        // Sheet Master_Kategori
        const sheetKatName = workbook.SheetNames.find((s) => s.toLowerCase().includes('kategori'));
        if (sheetKatName) {
          const wsKat = workbook.Sheets[sheetKatName];
          const rawKatRows: any[] = XLSX.utils.sheet_to_json(wsKat, { defval: '' });
          parsedCategories = rawKatRows
            .map((r) => String(r.Nama_Kategori || r.Kategori || '').trim())
            .filter(Boolean);
        }

        // Sheet Master_Unit
        const sheetUnitName = workbook.SheetNames.find((s) => s.toLowerCase().includes('unit'));
        if (sheetUnitName) {
          const wsUnit = workbook.Sheets[sheetUnitName];
          const rawUnitRows: any[] = XLSX.utils.sheet_to_json(wsUnit, { defval: '' });
          parsedUnits = rawUnitRows
            .map((r) => String(r.Nama_Unit || r.Nama_Unit_Kerja || r.Unit_Kerja || r.Unit || '').trim())
            .filter(Boolean);
        }

        // Sheet Sesi_SO
        const sheetSesiName = workbook.SheetNames.find((s) => s.toLowerCase().includes('sesi'));
        if (sheetSesiName) {
          const wsSesi = workbook.Sheets[sheetSesiName];
          const rawSesiRows: any[] = XLSX.utils.sheet_to_json(wsSesi, { defval: '' });
          parsedSessions = rawSesiRows.map((r, idx) => ({
            ID_Sesi: String(r.ID_Sesi || `SESI-IMPORT-${idx + 1}`),
            Nama_Sesi: String(r.Nama_Sesi || 'Sesi Hasil Import Excel'),
            Sheet_Name: String(r.Sheet_Name || `SO_IMPORT_${idx + 1}`),
            Tanggal_Mulai: String(r.Tanggal_Mulai || new Date().toISOString().substring(0, 10)),
            Target_Unit_Kerja: String(r.Target_Unit_Kerja || 'Semua'),
            Petugas_Utama: String(r.Petugas_Utama || 'Auditor Import'),
            Status_Sesi: r.Status_Sesi === 'Selesai' ? 'Selesai' : 'Aktif',
          }));
        }

        resolve({
          assets: parsedAssets,
          sessions: parsedSessions.length > 0 ? parsedSessions : undefined,
          categories: parsedCategories.length > 0 ? parsedCategories : undefined,
          units: parsedUnits.length > 0 ? parsedUnits : undefined,
        });
      } catch (err) {
        reject(new Error('Gagal membaca file Excel Multi-Sheet.'));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membuka file Excel.'));
    reader.readAsArrayBuffer(file);
  });
}

