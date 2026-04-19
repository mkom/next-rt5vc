import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import moment from 'moment';

/**
 * useDashboardData Hook
 *
 * Centralized data fetching and processing for the admin dashboard.
 * Fetches financial data, citizen demographics, and IPL metrics.
 *
 * @param {Object} options - Options object
 * @param {string} options.period - Selected period (YYYY-MM format)
 * @returns {Object} Dashboard data state and methods
 */
export const useDashboardData = ({ period } = {}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Raw data states
  const [reportData, setReportData] = useState(null);
  const [monthlyTrendsData, setMonthlyTrendsData] = useState([]); // Fetched individually for each month
  const [housesData, setHousesData] = useState([]);
  const [outstandingData, setOutstandingData] = useState({ data: [], total: 0, total_amount: 0 });

  const selectedPeriod = period || moment().format('YYYY-MM');

  /**
   * Fetch trend data for last 6 months individually
   * API /report/ without period only returns cumulative totals, not historical monthly data
   */
  const fetchTrendData = useCallback(async (headers) => {
    // Generate last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(moment().subtract(i, 'months').format('YYYY-MM'));
    }

    // Fetch data for each month in parallel
    const results = await Promise.all(
      months.map(month =>
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/report/`, {
          params: { period: month },
          headers,
        }).catch(err => {
          console.error(`Error fetching trend data for ${month}:`, err);
          return { data: { data: { monthlyData: [[{ month, income: 0, expense: 0 }]] } } };
        })
      )
    );

    // Process results
    return months.map((month, i) => {
      const monthlyData = results[i].data?.data?.monthlyData;
      let monthData = { month, income: 0, expense: 0 };

      if (monthlyData) {
        // Handle nested array structure: [[{month, income, expense}]]
        if (Array.isArray(monthlyData[0])) {
          const found = monthlyData[0].find(m => m.month === month);
          if (found) monthData = found;
        } else {
          // Handle flat array structure: [{month, income, expense}]
          const found = monthlyData.find(m => m.month === month);
          if (found) monthData = found;
        }
      }

      return {
        month: moment(month, 'YYYY-MM').format('MMM YYYY'),
        income: monthData.income || 0,
        expense: monthData.expense || 0,
        period: month,
      };
    });
  }, []);

  /**
   * Fetch all dashboard data in parallel
   */
  const fetchDashboardData = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${session.accessToken}` };

      // Fetch main data and trend data in parallel
      const [reportRes, trendResults, housesRes, outstandingRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/report/`, {
          params: { period: selectedPeriod },
          headers,
        }).catch(err => {
          console.error('Error fetching report:', err);
          return { data: { data: { balance: {}, monthlyData: [], transactions: {} } } };
        }),
        fetchTrendData(headers), // Fetch last 6 months individually
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/all`, { headers })
          .catch(err => {
            console.error('Error fetching houses:', err);
            return { data: { data: [] } };
          }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/houses/outstanding`, { headers })
          .catch(err => {
            console.error('Error fetching outstanding:', err);
            return { data: { data: [], total: 0, total_amount: 0 } };
          }),
      ]);

      setReportData(reportRes.data?.data || { balance: {}, monthlyData: [], transactions: {} });
      setMonthlyTrendsData(trendResults);
      setHousesData(housesRes.data?.data || []);
      setOutstandingData({
        data: outstandingRes.data?.data || [],
        total: outstandingRes.data?.total || 0,
        total_amount: outstandingRes.data?.total_amount || 0,
      });
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [session, selectedPeriod, fetchTrendData]);

  // Initial fetch and period change
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session, selectedPeriod, fetchDashboardData]);

  /**
   * Calculate financial metrics
   */
  const financialMetrics = useMemo(() => {
    const balance = reportData?.balance || {};
    return {
      totalBalance: balance.final_balance || 0,
      totalIncome: balance.total_income || 0,
      totalExpense: balance.total_expense || 0,
      totalOutstanding: outstandingData.total_amount || 0,
    };
  }, [reportData, outstandingData]);

  /**
   * Calculate citizen demographics
   */
  const citizenMetrics = useMemo(() => {
    const totalHouses = housesData.length;

    // Get status counts for selected period
    const statusCounts = housesData.reduce((acc, house) => {
      const monthStatus = house.monthly_status?.find(
        (s) => s.month === selectedPeriod
      );

      if (monthStatus) {
        acc[monthStatus.status] = (acc[monthStatus.status] || 0) + 1;
      }
      return acc;
    }, { Isi: 0, Kosong: 0, Weekend: 0 });

    const occupiedCount = statusCounts.Isi || 0;
    const weekendCount = statusCounts.Weekend || 0;
    const emptyCount = statusCounts.Kosong || 0;
    const activeResidents = occupiedCount + weekendCount;

    return {
      totalHouses,
      occupiedCount,
      emptyCount,
      weekendCount,
      activeResidents,
      occupancyRate: totalHouses > 0 ? Math.round((occupiedCount / totalHouses) * 100) : 0,
    };
  }, [housesData, selectedPeriod]);

  /**
   * Calculate IPL metrics for selected period
   */
  const iplMetrics = useMemo(() => {
    const eligibleHouses = housesData.filter((house) => {
      const monthStatus = house.monthly_status?.find(
        (s) => s.month === selectedPeriod
      );
      return monthStatus && (monthStatus.status === 'Isi' || monthStatus.status === 'Weekend');
    });

    const eligibleCount = eligibleHouses.length;

    // Calculate fee status
    const feeStatus = eligibleHouses.reduce((acc, house) => {
      const monthFee = house.monthly_fees?.find((f) => f.month === selectedPeriod);

      if (monthFee) {
        const { status, fee } = monthFee;
        acc[status] = (acc[status] || 0) + 1;

        if (status === 'Lunas' || status === 'Bayar Sebagian') {
          acc.totalCollected += fee || 0;
        }
        if (status !== 'TBD') {
          acc.totalExpected += fee || 0;
        }
      }
      return acc;
    }, { Lunas: 0, 'Belum Bayar': 0, TBD: 0, 'Bayar Sebagian': 0, totalCollected: 0, totalExpected: 0 });

    const paidCount = feeStatus.Lunas || 0;
    const partialCount = feeStatus['Bayar Sebagian'] || 0;
    const unpaidCount = feeStatus['Belum Bayar'] || 0;
    const tbdCount = feeStatus.TBD || 0;

    const collectionRate = feeStatus.totalExpected > 0
      ? Math.round((feeStatus.totalCollected / feeStatus.totalExpected) * 100)
      : 0;

    return {
      eligibleCount,
      paidCount,
      unpaidCount,
      partialCount,
      tbdCount,
      totalCollected: feeStatus.totalCollected,
      totalExpected: feeStatus.totalExpected,
      collectionRate,
    };
  }, [housesData, selectedPeriod]);

  /**
   * Get recent transactions
   */
  const recentTransactions = useMemo(() => {
    const transactions = reportData?.transactions || {};
    const allTransactions = [
      ...(transactions.ipl || []),
      ...(transactions.OutRutin || []),
      ...(transactions.OutFasum || []),
      ...(transactions.OutFasos || []),
      ...(transactions.OutOther || []),
    ];

    // Sort by date (newest first) and take last 5
    return allTransactions
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
      .slice(0, 5);
  }, [reportData]);

  /**
   * Get top outstanding houses
   */
  const topOutstanding = useMemo(() => {
    return (outstandingData.data || [])
      .sort((a, b) => b.total_fee - a.total_fee)
      .slice(0, 5);
  }, [outstandingData]);

  /**
   * Get monthly trend data (last 6 months) - already fetched individually
   */
  const monthlyTrends = useMemo(() => {
    return monthlyTrendsData;
  }, [monthlyTrendsData]);

  return {
    // Metrics
    financialMetrics,
    citizenMetrics,
    iplMetrics,

    // Data
    recentTransactions,
    topOutstanding,
    monthlyTrends,
    outstandingData,

    // State
    loading,
    error,
    lastUpdated,

    // Actions
    refresh: fetchDashboardData,
  };
};

export default useDashboardData;
