# Implementation Plan - Google Sheet Central Master Data Architecture

Membuat **Google Spreadsheet sebagai Single Source of Truth (Pusat Data Utama)** untuk seluruh data sistem inventaris, termasuk **Master Aset**, **Master Kategori**, **Master Unit Kerja**, **Daftar Sesi SO**, serta **Tab Sheet per Sesi Stock Opname**. Aplikasi web berfungsi sebagai *User Interface (UI) mobile-first* yang memudahkan input, audit, dan sinkronisasi data langsung ke Google Spreadsheet.

---

## 1. Arsitektur Multi-Tab Google Spreadsheet

Spreadsheet Google Sheet akan memiliki struktur tab berikut secara otomatis:
1. **`Master_Assets`**: Berisi seluruh database master barang/aset beserta kuantitas, lokasi, penanggung jawab, dan status kondisi terkini dari hasil SO terbaru.
2. **`Master_Kategori`**: Berisi daftar master kategori barang (contoh: *Peralatan*, *Perlengkapan*, *Habis Pakai*, *Elektronik*, *Kendaraan*, dll.).
3. **`Master_Unit`**: Berisi daftar master unit kerja / lokasi (contoh: *Nursery Ciminyak*, *Office Ciminyak*, *Gudang Utama*, *Laboratorium*, dll.).
4. **`Daftar_Sesi`**: Berisi log riwayat sesi Stock Opname (ID Sesi, Nama Sesi, Sheet Name, Tanggal Mulai, Target Unit, Petugas Utama, Status).
5. **`SO_[ID_Sesi]`** (misal `SO_SESI_001`): Sheet khusus per sesi SO yang otomatis menyalin data master barang dan menyimpan catatan hasil audit kondisi fisik per unit (`Baik`, `Rusak Ringan`, `Rusak Berat`, `Hilang`, `Musnah`) serta `Petugas_SO` & `Tanggal_SO`.

---

## 2. Alur Kerja Sinkronisasi Dual-Arah (Google Sheet <-> Web App)

```
[Google Spreadsheet Backend]
   ├── Tab Master_Assets
   ├── Tab Master_Kategori  <--- (Otomatis Tambah jika ada Kategori Baru)
   ├── Tab Master_Unit      <--- (Otomatis Tambah jika ada Unit Baru)
   ├── Tab Daftar_Sesi
   └── Tab SO_[ID_Sesi]
           ▲
           │ (Apps Script Web API JSON & Auto Sync)
           ▼
[Web App Mobile-First Interface]
   ├── Dashboard KPI & Progres Audit
   ├── Tab Audit Barang (Dropdown Filter Kategori & Unit dari Sheet Master)
   ├── Tab Kelola Master Data (Tambah Aset, Kategori, Unit, Sesi SO)
   └── Ekspor & Impor Excel Multi-Sheet (Termasuk Sheet Kategori & Unit)
```

---

## 3. Tahapan Implementasi Terperinci

### Tahap 1: Pembaruan `Code.gs` (Google Apps Script Backend)
- **Fungsi `setupDatabase()`**: Otomatis membuat 5 tab sheet awal jika belum ada (`Master_Assets`, `Master_Kategori`, `Master_Unit`, `Daftar_Sesi`, `SO_SESI_001`).
- **Pembersihan Data & Ekstraksi Master Kategori/Unit**:
  - Saat `doGet` dipanggil, GAS mengembalikan objek `assets`, `sessions`, `categories`, dan `units`.
  - Jika ada Kategori atau Unit Kerja baru saat memasukkan aset baru via `addAssetInternal()`, GAS akan otomatis memeriksa dan menambahkan entri ke tab `Master_Kategori` dan `Master_Unit` jika belum terdaftar.
- **Auto Update Tab Sesi & Master**:
  - Setiap kali audit disimpan via `updateStockOpnameInternal()`, data tersimpan di tab Sesi SO aktif dan otomatis meng-update ringkasan statistik kondisi pada tab `Master_Assets`.

### Tahap 2: Pembaruan Tipe Data & API Service (`types.ts` & `apiService.ts`)
- Memperbarui `InitialDataResponse` untuk mencakup:
  - `categories: string[]`
  - `units: string[]`
- Menambahkan fungsi pembaruan master kategori dan unit kerja secara mandiri atau otomatis saat penambahan aset.
- Menyediakan penanganan offline/localstorage yang selaras jika belum terhubung ke Google Sheet.

### Tahap 3: Pembaruan Layanan Excel (`excelService.ts`)
- Memperbarui generator **Template Excel Multi-Sheet** (`Template_Stock_Opname_Multi_Sheet.xlsx`) agar mencakup:
  - Sheet `Master_Assets`
  - Sheet `Master_Kategori`
  - Sheet `Master_Unit`
- Memperbarui fungsi **Impor Excel** untuk membaca daftar Kategori & Unit Kerja dari sheet khusus jika ada di file Excel.
- Memperbarui fungsi **Ekspor Laporan** agar menyertakan tab `Master_Kategori` & `Master_Unit`.

### Tahap 4: Pembaruan Antarmuka Pengguna (UI Web App)
- **Modal Google Apps Script Code (`CodeGsModal.tsx`)**:
  - Memperbarui salinan kode `Code.gs` dengan dukungan pembuatan 5 sheet master & auto-sync Kategori/Unit.
- **Tab Kelola (`ManageTab.tsx`)**:
  - Menambahkan sub-tab / kartu **Kelola Master Kategori & Unit Kerja** untuk melihat daftar master yang bersumber dari Google Sheet, serta form tambah Kategori / Unit Kerja baru.
- **Tab Audit (`AuditTab.tsx`) & Dashboard (`DashboardTab.tsx`)**:
  - Memastikan dropdown filter Kategori dan Unit Kerja menggunakan data master dinamis yang diperoleh dari Google Sheet (`categories` & `units`).

---

## 4. Rencana Pengujian & Verifikasi

1. **Lint & Build Verification**: Menjalankan `lint_applet` (`tsc --noEmit`) dan `compile_applet` untuk menjamin tidak ada kesalahan tipe data.
2. **Pengujian Kode Apps Script**: Memastikan modal penyalinan `Code.gs` menyajikan kode backend yang siap dipasang di Google Apps Script editor.
3. **Pengujian Template Excel**: Menjamin file template yang diunduh mencakup sheet Kategori & Unit Kerja.
4. **Pengujian Form & Dropdown**: Memastikan pengisian Kategori atau Unit baru otomatis terefleksi pada data master.
