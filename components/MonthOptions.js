// components/MonthOptions.js
import moment from 'moment';
import axios from 'axios';
import { useState } from 'react';

const MonthOptions = (monthly) => {
  const startYear = 2024;
  const endYear = 2030;

 // console.log(monthly)

  const options = [];

  for (let year = startYear; year <= endYear; year++) {
    let startMonth = (year === startYear)? 6 : 0;
    let endMonth = 11;

    for (let month = startMonth; month <= endMonth; month++) {
      const value = moment().month(month).year(year).format("YYYY-MM");
      const label = moment().month(month).year(year).format("MMMM YYYY");
      options.push({ value, label });
    }
  }

  return options;
};

// const MonthOptions = () => {
//     const [houses, setHouses] = useState([]);
//     const options = [];
//     const fetchhouses = async () => {
//         try {
//           const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/fee`, {
//               headers: {
//                 Authorization: `Bearer ${session.accessToken}`,
//               }
//           });
        
//           setHouses(res.data.data);
//         } catch (error) {
//             console.error('Error fetching houses data:', error);
//         }
//       };

//       fetchhouses(); 
  
//     houses.forEach((house) => {
//       house.monthlyfee.forEach((monthly) => {
//         const value = moment(monthly.date).format("YYYY-MM");
//         const label = moment(monthly.date).format("MMMM YYYY");
//         options.push({ value, label });
//       });
//     });
  
//     return options;
// };

  
  
  export default MonthOptions;