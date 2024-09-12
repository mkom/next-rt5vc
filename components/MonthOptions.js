// components/MonthOptions.js
import moment from 'moment';
const MonthOptions = (monthly) => {
  const startYear = 2024;
  const endYear = moment().year();
  const currentMonth = moment().month();


 // console.log(monthly)

 const options = [];

  for (let year = startYear; year <= endYear; year++) {
    let startMonth;
    if (year === startYear) {
      startMonth = 6; // July
    } else {
      startMonth = 0; // January
    }
    const endMonth = year === endYear ? currentMonth : 11; // December

    for (let month = startMonth; month <= endMonth; month++) {
      const date = moment().month(month).year(year);
      options.push({
        value: date.format("YYYY-MM"),
        label: date.format("MMMM YYYY")
      });
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