import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');

/**
 * Helper function untuk generate pesan WhatsApp penagihan IPL
 * @param {Object} data - Data tagihan
 * @param {string} data.house_id - ID rumah
 * @param {string} data.resident_name - Nama penghuni
 * @param {Array} data.periods - Array periode tagihan (format 'YYYY-MM')
 * @param {number} data.total_fee - Total tagihan
 * @returns {string} - Pesan WhatsApp yang sudah diformat
 */
export const generateWhatsAppMessage = (data) => {
    const formatRupiah = (angka) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);

    const today = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Generate periode list
    const periodeList = data.periods.map((period, index) => 
        `${index + 1}. ${moment(period, 'YYYY-MM').format('MMMM YYYY')} - ${formatRupiah(70000)}`
    ).join('\n');

    const whatsappMessage = `🏠 *TAGIHAN IPL RT 005 VILLA CITAYAM*

Kepada Yth,
*${data.resident_name}*
Rumah No: *${data.house_id}*

Dengan hormat, kami ingin mengingatkan mengenai kewajiban pembayaran IPL RT 005 yang belum diselesaikan:

📅 *RINCIAN TAGIHAN:*
${periodeList}

💰 *TOTAL TAGIHAN: ${formatRupiah(data.total_fee)}*

🏦 *PEMBAYARAN DAPAT DILAKUKAN MELALUI:*

*Transfer Bank:*
Bank: BCA
No. Rekening: 4210541557
A/n: Hamka

*Tunai kepada:*
Muhammad Komar
HP/WA: 081717889797

⏰ *Mohon pelunasan sebelum tanggal 15 bulan berjalan*

📱 *Konfirmasi pembayaran:*
- Kirim bukti transfer ke WA ini
- Online: https://rt5vc.vercel.app/confirmation

Iuran ini penting untuk mendukung kebersihan, keamanan, dan pemeliharaan lingkungan kita bersama.

Terima kasih atas kerja sama Bapak/Ibu.

---
RT 005 RW 011 Villa Citayam
${today}`;

    return whatsappMessage;
};

/**
 * Helper function untuk copy text ke clipboard
 * @param {string} text - Text yang akan dicopy
 * @returns {Promise} - Promise untuk handle success/error
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return { success: true, message: 'Berhasil disalin ke clipboard!' };
    } catch (err) {
        console.error('Gagal menyalin: ', err);
        return { success: false, message: 'Gagal menyalin ke clipboard' };
    }
};

/**
 * Helper function untuk membuka WhatsApp dengan pesan
 * @param {string} message - Pesan yang akan dikirim
 * @param {string} phoneNumber - Nomor HP (optional)
 * @param {string} platform - 'web' atau 'mobile' (default: 'web')
 */
export const openWhatsApp = (message, phoneNumber = '', platform = 'web') => {
    const encodedMessage = encodeURIComponent(message);
    
    // Format phone number if provided
    let formattedPhone = '';
    if (phoneNumber && phoneNumber.trim() !== '') {
        formattedPhone = formatPhoneNumber(phoneNumber);
    }
    
    let url;
    if (platform === 'web') {
        // Use WhatsApp Web URL directly
        url = formattedPhone 
            ? `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`
            : `https://web.whatsapp.com/send?text=${encodedMessage}`;
    } else {
        // Use wa.me for mobile app
        url = formattedPhone 
            ? `https://wa.me/${formattedPhone}?text=${encodedMessage}`
            : `https://wa.me/?text=${encodedMessage}`;
    }
    
    window.open(url, '_blank');
};

/**
 * Helper function untuk format nomor telepon Indonesia ke format WhatsApp
 * @param {string} phoneNumber - Nomor telepon
 * @returns {string} - Nomor telepon yang sudah diformat (628xxx)
 */
export const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If starts with 08, replace with 628
    if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.substring(1);
    }
    // If starts with 8, add 62
    else if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    }
    // If starts with +62, remove +
    else if (cleaned.startsWith('62')) {
        cleaned = cleaned;
    }
    // If starts with 0, replace with 62
    else if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }
    
    return cleaned;
};

/**
 * Helper function untuk format pesan WhatsApp yang lebih singkat
 * @param {Object} data - Data tagihan
 * @returns {string} - Pesan WhatsApp versi singkat
 */
export const generateShortWhatsAppMessage = (data) => {
    const formatRupiah = (angka) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(angka);

    const periodeCount = data.periods.length;
    const firstPeriod = moment(data.periods[0], 'YYYY-MM').format('MMMM YYYY');
    const lastPeriod = moment(data.periods[data.periods.length - 1], 'YYYY-MM').format('MMMM YYYY');

    const shortMessage = 
`*TAGIHAN IPL RT 005 VILLA CITAYAM*

Bapak/Ibu *${data.resident_name}* (No. ${data.house_id})
Mohon Maaf Sebelumnya, kami informasikan bahwa masih ada tunggakan IPL periode:
${firstPeriod}${periodeCount > 1 ? ` s/d ${lastPeriod}` : ''} (${periodeCount} bulan)
Total: *${formatRupiah(data.total_fee)}*

Pembayaran bisa melalui:
Transfer: BCA 4210541557 (Hamka)
Tunai: Muhammad Komar (081717889797)

Mohon dilunasi paling lambat tanggal 10 bulan berjalan. Jika belum dibayar setelah batas waktu, nama akan tercatat sebagai penunggak.
Apabila kesulitan melunasi sekaligus, pembayaran dapat dilakukan secara bertahap.

Konfirmasi pembayaran bisa kirim bukti transfer ke WA ini atau online di:
https://rt5vc.vercel.app/confirmation

Terima kasih atas kerja samanya 🙏`;

    return shortMessage;
};
