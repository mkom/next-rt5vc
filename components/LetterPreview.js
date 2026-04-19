import React, { useRef } from "react";
import { useEffect,useState,useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';
moment.locale('id');
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';

function LetterPreview({data}){
    //console.log(data);
    const printRef = useRef();
    const unit = data;

    const [letterNumber, setLetterNumber] = useState('');

    const formatRupiah = (angka) =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(angka)

    const today = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    useEffect(() => {
        const fetchLetterNumber = async () => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/letter`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              house_id: unit.house_id,
              resident_name: unit.resident_name,
              periods: unit.periods,
              total_fee: unit.total_fee,
            }),
          });
          const data = await response.json();
          if (data.success) {
            setLetterNumber(data.letter_number);
          }
        };
    
        fetchLetterNumber();
    }, [unit]);

    const generatePDF = async (mode = "preview") => {
        const element = printRef.current;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    // Override problematic CSS colors (oklch) with hex colors
                    const allElements = clonedDoc.querySelectorAll('*');
                    allElements.forEach(el => {
                        const computedStyle = window.getComputedStyle(el);
                        const color = computedStyle.color;
                        const bgColor = computedStyle.backgroundColor;

                        // Override oklch colors or transparent text with solid black
                        if (color.includes('oklch') || color === 'rgba(0, 0, 0, 0)' || color === 'transparent') {
                            el.style.color = '#000000';
                        }
                        // Override oklch background colors
                        if (bgColor.includes('oklch')) {
                            el.style.backgroundColor = '#ffffff';
                        }
                    });
                }
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = pdf.internal.pageSize.getWidth();   // biasanya 210 mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // biasanya 297 mm

            // Hitung ukuran gambar di PDF dengan mempertahankan rasio
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
            const finalWidth = canvas.width * ratio;
            const finalHeight = canvas.height * ratio;

            // Hitung posisi agar berada di tengah halaman
            const marginX = (pdfWidth - finalWidth) / 2;
            const marginY = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, "PNG", marginX, marginY, finalWidth, finalHeight);

            if (mode === "preview") {
                const blob = pdf.output("blob");
                const url = URL.createObjectURL(blob);
                window.open(url);
            } else {
                pdf.save(`Surat-Tagihan-${unit.house_id}.pdf`);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal generate PDF. Silakan coba lagi.');
        }
    };
      
      
    
    return (
        <>
            <div className="flex justify-center gap-4 mt-10">
                <button
                    onClick={() => generatePDF("preview")}
                    className="btn btn-primary btn-sm"
                >
                    Preview PDF
                </button>
                <button
                    onClick={() => generatePDF("download")}
                    className="btn btn-success btn-sm"
                >
                    Download PDF
                </button>
                </div>


            <div ref={printRef} className="p-6 mb-10 bg-white text-black max-w-screen-lg mx-auto text-sm" style={{ color: '#000000', backgroundColor: '#ffffff' }}>
                <header className="border-b-4 pb-4 mb-8 flex items-center justify-around gap-4 md:gap-12">
                    <div className=" w-[130px]">
                        <Image src="/images/rt005.png" className="w-full h-auto" width={130} height={100} alt="RT 005 Logo"/>
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold uppercase">Rukun Tetangga 005 Rukun Warga 011</h1>
                        <h2 className="text-2xl font-extrabold uppercase mb-3">Villa Citayam</h2>
                        <p className="text-base">Kelurahan Susukan, Kecamatan Bojonggede, Kabupaten Bogor, Kode Pos 16929</p>
                    </div>
                </header>
                <div className="flex items-start justify-between mb-10">
                    <div>
                    <p className="text-base">Nomor: {letterNumber}</p>
                    <p className="text-base">Hal: Surat teguran dan penagihan Iuran warga</p>
                    </div>
                    <div>
                    <p className="text-base">{today}</p>
                    </div>
                    </div>
                    <p className="mb-1 text-base font-semibold ">Kepada Yth,</p>
                    <p className="mb-4 text-base font-semibold">
                        Penghuni No rumah {unit.house_id}<br />
                        Bapak/Ibu: {unit.resident_name}<br />
                    </p>
                    <p className="mb-4 text-base font-semibold "> Di Tempat</p>
                    <p className="text-base">Dengan hormat,</p>
                    <p className="mb-6 text-base">
                        Melalui surat ini, kami bermaksud memberitahukan Bapak/Ibu mengenai kewajiban pembayaran iuran <strong> IPL RT 005</strong> yang sampai saat ini tercatat belum diselesaikan. Berdasarkan data kami, iuran yang belum dilunasi adalah sebagai berikut:
                    </p>
                    <table className="w-full border border-gray-400 text-sm mb-6">
                        <thead>
                        <tr className="bg-gray-100">
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }} className="border p-2 text-left w-4">No</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }} className="border p-2 text-left w-[80%]">Periode</th>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }} className="border p-2 text-right">Jumlah</th>
                        </tr>
                        </thead>
                        <tbody>
                        {unit.periods?.map((item, i) => (
                            <tr key={i}>
                            <td className="border p-2">{i + 1}</td>
                            <td className="border p-2">{moment(item, 'YYYY-MM').format('MMMM YYYY')}</td>
                            <td className="border p-2 text-right">
                                {formatRupiah(70000)}
                            </td>
                            </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                            <td className="border p-2 text-right" colSpan={2}>
                            Total Tagihan
                            </td>
                            <td className="border p-2 text-right">
                                {formatRupiah(unit.total_fee)}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                <div>
                    <p className="mb-2 text-base">Pembayaran dapat dilakukan melalui:</p>
                    <p className="mb-4 text-base">
                    <strong> Transfer bank ke rekening:</strong><br />
                    Bank: BCA<br />
                    No. Rekening: 4210541557<br />
                    Atas Nama: Hamka<br /><br />
                    <strong>Pembayaran tunai kepada:</strong><br />
                    Nama: Muhammad Komar<br />
                    No. HP/WA: 081717889797<br />
                    </p>
                
                    <p className="mb-4 text-base">
                    Mohon untuk dapat melakukan pembayaran pelunasan sebelum tanggal 15 bulan berjalan. Setelah melakukan pembayaran, mohon segera melakukan konfirmasi dengan mengirimkan bukti transfer melalui WhatsApp ke nomor di atas atau mengisi formulir konfirmasi secara online di https://rt5vc.vercel.app/confirmation.
                    </p>
                    <p className="mb-4 text-base">
                        Apabila Bapak/Ibu telah melakukan pembayaran sebelum menerima surat ini, mohon abaikan pemberitahuan ini. Kami ucapkan terima kasih atas perhatian dan kerja sama yang telah diberikan.
                    </p>
                    <p className="mb-2 text-base">Kami mengingatkan Bapak/Ibu bahwa iuran ini sangat penting untuk mendukung operasional dan pemeliharaan lingkungan seperti kebersihan, pengelolaan sampah, penerangan, dan keamanan wilayah kita bersama. Partisipasi aktif seluruh warga sangat kami harapkan demi kelangsungan dan kenyamanan bersama.
                    </p>
                    <p className="mb-4 text-base">
                    Demikian pemberitahuan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami mengucapkan terima kasih.
                    </p>
                </div>
                <div className="my-24 flex items-center justify-between">
                    <div>
                        <p className="mb-10 text-base font-semibold">Bendahara</p>
                        <p className=" text-base">Muhammad Komar</p>
                    </div>
                    <div>
                        <p className="mb-10 text-base font-semibold">Ketua RT</p>
                        <p className=" text-base">Donal Arianto</p>
                    </div>

                </div>
            </div>
        </>
        
    )
}
export default LetterPreview;