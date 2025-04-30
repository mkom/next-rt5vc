export function formatPeriod(dates) {
    if (!Array.isArray(dates) || dates.length === 0) {
        return "Format data tidak valid.";
    }

    // Fungsi untuk mendapatkan nama bulan
    const getMonthName = (monthNumber) => {
        const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ];
        return monthNames[parseInt(monthNumber, 10) - 1];
    };

    if (dates.length === 1) {
        const [year, month] = dates[0].split("-");
        return `Periode ${getMonthName(month)} ${year}`;
    }

    // Ambil bulan pertama dan bulan terakhir
    const [startDate, endDate] = [dates[0], dates[dates.length - 1]]; // Ambil bulan pertama dan terakhir

    const [startYear, startMonth] = startDate.split("-");
    const [endYear, endMonth] = endDate.split("-");

    // Format teks hasil
    return `Periode ${getMonthName(startMonth)} ${startYear} s/d ${getMonthName(endMonth)} ${endYear}`;
}
  