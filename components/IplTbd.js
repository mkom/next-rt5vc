import { getSession } from 'next-auth/react';
import React, { useRef } from "react";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import Link from 'next/link';
import { GrFormNextLink } from "react-icons/gr";
import moment from 'moment';
import { HiHome } from "react-icons/hi";
import { GrMoney } from "react-icons/gr";
import { formatCurrency } from '../utils/format';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

const Tbd = ({ initialHousesPaid }) => {
  const [loading, setLoading] = useState(true);
  const [dataOutStanding, setDataOutStanding] = useState(initialHousesPaid);
  const [totalHouses, setTotalHouses] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const printRef = useRef();

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const fetchOutstanding = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`);
      const sorted = res.data.data.sort((a, b) => b.total_fee - a.total_fee);
      setDataOutStanding(sorted);
      setTotalHouses(res.data.total);
      setTotalAmount(res.data.total_amount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching houses data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutstanding();
  }, [fetchOutstanding]);

  if (loading) return <Spinner />;

  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: 'Outstanding IPL RT 005 RW 011 Report ', style: 'header' },
        { text: `${formattedDate} ${formattedTime}`, style: 'content' },
        {
          columns: [
            { text: `Total Rumah: ${totalHouses}`, style: 'subheader' },
            { text: `Jumlah: ${formatCurrency(totalAmount)}`, style: 'subheader' },
          ],
        },
        {
          table: {
            widths: ['auto', 'auto', '*', 'auto', 'auto'],
            body: [
              ['No', 'No Rumah', 'Nama', 'Total', 'Jumlah'],
              ...dataOutStanding.map((data, index) => [
                offset + index + 1,
                data.house_id,
                data.resident_name,
                data.periods.length + ' bulan',
                { text: formatCurrency(data.total_fee), alignment: 'right' },
              ]),
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 5] },
        content: { fontSize: 12, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, italics: true, margin: [0, 0, 0, 10] },
      },
    };
    pdfMake.createPdf(docDefinition).download('Outstanding_IPL_Report.pdf');
  };

  return (
    <>
      <div ref={printRef}>
        <div className='flex my-6 items-center justify-between'>
          <h1 className='text-xl font-bold'>OUTSTANDING IPL</h1>
          <button onClick={generatePDF} className='btn btn-outline btn-primary btn-sm'>Download</button>
        </div>
        <div className='flex gap-2 md:gap-4 justify-start flex-row mb-4'>
          <div className='bg-base-100 border border-base-300 border-l-4 border-l-success w-1/2 py-2 px-4 flex flex-col gap-1 rounded-lg'>
            <h3 className='font-bold text-sm md:text-xl flex flex-col lg:flex-row items-start lg:items-center text-base-content'>
              <span className='flex'>
                <HiHome className="h-5 w-5 md:h-7 md:w-7 mr-1 lg:mr-2 text-success" />
                <span>Rumah</span>
              </span>
            </h3>
            <span className='font-semibold text-sm md:text-lg flex items-center text-success'>{totalHouses} Unit</span>
          </div>
          <div className='bg-base-100 border border-base-300 border-l-4 border-l-primary w-1/2 py-2 px-4 flex flex-col gap-1 rounded-lg'>
            <h3 className='font-bold text-sm md:text-xl flex items-start text-base-content'>
              <GrMoney className="h-5 w-5 md:h-7 md:w-7 mr-2 text-primary" />
              <span>Jumlah</span>
            </h3>
            <span className='font-semibold text-xs md:text-lg text-primary'>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-base-300 bg-base-100">
          <table className="table table-zebra table-sm w-full">
            <thead>
              <tr className="bg-base-200">
                <th className='p-2'>No</th>
                <th className='p-2 w-7 md:w-28'>No Rumah</th>
                <th className='p-2 w-7 md:w-28'>Nama</th>
                <th className='p-2'>Periode</th>
                <th className='p-2'>Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dataOutStanding && dataOutStanding.length > 0 && dataOutStanding[0] !== undefined ? (
                dataOutStanding.map((data, index) => (
                  <tr key={index}>
                    <td className='p-2 text-xs md:text-base'>{offset + index + 1}</td>
                    <td className='p-2 text-xs md:text-base'>{data.house_id}</td>
                    <td className='p-2 text-xs md:text-base'>{data.resident_name}</td>
                    <td className='p-2 text-xs md:text-base'>
                      <span className="flex flex-wrap gap-1">
                        {data.periods.map((period, subindex) => {
                          const status = data.monthly_status.find((s) => s.month === period)?.status;
                          const badgeClass = status === 'Weekend' ? 'badge-secondary' : 'badge-error';
                          return (
                            <span key={subindex} className={`badge ${badgeClass} badge-sm`}>
                              {moment(period, 'YYYY-MM').format('MMMM YYYY')}
                            </span>
                          );
                        })}
                      </span>
                    </td>
                    <td className='p-2 text-xs md:text-base'>{formatCurrency(data.total_fee)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">Data tidak tersedia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className='flex items-center justify-between mt-3'>
        <Link href="/ipl" className='btn btn-success btn-xs'>Data IPL<GrFormNextLink className='w-4 h-4' /></Link>
      </div>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`);
    return { props: { initialHousesPaid: res.data.data } };
  } catch (error) {
    console.error('Error fetching tra data:', error);
    return { props: { initialHousesPaid: [] } };
  }
};

export default Tbd;
