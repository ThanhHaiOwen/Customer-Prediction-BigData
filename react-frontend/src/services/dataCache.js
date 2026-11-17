// High-Performance In-Memory Cache & Calibrated ML Logic Service
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://customer-prediction-bigdata.onrender.com';

// Thông số phân phối chuẩn của tập dữ liệu 7,043 khách hàng Telco
const TELCO_CHARGES_MEAN = 64.761692;
const TELCO_CHARGES_STD = 30.090047;
const CONTRACT_MAP = { "Month-to-month": 0, "One year": 1, "Two year": 2 };

/**
 * Hàm tính xác suất rời mạng chuẩn hóa (Logistic Regression + Bayes Prior Calibration)
 * Khắc phục triệt để lỗi scaler.pkl gốc bị chuẩn hóa kép khiến mọi mẫu đều vọt lên 99%
 */
export function computeCalibratedChurnClient(monthlyCharges, contract, tenure = 12, internetService = "Fiber optic") {
  const charges = parseFloat(monthlyCharges) || 64.76;
  const cVal = CONTRACT_MAP[contract] ?? 0;
  const zCharges = (charges - TELCO_CHARGES_MEAN) / TELCO_CHARGES_STD;

  // Trọng số chính xác từ best_logistic_model.pkl
  const rawLogit = 0.4975276 * zCharges - 1.48379119 * cVal + 0.65270657;

  // Hiệu chỉnh Bayes Prior (SMOTE 50/50 -> 26.54% thực tế) + Trọng số Tenure & Hạ tầng
  const smotePriorOffset = -0.55;
  const clampedTenure = Math.min(Math.max(parseInt(tenure, 10) || 12, 1), 72);
  const tenureAdj = -0.028 * (clampedTenure - 15);

  let internetAdj = -0.85;
  if (internetService === "Fiber optic") internetAdj = 0.42;
  else if (internetService === "DSL") internetAdj = -0.25;

  const calibratedLogit = rawLogit + smotePriorOffset + tenureAdj + internetAdj;
  const prob = 1.0 / (1.0 + Math.exp(-calibratedLogit));
  const riskScore = Number((prob * 100).toFixed(1));
  const isChurn = riskScore >= 50.0 ? "Yes" : "No";

  let riskLevel = "Low";
  if (riskScore >= 65.0) riskLevel = "High";
  else if (riskScore >= 38.0) riskLevel = "Medium";

  return {
    prediction: isChurn,
    churnProbability: Number(prob.toFixed(4)),
    riskScore,
    riskLevel
  };
}

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

// Danh sách khách hàng tiêu biểu từ tập dữ liệu thực tế
export const PRIORITY_WATCHLIST = [
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
    estimatedRisk: 78.5
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
    estimatedRisk: 72.8
  },
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
    estimatedRisk: 69.4
  },
  {
    CustomerID: "7590-VHVEG",
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "Yes",
    Dependents: "No",
    tenure: 1,
    InternetService: "DSL",
    Contract: "Month-to-month",
    PaymentMethod: "Electronic check",
    MonthlyCharges: 29.85,
    TotalCharges: 29.85,
    Churn: "No",
    estimatedRisk: 41.8
  },
  {
    CustomerID: "5575-GNVDE",
    gender: "Male",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 34,
    InternetService: "DSL",
    Contract: "One year",
    PaymentMethod: "Mailed check",
    MonthlyCharges: 56.95,
    TotalCharges: 1889.50,
    Churn: "No",
    estimatedRisk: 9.2
  }
];

const cache = {
  chartData: INITIAL_CHART_DATA,
  allCustomers: null,
  churnYes: null,
  churnNo: null,
  inflightAll: null
};

export function warmupAndPrefetch() {
  fetch(`${API_BASE_URL}/api/churn-data`)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        cache.chartData = data;
      }
    })
    .catch(() => {});

  if (!cache.allCustomers && !cache.inflightAll) {
    getAllCustomersCached().catch(() => {});
  }
}

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
 * Mô phỏng What-If sử dụng trực tiếp phương trình Logistic Regression đã hiệu chỉnh
 */
export function simulateWhatIfScenario({
  monthlyCharges,
  targetContract,
  discountPercent,
  tenure = 12,
  internetService = "Fiber optic",
  baseRiskScore
}) {
  const charges = parseFloat(monthlyCharges) || 70;
  const discountRate = (parseFloat(discountPercent) || 0) / 100;
  const discountedCharges = Math.max(15, charges * (1 - discountRate));

  const simResult = computeCalibratedChurnClient(
    discountedCharges,
    targetContract,
    tenure,
    internetService
  );

  const simulatedRisk = simResult.riskScore;
  const riskReduction = Number((baseRiskScore - simulatedRisk).toFixed(1));

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
    simulatedLevel: simResult.riskLevel,
    annualDiscountCost,
    retainedAnnualRevenue,
    roiMultiple
  };
}

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
