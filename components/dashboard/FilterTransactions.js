import {useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState} from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import 'moment/locale/id';
import id from "date-fns/locale/id";
moment.locale('id');

const FilterTransactions = ({ setTransactions, initialTransaction }) => {
    //const { data: session } = useSession();
    // const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const router = useRouter();
    
    const handleDataRange = (update) => {
        setDateRange(update)

        if(update[0] === null && update[1] === null) {
            //console.log(initialTransaction)
            setTransactions(initialTransaction);
        } else {
           
            handleFilter(update[0], update[1]);
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
            const transactions =response.data.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
              });
            setTransactions(transactions);
        } catch (error) {
            console.error('Error fetching filtered transactions:', error);
        }
    };

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

export default FilterTransactions;
