import {useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState,useEffect} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
import id from "date-fns/locale/id";
moment.locale('id');

const FilterCashflow = ({ setTransactions, initialTransaction,initialStartDate,initialEndDate }) => {
    //const { data: session } = useSession();
    // const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [dateRange, setDateRange] = useState([initialStartDate, initialEndDate]);
    const [startDate, endDate] = dateRange;
    const router = useRouter();



    const handleDataRange = (update) => {
        setDateRange(update)

        if(update[0] === null && update[1] === null) {
            //console.log(initialTransaction)
            setTransactions(initialTransaction);
            const query = { ...router.query };
            delete query.startDate;
            delete query.endDate;
            router.push({
                pathname: '/cashflow',
                query: query,
            });
            
        } else {
            handleFilter(update[0], update[1]);
            const startDate = moment(update[0]).format('YYYY-MM-DD');
            const endDate = moment(update[1]).format('YYYY-MM-DD');
            router.push({
                pathname: '/cashflow',
                query: { ...router.query, startDate: `${startDate}`, endDate:`${endDate}` },
            });
        }
    } 

    const handleFilter = async (startDate,endDate) => {
       
        try {
            const startDateAdjusted = new Date(startDate);
            startDateAdjusted.setDate(startDateAdjusted.getDate());
            const endDateAdjusted = new Date(endDate);
            endDateAdjusted.setDate(endDateAdjusted.getDate() + 1);


            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/transactions/filter`, {
                // headers: {
                //     Authorization: `Bearer ${session.accessToken}`,
                // },
                params: {
                    startDate: startDateAdjusted,
                    endDate: endDateAdjusted,
                },
            });
            const transactionsData = response.data.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
              });
            
            setTransactions(transactionsData);
            
        } catch (error) {
            console.error('Error fetching filtered transactions:', error);
        }
    };

    useEffect(() => {
        if(router.query.startDate && router.query.endDate) {
            handleDataRange(dateRange);
        }
    }, [router.query.startDate, router.query.endDate]);

    return (
        <DatePicker
            locale={id}
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
                handleDataRange(update);
            }}
            placeholderText="Rentang Tanggal"
            dateFormat="dd/MM/YY"
            isClearable={true}
            className='block w-full text-sm text-gray-900  border-gray-300  rounded-md py-2 px-4  focus:border-cyan-500 focus:ring-cyan-500 bg-gray-50'
        />
    );
};

export default FilterCashflow;
