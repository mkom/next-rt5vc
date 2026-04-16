const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

const API_URL = process.env.NEXT_PUBLIC_API_URL_V2 || 'https://data-rt5vc.vercel.app/api/v2';
const START_MONTH = '2024-07';
const OUTPUT_DIR = './debug-output';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const fetchAllHouses = async () => {
  console.log('Fetching IPL data from API...');
  const res = await axios.get(`${API_URL}/ipl`);
  return res.data.data || [];
};

const calculatePaymentStatus = (house) => {
  if (!house?.monthly_fees || !Array.isArray(house.monthly_fees)) {
    return { paidMonths: 0, balance: 0, lastPaidDate: null };
  }

  const paidMonths = house.monthly_fees
    .filter(f => f.status === 'Lunas' || f.status === 'TBD')
    .map(f => ({
      month: f.month,
      date: f.transaction_id?.date
    }))
    .sort((a, b) => new Date(b.month) - new Date(a.month));

  if (paidMonths.length === 0) {
    const allMonths = house.monthly_fees
      .map(f => f.month)
      .sort((a, b) => new Date(b) - new Date(a));
    
    return {
      paidMonths: 0,
      balance: allMonths.length > 0 ? -allMonths.length : 0,
      lastPaidDate: null,
      lastPaidMonth: null
    };
  }

  const sortedMonths = paidMonths.map(p => p.month).sort();
  const lastPaid = sortedMonths[sortedMonths.length - 1];
  const firstPaid = sortedMonths[0];

  const start = moment(START_MONTH, 'YYYY-MM');
  const current = moment();
  const lastPaidDate = moment(lastPaid, 'YYYY-MM');

  const monthsSinceStart = current.diff(start, 'months') + 1;
  const monthsPaid = sortedMonths.length;
  const balance = monthsPaid - monthsSinceStart;

  const lastTransaction = paidMonths.find(p => p.date)?.date || null;

  return {
    paidMonths,
    balance,
    lastPaidMonth: lastPaid,
    lastPaidDate: lastTransaction,
    firstPaidMonth: firstPaid,
    totalPaid: paidMonths.length
  };
};

const analyzePayments = (houses) => {
  console.log(`\nAnalyzing ${houses.length} houses...`);
  
  const results = {
    summary: {
      total: houses.length,
      advanced: 0,        // Lunas +3+ bulan
      current: 0,         // Lunas 0-2 bulan
      behind: 0,          // Tunggakan 1-3 bulan
      severeBehind: 0     // Tunggakan 3+ bulan
    },
    advanced: [],   // +3 bulan atau lebih
    current: [],    // -2 s/d +2 bulan
    behind: [],    // -3 bulan atau kurang
    all: []
  };

  for (const house of houses) {
    const status = calculatePaymentStatus(house);
    
    const record = {
      houseId: house.house_id,
      residentName: house.resident_name,
      balance: status.balance,
      lastPaidMonth: status.lastPaidMonth,
      lastPaidDate: status.lastPaidDate,
      firstPaidMonth: status.firstPaidMonth,
      totalPaid: status.totalPaid,
      category: status.balance >= 3 ? 'advanced' 
        : status.balance >= -2 ? 'current' 
        : 'behind'
    };

    results.all.push(record);

    if (status.balance >= 3) {
      results.advanced.push(record);
      results.summary.advanced++;
    } else if (status.balance >= -2) {
      results.current.push(record);
      results.summary.current++;
    } else {
      results.behind.push(record);
      results.summary.behind++;
      if (status.balance <= -3) {
        results.summary.severeBehind++;
      }
    }
  }

  return results;
};

const formatCSV = (records, headers) => {
  const headerRow = headers.join(',');
  const rows = records.map(r => headers.map(h => {
    const key = h.toLowerCase().replace(/([A-Z])/g, '_$1').toLowerCase();
    let val = r[key] ?? r[h] ?? '';
    return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
  }).join(','));
  return [headerRow, ...rows].join('\n');
};

const generateLogs = (results) => {
  ensureDir(OUTPUT_DIR);

  const timestamp = moment().format('YYYYMMDD_HHmmss');

  const allHeaders = ['houseId', 'residentName', 'balance', 'lastPaidMonth', 'lastPaidDate', 'firstPaidMonth', 'totalPaid', 'category'];
  const csvAll = formatCSV(results.all, allHeaders);
  fs.writeFileSync(`${OUTPUT_DIR}/all-payments_${timestamp}.csv`, csvAll);

  const advancedHeaders = ['houseId', 'residentName', 'balance', 'lastPaidMonth', 'lastPaidDate', 'totalPaid'];
  const csvAdvanced = formatCSV(results.advanced, advancedHeaders);
  fs.writeFileSync(`${OUTPUT_DIR}/advanced-paid_${timestamp}.csv`, csvAdvanced);

  const behindHeaders = ['houseId', 'residentName', 'balance', 'lastPaidMonth', 'lastPaidDate', 'firstPaidMonth', 'totalPaid'];
  const csvBehind = formatCSV(results.behind, behindHeaders);
  fs.writeFileSync(`${OUTPUT_DIR}/behind-payments_${timestamp}.csv`, csvBehind);

  const jsonOutput = {
    generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    period: {
      start: START_MONTH,
      current: moment().format('YYYY-MM')
    },
    summary: results.summary,
    advancedCustomers: results.advanced,
    behindCustomers: results.behind
  };
  fs.writeFileSync(`${OUTPUT_DIR}/payment-analysis_${timestamp}.json`, JSON.stringify(jsonOutput, null, 2));

  console.log('\n=== SUMMARY ===');
  console.log(`Total Customers: ${results.summary.total}`);
  console.log(`Advanced (Lunas +3+ bln): ${results.summary.advanced}`);
  console.log(`Current (Lunas -2 s/d +2 bln): ${results.summary.current}`);
  console.log(`Behind (Tunggakan): ${results.summary.behind}`);
  console.log(`  - Severe (3+ bln): ${results.summary.severeBehind}`);
  
  console.log('\n=== FILES GENERATED ===');
  console.log(`- ${OUTPUT_DIR}/all-payments_${timestamp}.csv`);
  console.log(`- ${OUTPUT_DIR}/advanced-paid_${timestamp}.csv`);
  console.log(`- ${OUTPUT_DIR}/behind-payments_${timestamp}.csv`);
  console.log(`- ${OUTPUT_DIR}/payment-analysis_${timestamp}.json`);

  return jsonOutput;
};

const main = async () => {
  try {
    console.log('=== IPL Payment Debug Script ===\n');
    console.log(`Start Month: ${START_MONTH}`);
    console.log(`Current: ${moment().format('YYYY-MM')}`);
    
    const houses = await fetchAllHouses();
    const results = analyzePayments(houses);
    generateLogs(results);
    
    console.log('\n=== DONE ===');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
};

main();