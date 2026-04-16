-- ============================================================
-- SQL Queries for IPL Payment Analysis
-- ============================================================
-- These queries can be used to analyze payment status directly
-- from the database. Adjust table/column names as needed.
-- ============================================================

-- ----------------------------------------------------------
-- 1. Get all houses with their payment months
-- ----------------------------------------------------------
SELECT 
    h.house_id,
    h.resident_name,
    h.group AS zone,
    mf.month,
    mf.status,
    mf.fee,
    t.transaction_date
FROM houses h
LEFT JOIN monthly_fees mf ON h.id = mf.house_id
LEFT JOIN transactions t ON mf.transaction_id = t.id
WHERE mf.month >= '2024-07'
ORDER BY h.house_id, mf.month;

-- ----------------------------------------------------------
-- 2. Count paid months per house (Lunas + TBD)
-- ----------------------------------------------------------
SELECT 
    h.house_id,
    h.resident_name,
    COUNT(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN 1 END) AS paid_months,
    COUNT(mf.id) AS total_months,
    MIN(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN mf.month END) AS first_paid_month,
    MAX(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN mf.month END) AS last_paid_month
FROM houses h
LEFT JOIN monthly_fees mf ON h.id = mf.house_id AND mf.month >= '2024-07'
GROUP BY h.id, h.house_id, h.resident_name
ORDER BY h.house_id;

-- ----------------------------------------------------------
-- 3. Customers with advanced payment (3+ months ahead)
-- ----------------------------------------------------------
-- Note: This shows houses that have paid more than expected
-- from the start month (July 2024) to current month
WITH payment_counts AS (
    SELECT 
        h.id,
        h.house_id,
        h.resident_name,
        COUNT(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN 1 END) AS months_paid
    FROM houses h
    LEFT JOIN monthly_fees mf ON h.id = mf.house_id 
        AND mf.month >= '2024-07' 
        AND mf.month <= '2026-04'
    GROUP BY h.id, h.house_id, h.resident_name
)
SELECT 
    house_id,
    resident_name,
    months_paid,
    (months_paid - 22) AS months_ahead  -- 22 months from Jul 2024 to Apr 2026
FROM payment_counts
WHERE months_paid >= 25  -- 3+ months ahead
ORDER BY months_ahead DESC;

-- ----------------------------------------------------------
-- 4. Customers with severe behind payments (3+ months behind)
-- ----------------------------------------------------------
WITH payment_counts AS (
    SELECT 
        h.id,
        h.house_id,
        h.resident_name,
        COUNT(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN 1 END) AS months_paid
    FROM houses h
    LEFT JOIN monthly_fees mf ON h.id = mf.house_id 
        AND mf.month >= '2024-07'
    GROUP BY h.id, h.house_id, h.resident_name
)
SELECT 
    house_id,
    resident_name,
    months_paid,
    (22 - months_paid) AS months_behind  -- 22 months from Jul 2024 to Apr 2026
FROM payment_counts
WHERE months_paid < 19  -- 3+ months behind
ORDER BY months_behind DESC;

-- ----------------------------------------------------------
-- 5. Summary: Payment status breakdown
-- ----------------------------------------------------------
WITH payment_counts AS (
    SELECT 
        h.id,
        COUNT(CASE WHEN mf.status IN ('Lunas', 'TBD') THEN 1 END) AS months_paid
    FROM houses h
    LEFT JOIN monthly_fees mf ON h.id = mf.house_id 
        AND mf.month >= '2024-07'
    GROUP BY h.id
)
SELECT 
    CASE 
        WHEN months_paid >= 25 THEN 'Advanced (3+ months)'
        WHEN months_paid >= 19 THEN 'Current (-2 to +2 months)'
        ELSE 'Behind (3+ months)'
    END AS category,
    COUNT(*) AS total
FROM payment_counts
GROUP BY category
ORDER BY category;

-- ----------------------------------------------------------
-- 6. Detailed outstanding (tunggakan) per house
-- ----------------------------------------------------------
SELECT 
    h.house_id,
    h.resident_name,
    h.group AS zone,
    COUNT(CASE WHEN mf.status = 'Belum Bayar' THEN 1 END) AS unpaid_months,
    SUM(CASE WHEN mf.status = 'Belum Bayar' THEN mf.fee ELSE 0 END) AS total_unpaid,
    GROUP_CONCAT(CASE WHEN mf.status = 'Belum Bayar' THEN mf.month END ORDER BY mf.month) AS unpaid_periods
FROM houses h
LEFT JOIN monthly_fees mf ON h.id = mf.house_id AND mf.month >= '2024-07'
GROUP BY h.id, h.house_id, h.resident_name, h.group
HAVING COUNT(CASE WHEN mf.status = 'Belum Bayar' THEN 1 END) > 0
ORDER BY unpaid_months DESC, total_unpaid DESC;

-- ============================================================
-- Notes:
-- - START_MONTH = 2024-07 (Juli 2024)
-- - Current period = 2026-04 (April 2026)
-- - Total months = 22 (Jul 2024 to Apr 2026 inclusive)
-- - Adjust date ranges based on current analysis period
-- ============================================================