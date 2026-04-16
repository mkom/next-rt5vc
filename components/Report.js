// pages/home.js
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { IoChevronDownSharp, IoChevronUpSharp } from "react-icons/io5";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { HiArrowRight } from "react-icons/hi";

import Select from 'react-select';
import moment from 'moment';
import MonthOptions from './MonthOptions';
import Link from 'next/link';
import { formatPeriod } from './FormatPeriod';
import { formatCurrency, formatDate } from '../utils/format';
import { selectStyles } from '../utils/selectStyles';

const Report = ({ initialTransaction }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState(initialTransaction ?? {});
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalOutstandingOverall, setTotalOutstandingOverall] = useState(0);
  const [totalIplPaguyuban, setTotalIplPaguyuban] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(moment().format('YYYY-MM'));
  const [totalIncomePeriod, setTotalIncomePeriod] = useState(0);
  const [totalExpensePeriod, setTotalExpensePeriod] = useState(0);
  const [opening_balance, setOpening_balance] = useState(0);
  const [expandedRows, setExpandedRows] = useState(null);
  const [skeleten, setSkeleton] = useState(true);

  const [relatedMonths, setRelatedMonths] = useState({
    value: moment().format('YYYY-MM'),
    label: moment().format('MMMM YYYY')
  });

  const handleMonthChange = (selectedOption) => {
    setSelectedPeriod(selectedOption.value);
    setSkeleton(true);
  };

  useEffect(() => {
    const currentMonthOption = MonthOptions().find(
      (option) => option.value === moment().format('YYYY-MM')
    );
    setRelatedMonths(currentMonthOption);
  }, []);

  const fetchReport = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/report/`, {
        params: { period: selectedPeriod }
      });
      const dataRes = res.data.data;
      setTotalBalance(dataRes.balance.final_balance);
      setTotalIncome(dataRes.balance.total_income);
      setTotalExpense(dataRes.balance.total_expense);

      const monthData = dataRes.monthlyData?.[0]?.[0] ?? {};
      setTotalIncomePeriod(monthData.income || 0);
      setTotalExpensePeriod(monthData.expense || 0);
      setOpening_balance(monthData.opening_balance || 0);

      setTransactions(dataRes.transactions);
      setSkeleton(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Transaction data:', error);
      setLoading(false);
      setSkeleton(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReport();
  }, [selectedPeriod, fetchReport]);

  const fetchOutstanding = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, {});
      setTotalOutstandingOverall(res.data.total_amount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching houses data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutstanding();
  }, [fetchOutstanding]);

  const handleExpandRow = (index) => {
    setExpandedRows(expandedRows === index ? null : index);
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Ramping Global Summary (Horizontal Scrollable or Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10">
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Saldo Akhir</p>
          <p className="text-sm md:text-base font-extrabold text-primary">{formatCurrency(totalBalance - totalIplPaguyuban)}</p>
        </div>
        <div className="bg-success/5 rounded-2xl p-3 border border-success/10">
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Pemasukan</p>
          <p className="text-sm md:text-base font-extrabold text-success">{formatCurrency(totalIncome - totalIplPaguyuban)}</p>
        </div>
        <div className="bg-error/5 rounded-2xl p-3 border border-error/10">
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Pengeluaran</p>
          <p className="text-sm md:text-base font-extrabold text-error">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-warning/5 rounded-2xl p-3 border border-warning/10">
          <p className="text-[10px] text-base-content/60 font-bold uppercase mb-0.5">Tunggakan</p>
          <p className="text-sm md:text-base font-extrabold text-warning">{formatCurrency(totalOutstandingOverall)}</p>
        </div>
      </div>

      <div className="divider my-0"></div>

      {/* 2. Filter & Period Summary */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-1/2">
            <Select
              id="relatedMonths"
              options={MonthOptions()}
              value={MonthOptions().find(option => option.value === selectedPeriod)}
              onChange={handleMonthChange}
              isSearchable={false}
              placeholder="Pilih bulan"
              className="rounded-xl text-sm font-medium"
              styles={selectStyles}
            />
          </div>
          
          {!skeleten && (
             <div className="flex gap-4 items-center justify-between sm:justify-end px-2">
               <div className="text-left">
                 <p className="text-[10px] text-base-content/50 uppercase font-bold">Masuk (Bln Ini)</p>
                 <p className="text-xs font-bold text-success">{formatCurrency(totalIncomePeriod)}</p>
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-base-content/50 uppercase font-bold">Keluar (Bln Ini)</p>
                 <p className="text-xs font-bold text-error">{formatCurrency(totalExpensePeriod)}</p>
               </div>
             </div>
          )}
        </div>

        {/* 3. Transaction List (Mobile App Style) */}
        {skeleten ? (
          <div className="animate-pulse flex flex-col gap-3 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                  <div>
                    <div className="h-3 w-24 bg-base-300 rounded mb-2"></div>
                    <div className="h-2 w-16 bg-base-300 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-base-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col mt-2">
            
            {/* Opening Balance */}
            <div className="flex items-center justify-between py-3 border-b border-base-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                  <MdOutlineAccountBalanceWallet className="w-5 h-5 text-base-content/50" />
                </div>
                <div>
                  <p className="text-sm font-bold text-base-content">Saldo Awal</p>
                  <p className="text-[11px] text-base-content/50">Bawaan bulan lalu</p>
                </div>
              </div>
              <p className="text-sm font-bold text-base-content">{formatCurrency(opening_balance)}</p>
            </div>

            {/* Income: IPL */}
            {transactions?.ipl?.length > 0 && (
              <div className="border-b border-base-200">
                <div 
                  className="flex items-center justify-between py-3 cursor-pointer active:bg-base-200/50 transition-colors"
                  onClick={() => handleExpandRow('ipl')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <FaRegArrowAltCircleDown className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-base-content">Pemasukan IPL</p>
                      <p className="text-[11px] text-base-content/50">Iuran Warga Bulanan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-success">+{formatCurrency(transactions.totalIpl)}</p>
                    <div className="text-base-content/40">{expandedRows === 'ipl' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</div>
                  </div>
                </div>
                
                {/* Expanded IPL Details */}
                <div className={`overflow-hidden transition-all duration-300 ${expandedRows === 'ipl' ? 'max-h-[1000px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-14 pr-2 flex flex-col gap-3 pt-1">
                    {(() => {
                      const groupedByPeriod = {};
                      transactions.ipl.forEach(transaction => {
                        const amountPerMonth = transaction.amount / transaction.related_months.length;
                        transaction.related_months.forEach(period => {
                          if (!groupedByPeriod[period]) {
                            groupedByPeriod[period] = { total: 0, latestDate: null, count: 0 };
                          }
                          groupedByPeriod[period].count += 1;
                          groupedByPeriod[period].total += amountPerMonth;
                          const tDate = new Date(transaction.date);
                          if (!groupedByPeriod[period].latestDate || tDate > groupedByPeriod[period].latestDate) {
                            groupedByPeriod[period].latestDate = tDate;
                          }
                        });
                      });
                      const sortedPeriods = Object.keys(groupedByPeriod).sort((a, b) => new Date(a + '-01') - new Date(b + '-01'));
                      return sortedPeriods.map((period, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-semibold text-base-content/80">IPL {formatPeriod([period])}</p>
                            <p className="text-[10px] text-base-content/50">{groupedByPeriod[period].count} Warga</p>
                          </div>
                          <p className="text-xs font-medium text-success">{formatCurrency(groupedByPeriod[period].total)}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Expenses Mapping */}
            {[
              { id: 'OutRutin', label: 'Pengeluaran Rutin', data: transactions?.OutRutin, total: transactions?.totalOutRutin },
              { id: 'OutFasum', label: 'Fasilitas Umum', data: transactions?.OutFasum, total: transactions?.totalOutFasum },
              { id: 'OutFasos', label: 'Fasilitas Sosial', data: transactions?.OutFasos, total: transactions?.totalOutFasos },
              { id: 'OutOther', label: 'Lain-lain', data: transactions?.OutOther, total: transactions?.totalOutOther }
            ].map(category => category.data?.length > 0 && (
              <div key={category.id} className="border-b border-base-200">
                <div 
                  className="flex items-center justify-between py-3 cursor-pointer active:bg-base-200/50 transition-colors"
                  onClick={() => handleExpandRow(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                      <FaRegArrowAltCircleUp className="w-5 h-5 text-error" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-base-content">{category.label}</p>
                      <p className="text-[11px] text-base-content/50">{category.data.length} Transaksi</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-error">-{formatCurrency(category.total)}</p>
                    <div className="text-base-content/40">{expandedRows === category.id ? <IoChevronUpSharp /> : <IoChevronDownSharp />}</div>
                  </div>
                </div>
                
                {/* Expanded Details */}
                <div className={`overflow-hidden transition-all duration-300 ${expandedRows === category.id ? 'max-h-[1000px] opacity-100 mb-3' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-14 pr-2 flex flex-col gap-3 pt-1">
                    {category.data.map((t, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex-1 pr-4">
                          <p className="text-xs font-semibold text-base-content/80 line-clamp-2 leading-tight">{t.description}</p>
                          <p className="text-[10px] text-base-content/50 mt-0.5">{formatDate(t.date)}</p>
                        </div>
                        <p className="text-xs font-medium text-error shrink-0">{formatCurrency(t.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Link href={`/cashflow?period=${selectedPeriod}`} className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-base-200 text-base-content font-bold text-sm rounded-xl active:scale-95 transition-transform">
              Lihat Rincian Penuh
              <HiArrowRight className="w-4 h-4" />
            </Link>

          </div>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async (context) => {
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/all`);
    return { props: { initialTransaction: res.data.data } };
  } catch (error) {
    return { props: { initialTransaction: [] } };
  }
};

export default Report;
