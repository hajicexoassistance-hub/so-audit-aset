/**
 * Formats ISO or YYYY-MM-DD date strings into human-readable Indonesian format
 * Example: '2026-11-04' -> 'Rabu, 4 Nov 2026'
 * Example: '2026-11-03T17:00:00.000Z' -> 'Rabu, 4 Nov 2026 00:00'
 */
export function formatDateIndonesian(dateStr?: string | null): string {
  if (!dateStr || dateStr === '-' || dateStr === 'Sebelumnya') return dateStr || '-';

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

  try {
    const trimmed = String(dateStr).trim();

    // Check simple YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      const monthName = months[m - 1];
      return `${dayName}, ${d} ${monthName} ${y}`;
    }

    // Check YYYY-MM-DD HH:mm or HH:mm:ss
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(trimmed)) {
      const [datePart, timePart] = trimmed.split(/\s+/);
      const [y, m, d] = datePart.split('-').map(Number);
      const timeClean = timePart.substring(0, 5); // HH:mm
      const dateObj = new Date(y, m - 1, d);
      const dayName = days[dateObj.getDay()];
      const monthName = months[m - 1];
      return `${dayName}, ${d} ${monthName} ${y} jam ${timeClean}`;
    }

    // Standard Date parse for ISO string e.g. 2026-11-03T17:00:00.000Z
    const dObj = new Date(trimmed);
    if (!isNaN(dObj.getTime())) {
      const dayName = days[dObj.getDay()];
      const dateNum = dObj.getDate();
      const monthName = months[dObj.getMonth()];
      const year = dObj.getFullYear();
      const hours = String(dObj.getHours()).padStart(2, '0');
      const mins = String(dObj.getMinutes()).padStart(2, '0');

      if (trimmed.includes('T') || trimmed.includes(':')) {
        return `${dayName}, ${dateNum} ${monthName} ${year} ${hours}:${mins}`;
      }
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    }

    return dateStr;
  } catch {
    return dateStr;
  }
}
