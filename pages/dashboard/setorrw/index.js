import { getSession, useSession } from 'next-auth/react';
import { useEffect,useState,useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useRequireAuth } from '../../../utils/authUtils.js'; 
import ReactPaginate from 'react-paginate';
import { IoPrism } from "react-icons/io5";
import {FaCalendarAlt, FaMoneyBill, FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";
import Header from '../../../components/Header';
import SideMenu from '../../../components/dashboard/Sidebar'
import { FaExchangeAlt } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import Select from 'react-select';
import moment from 'moment';
import 'moment/locale/id';
import id from "date-fns/locale/id";
moment.locale('id');

const SetorRw = ({  }) => {
    const { useAuthRedirectDashboard } = useRequireAuth(['admin', 'editor', 'superadmin']);
    useAuthRedirectDashboard();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    const [relatedMonths, setRelatedMonths] = useState([]);
    const [months, setMonths] = useState([]);
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [amount, setAmount] = useState('');

    const handleMonthChange = (selectedOptions) => {
      const months = selectedOptions.map(option => option.value);
      setMonths(months || []);
      setRelatedMonths(selectedOptions || []);
    };

    //console.log(months)

    const generateMonthsOptions = () => {
      //console.log(lastPaidIPl)
      const first = "2024-06";
  
        const options = [];
        let nextMonth = moment(first, "YYYY-MM").add(1, 'month'); 
        let startYear = nextMonth.year();
        let startMonthIndex = nextMonth.month(); 
        let endYear = startYear + 1; 
  
        
        for (let year = startYear; year <= endYear; year++) {
            for (let month = startMonthIndex; month < 12; month++) {
              const value = moment().month(month).year(year).format("YYYY-MM");
              const label = moment().month(month).year(year).format("MMMM YYYY");
              // Hanya tambahkan jika bulan belum dipilih
              if (!relatedMonths.some((m) => m.value === value)) {
                options.push({ value, label });
              }
              // options.push({ value, label });
            }
            startMonthIndex = 0; // Setelah tahun pertama, mulai lagi dari bulan Januari
        }
  
        //console.log(options)
        return options;
    };
  
   
  
  
    // if (loading) {
    //   return <Spinner />;
    // }
  
    return (
      <>
      
      <Header toggleSidebar={toggleSidebar}/>
      <SideMenu isOpen={isSidebarOpen}/>
      <main className='max-w-screen-md mx-auto min-h-dvh'>
        <div className='w-full'>
          <section className='mt-14 px-3 py-5  mb-11'>
          <h1 className='text-xl mb-4 font-semibold text-gray-900 sm:text-2xl dark:text-white'>Setor</h1>
            <Card className="w-full">
              <form className="flex flex-col gap-4">
                <div> 
                <Label htmlFor="relatedMonths" className="mb-2 block">Periode IPL</Label>
                <Select
                  id="relatedMonths"
                  isMulti
                  options={generateMonthsOptions()}
                  value={relatedMonths}
                  onChange={handleMonthChange}
                  placeholder="Pilih bulan"
                  className='bg-gray-50 text-sm z-50 !h-10'
                  isSearchable={false}
                />
                
                </div>
                <div className='flex gap-2' >
                  <div className='w-full'>
                    <Label htmlFor="paymentDate" className="mb-2 block">Tanggal Penarikan</Label>
                    <div className='flex items-center w-72 relative border border-gray-300 rounded-md shadow-sm '>
                    <FaCalendarAlt className="absolute h-5 w-5 left-2 z-10 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <DatePicker
                      locale={id}
                      id="paymentDate"
                      name="paymentDate"
                      selected={paymentDate}
                      onChange={(date) => setPaymentDate(date)}
                      dateFormat="dd MMMM yyyy"
                      calendarClassName="light-blue-stripes"
                      placeholderText="Pilih tanggal"
                      className="block w-full !h-10 pl-8 text-sm text-gray-900  border-gray-300 border-none rounded-md py-2 px-4 focus:ring-0 "
                    />
                    </div>
                  </div>
                  <div className='w-full'>
                    <Label htmlFor="amount" className="mb-2 block">Jumlah</Label>
                    <TextInput
                      id="amount"
                      name="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Masukkan jumlah"
                      className='bg-white'
                    />
                
                  </div>
                </div>
                <Button type="submit" className='mt-4 w-20'>Proses</Button>
              </form>
            </Card>
          </section>
          
        </div>
        
        
      </main>
      </>
    );
  }

  
  export default SetorRw;