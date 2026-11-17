// High-Performance In-Memory Cache & Business Logic Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://customer-prediction-bigdata.onrender.com';

// Dữ liệu thống kê chuẩn từ thongke.csv giúp trang Biểu đồ hiển thị tức thì (0ms)
const INITIAL_CHART_DATA = [
  {
    Contract: "Month-to-month",
    TotalCustomers: 3875,
    AvgMonthlyCharges: 66.40,
    ChurnRate: 55.02,
    SegmentChurnRate: 42.71
  },
  {
    Contract: "One year",
    TotalCustomers: 1473,
    AvgMonthlyCharges: 65.05,
    ChurnRate: 20.91,
    SegmentChurnRate: 11.27
  },
  {
    Contract: "Two year",
    TotalCustomers: 1695,
    AvgMonthlyCharges: 60.77,
    ChurnRate: 24.07,
    SegmentChurnRate: 2.83
  }
];

// Danh sách khách hàng rủi ro cao tiêu biểu từ tập dữ liệu thực tế (phục vụ Watchlist & Fallback tức thì)
export const PRIORITY_WATCHLIST = [
  {
    CustomerID: "7892-POOKP",
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "Yes",
    Dependents: "No",
    tenure: 28,
    InternetService: "Fiber optic",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 104.80,
    TotalCharges: 3046.05,
    Churn: "Yes",
    estimatedRisk: 84.5
  },
  {
    CustomerID: "0280-XJGEX",
    gender: "Male",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 49,
    InternetService: "Fiber optic",
    Contract: "Month-to-month",
    PaymentMethod: "Bank transfer (automatic)",
    MonthlyCharges: 103.70,
    TotalCharges: 5036.30,
    Churn: "Yes",
    estimatedRisk: 82.1
  },
  {
    CustomerID: "9305-CDSKC",
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 8,
    InternetService: "Fiber optic",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 99.65,
    TotalCharges: 820.50,
    Churn: "Yes",
    estimatedRisk: 86.4
  },
  {
    CustomerID: "9237-HQITU",
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 2,
    InternetService: "Fiber optic",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 70.70,
    TotalCharges: 151.65,
    Churn: "Yes",
    estimatedRisk: 79.2
  },
  {
    CustomerID: "3668-QPYBK",
    gender: "Male",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 2,
    InternetService: "DSL",
    Contract: "Month-to-month",
    PaymentMethod: "Mailed check",
    MonthlyCharges: 53.85,
    TotalCharges: 108.15,
    Churn: "Yes",
    estimatedRisk: 68.5
  }
];

const cache = {
  chartData: INITIAL_CHART_DATA,
  allCustomers: null,
  churnYes: null,
  churnNo: null,
  inflightAll: null,
  inflightChurn: {}
};

/**
 * Đánh thức server Render và nạp sẵn dữ liệu vào bộ nhớ đệm trong nền
 */
export function warmupAndPrefetch() {
  // Fetch chart data
  fetch(`${API_BASE_URL}/api/churn-data`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        cache.chartData = data;
      }
    })
    .catch(() => {});

  // Prefetch danh sách khách hàng vào RAM
  if (!cache.allCustomers && !cache.inflightAll) {
    getAllCustomersCached().catch(() => {});
  }
}

/**
 * Lấy dữ liệu biểu đồ (Trả về tức thì từ cache, đồng thời làm mới nếu cần)
 */
export async function getChartDataCached(forceRefresh = false) {
  if (!forceRefresh && cache.chartData) {
    return cache.chartData;
  }
  const response = await fetch(`${API_BASE_URL}/api/churn-data`);
  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu biểu đồ");
  }
  const data = await response.json();
  cache.chartData = data;
  return data;
}

/**
 * Tải toàn bộ danh sách khách hàng 1 lần duy nhất và lưu trong RAM
 */
export async function getAllCustomersCached(forceRefresh = false) {
  if (!forceRefresh && cache.allCustomers) {
    return cache.allCustomers;
  }

  if (!forceRefresh && cache.inflightAll) {
    return cache.inflightAll;
  }

  cache.inflightAll = fetch(`${API_BASE_URL}/api/search-customers`)
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Không thể kết nối máy chủ dữ liệu");
      }
      const data = await response.json();
      const customers = (data.customers || []).map(c => ({
        ...c,
        CustomerID: c.CustomerID || c.customerID || "Unknown",
        _totalNum: parseFloat(c.TotalCharges) || 0
      }));
      cache.allCustomers = customers;
      cache.churnYes = customers.filter(c => c.Churn === "Yes");
      cache.churnNo = customers.filter(c => c.Churn === "No");
      cache.inflightAll = null;
      return customers;
    })
    .catch((err) => {
      cache.inflightAll = null;
      throw err;
    });

  return cache.inflightAll;
}

/**
 * Lọc khách hàng theo trạng thái Churn (Tốc độ < 1ms nếu đã có trong cache)
 */
export async function getFilteredChurnCached(churnValue = "Yes", forceRefresh = false) {
  if (!forceRefresh) {
    if (churnValue === "Yes" && cache.churnYes) {
      return { count: cache.churnYes.length, customers: cache.churnYes };
    }
    if (churnValue === "No" && cache.churnNo) {
      return { count: cache.churnNo.length, customers: cache.churnNo };
    }
  }

  try {
    const all = await getAllCustomersCached(forceRefresh);
    const filtered = all.filter(c => c.Churn === churnValue);
    return { count: filtered.length, customers: filtered };
  } catch (err) {
    // Fallback trực tiếp tới endpoint /api/filter-churn
    const response = await fetch(`${API_BASE_URL}/api/filter-churn?churn=${churnValue}`);
    if (!response.ok) {
      throw err;
    }
    const data = await response.json();
    if (churnValue === "Yes") cache.churnYes = data.customers || [];
    if (churnValue === "No") cache.churnNo = data.customers || [];
    return data;
  }
}

/**
 * Tìm kiếm khách hàng đa tiêu chí tức thì trong RAM (< 1ms)
 */
export async function searchCustomersCached(filters = {}, forceRefresh = false) {
  const all = await getAllCustomersCached(forceRefresh);
  const cidQuery = (filters.customerID || "").trim().toLowerCase();
  const contractFilter = (filters.contract || "").trim();
  const minCharges = filters.totalChargesMin !== "" && filters.totalChargesMin !== undefined
    ? parseFloat(filters.totalChargesMin)
    : null;
  const maxCharges = filters.totalChargesMax !== "" && filters.totalChargesMax !== undefined
    ? parseFloat(filters.totalChargesMax)
    : null;

  const matched = all.filter(item => {
    if (contractFilter && item.Contract !== contractFilter) return false;
    if (cidQuery && !String(item.CustomerID).toLowerCase().includes(cidQuery)) return false;
    if (minCharges !== null && !isNaN(minCharges) && item._totalNum < minCharges) return false;
    if (maxCharges !== null && !isNaN(maxCharges) && item._totalNum > maxCharges) return false;
    return true;
  });

  return {
    count: matched.length,
    customers: matched
  };
}

/**
 * Tính toán mô phỏng What-If tức thì (0ms) trên trình duyệt
 */
export function simulateWhatIfScenario({
  monthlyCharges,
  currentContract,
  targetContract,
  discountPercent,
  baseRiskScore
}) {
  const charges = parseFloat(monthlyCharges) || 70;
  const discountRate = (parseFloat(discountPercent) || 0) / 100;
  const discountedCharges = Math.max(15, charges * (1 - discountRate));

  // Hệ số giảm thiểu rủi ro thực nghiệm theo phân khúc hợp đồng & độ co giãn giá
  let contractMultiplier = 1.0;
  if (currentContract === "Month-to-month") {
    if (targetContract === "One year") contractMultiplier = 0.36;
    if (targetContract === "Two year") contractMultiplier = 0.14;
  } else if (currentContract === "One year") {
    if (targetContract === "Month-to-month") contractMultiplier = 2.4;
    if (targetContract === "Two year") contractMultiplier = 0.38;
  } else if (currentContract === "Two year") {
    if (targetContract === "Month-to-month") contractMultiplier = 4.5;
    if (targetContract === "One year") contractMultiplier = 2.1;
  }

  // Tác động của chiết khấu giá cước (mỗi 10% giảm giá giúp giảm ~14% áp lực rời bỏ)
  const priceMultiplier = Math.max(0.55, 1 - discountRate * 1.4);

  const rawSimulated = baseRiskScore * contractMultiplier * priceMultiplier;
  const simulatedRisk = Math.min(98.0, Math.max(2.1, Number(rawSimulated.toFixed(1))));
  const riskReduction = Number((baseRiskScore - simulatedRisk).toFixed(1));

  let simulatedLevel = "Low";
  if (simulatedRisk >= 70) simulatedLevel = "High";
  else if (simulatedRisk >= 40) simulatedLevel = "Medium";

  const annualDiscountCost = Number(((charges - discountedCharges) * 12).toFixed(0));
  const retainedAnnualRevenue = Number((discountedCharges * 12).toFixed(0));
  const roiMultiple = annualDiscountCost > 0
    ? Number((retainedAnnualRevenue / annualDiscountCost).toFixed(1))
    : 9.9;

  return {
    originalCharges: charges.toFixed(2),
    discountedCharges: discountedCharges.toFixed(2),
    simulatedRisk,
    riskReduction,
    simulatedLevel,
    annualDiscountCost,
    retainedAnnualRevenue,
    roiMultiple
  };
}

/**
 * Xuất danh sách khách hàng ra file CSV chuẩn UTF-8 BOM (mở trực tiếp bằng Excel không lỗi font)
 */
export function exportCustomersToCSV(customers, filename = "Danh_Sach_Khach_Hang_Telco.csv") {
  if (!customers || customers.length === 0) return;

  const headers = [
    "CustomerID",
    "Gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "Tenure (Months)",
    "InternetService",
    "Contract",
    "PaymentMethod",
    "MonthlyCharges ($)",
    "TotalCharges ($)",
    "ChurnStatus"
  ];

  const rows = customers.map(c => [
    `"${c.CustomerID || c.customerID || ''}"`,
    `"${c.gender || ''}"`,
    c.SeniorCitizen === 1 ? "Senior" : "Regular",
    `"${c.Partner || ''}"`,
    `"${c.Dependents || ''}"`,
    c.tenure || 0,
    `"${c.InternetService || ''}"`,
    `"${c.Contract || ''}"`,
    `"${c.PaymentMethod || ''}"`,
    c.MonthlyCharges || 0,
    c.TotalCharges || 0,
    `"${c.Churn || ''}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
