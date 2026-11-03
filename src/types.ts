export type ConditionType = 'Baik' | 'Rusak Ringan' | 'Rusak Berat' | 'Hilang' | 'Musnah';
export type StatusAuditType = 'Sudah SO' | 'Belum SO';

export interface RincianKondisi {
  Baik: number;
  Rusak_Ringan: number;
  Rusak_Berat: number;
  Hilang: number;
  Musnah: number;
}

export interface AuditSebelumnya {
  Kondisi: ConditionType;
  Jumlah: number;
  Rincian: RincianKondisi;
  Tanggal_SO: string;
  Petugas_SO: string;
  Keterangan_SO: string;
  Sesi_SO: string;
}

export interface Asset {
  ID_Asset: string;
  Nama_Asset: string;
  Kategori: string;
  Jenis: string;
  Penanggung_Jawab: string; // PIC Barang/Master
  Unit_Kerja: string;
  Tahun_Beli?: string | number; // Tahun Beli Barang
  Lokasi?: string; // Lokasi Barang / Ruangan
  Jumlah_Asal?: number; // Jumlah Stok Awal / Asal
  Jumlah: number;
  Kondisi: ConditionType;
  Rincian_Kondisi: RincianKondisi;
  Petugas_SO: string; // Nama Petugas/Auditor SO
  Keterangan_SO: string;
  Tanggal_SO: string;
  Sesi_SO_Terakhir: string;
  Status_Audit: StatusAuditType;
  Audit_Sebelumnya?: AuditSebelumnya;
}

export interface SesiSO {
  ID_Sesi: string;
  Nama_Sesi: string;
  Sheet_Name: string; // Nama Tab Sheet di Google Spreadsheet/Excel
  Tanggal_Mulai: string;
  Target_Unit_Kerja: string;
  Petugas_Utama: string; // Auditor Penanggung Jawab Sesi
  Status_Sesi: 'Aktif' | 'Selesai';
}

export interface InitialDataResponse {
  assets: Asset[];
  sessions: SesiSO[];
  categories?: string[];
  units?: string[];
}
