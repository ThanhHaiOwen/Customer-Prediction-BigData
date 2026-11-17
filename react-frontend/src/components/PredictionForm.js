import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Copy,
  Check,
  PhoneCall,
  Mail,
  Sliders,
  Briefcase,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { simulateWhatIfScenario } from "../services/dataCache";

export default function PredictionForm() {
  const location = useLocation();

  const [customerId, setCustomerId] = useState("7892-POOKP");
  const [monthlyCharges, setMonthlyCharges] = useState("104.80");
  const [contract, setContract] = useState("Month-to-month");
  const [tenure, setTenure] = useState("28");
  const [internetService, setInternetService] = useState("Fiber optic");

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [copilotData, setCopilotData] = useState(null);
  const [error, setError] = useState(null);

  // What-If Simulator State
  const [targetContract, setTargetContract] = useState("One year");
  const [discountPercent, setDiscountPercent] = useState(15);

  // Copy states & Active Tab
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeCopilotTab, setActiveCopilotTab] = useState("script");

  // Hàm tính nhanh kịch bản dự phòng phía client để phản hồi 0ms ngay cả khi server đang cold-start
  const buildLocalFallbackResult = (charges, cType, cId, ten, iService) => {
    let baseProb = 0.25;
    if (cType === "Month-to-month") {
      baseProb = charges >= 80 ? 0.82 : charges >= 60 ? 0.68 : 0.46;
    } else if (cType === "One year") {
      baseProb = charges >= 85 ? 0.28 : 0.14;
    } else {
      baseProb = 0.05;
    }
    const riskScore = Number((baseProb * 100).toFixed(1));
    const riskLevel = riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";
    const isChurn = riskScore >= 50 ? "Yes" : "No";

    const riskFactors = [];
    if (cType === "Month-to-month") {
      riskFactors.append
        ? riskFactors.push("Hợp đồng thanh toán theo tháng — Không có cam kết giữ chân (Tỷ lệ rời mạng phân khúc: 42.7%)")
        : riskFactors.push("Hợp đồng thanh toán theo tháng — Không có cam kết giữ chân (Tỷ lệ rời mạng phân khúc: 42.7%)");
    } else if (cType === "One year") {
      riskFactors.push("Hợp đồng kỳ hạn 1 năm — Mức độ ổn định trung bình (Tỷ lệ rời mạng phân khúc: 11.3%)");
    } else {
      riskFactors.push("Hợp đồng kỳ hạn 2 năm — Cam kết dài hạn vững chắc (Tỷ lệ rời mạng chỉ 2.8%)");
    }

    if (charges >= 70) {
      riskFactors.push(`Cước phí hàng tháng cao ($${charges.toFixed(2)}/tháng) — Vượt ngưỡng nhạy cảm giá trung bình ($64.76)`);
    } else {
      riskFactors.push(`Cước phí tiêu chuẩn ($${charges.toFixed(2)}/tháng) — Biên độ rủi ro giá ở mức kiểm soát`);
    }

    if (parseInt(ten, 10) <= 6) {
      riskFactors.push(`Thời gian gắn bó ngắn (${ten} tháng) — Giai đoạn nhạy cảm nhất trong vòng đời thuê bao`);
    }

    const discountAmt = charges >= 75 ? 12 : charges >= 50 ? 8 : 5;
    const newPrice = Math.max(15, charges - discountAmt);
    const netRetained = newPrice * 12;

    const copilot = {
      customer_id: cId,
      recommended_offer: {
        title: "Chính Sách Chuyển Đổi Kỳ Hạn 12 Tháng (Executive Retention)",
        discount: `Ưu đãi định mức $${discountAmt}/tháng trong 6 kỳ cước (Cước sau ưu đãi: $${newPrice.toFixed(1)}/tháng)`,
        perk: "Miễn phí gói Bảo mật Đường truyền & Hỗ trợ Kỹ thuật Ưu tiên (Priority SLA)",
        financial_impact: `Doanh thu giữ lại ròng (Net ARR): $${netRetained.toLocaleString("en-US", { maximumFractionDigits: 0 })} USD/năm • Chi phí chiến dịch: $${discountAmt * 6} USD`
      },
      telesales_script:
        `1. MỞ ĐẦU & GHI NHẬN:\n` +
        `"Chào Anh/Chị, em liên hệ từ Bộ phận Quản lý Tài khoản Khách hàng của hệ thống viễn thông. Hiện tại mã thuê bao ${cId} của mình đã đồng hành ${ten} tháng trên hạ tầng ${iService}."\n\n` +
        `2. ĐỀ XUẤT GIÁ TRỊ & ƯU ĐÃI TÀI CHÍNH:\n` +
        `"Qua rà soát định kỳ, mức cước theo tháng hiện tại của Anh/Chị là $${charges.toFixed(1)}/tháng. Trong kỳ này, hệ thống áp dụng chính sách tối ưu chi phí cho khách hàng chuyển sang kỳ hạn ổn định 12 tháng:\n` +
        `  • Giảm trực tiếp $${discountAmt}/tháng trên hóa đơn (chỉ còn $${newPrice.toFixed(1)}/tháng).\n` +
        `  • Bổ sung miễn phí gói Hỗ trợ Kỹ thuật Ưu tiên & Bảo vệ đường truyền."\n\n` +
        `3. CHỐT CAM KẾT:\n` +
        `"Việc chuyển đổi không phát sinh phí lắp đặt và áp dụng giảm cước ngay từ kỳ hóa đơn tới. Em xin phép xác nhận kích hoạt ưu đãi này cho mã thuê bao ${cId} của mình ngay hôm nay nhé?"`,
      email_draft:
        `Tiêu đề: [Thông báo Quyền lợi] Đề xuất tối ưu cước phí cho Mã thuê bao ${cId}\n\n` +
        `Kính gửi Quý khách hàng (${cId}),\n\n` +
        `Cảm ơn Quý khách đã sử dụng dịch vụ ${iService} của chúng tôi trong suốt ${ten} tháng qua.\n\n` +
        `Nhằm tối ưu hóa chi phí vận hành và nâng cao chất lượng đường truyền cho khách hàng hiện hữu, chúng tôi trân trọng gửi tới Quý khách phương án nâng cấp kỳ hạn hợp đồng như sau:\n\n` +
        `• Cước phí điều chỉnh: $${newPrice.toFixed(1)}/tháng (Tiết kiệm $${discountAmt}/tháng so với mức $${charges.toFixed(1)}/tháng hiện tại)\n` +
        `• Đặc quyền kỹ thuật: Miễn phí 06 tháng dịch vụ TechSupport SLA & Online Security\n` +
        `• Điều kiện áp dụng: Chuyển đổi từ hợp đồng '${cType}' sang kỳ hạn cam kết 12 tháng\n\n` +
        `Quý khách có thể phản hồi trực tiếp email này với nội dung "XÁC NHẬN" để hệ thống cập nhật tự động từ kỳ cước tiếp theo.\n\n` +
        `Trân trọng,\nPhòng Quản Trị Trải Nghiệm Khách Hàng`,
      objection_handling: [
        `Khách hàng đắn đo về giá cước: Nhấn mạnh tổng mức tiết kiệm $${discountAmt * 6} USD và cam kết cố định biểu phí suốt 12 tháng.`,
        `Khách hàng ngại ràng buộc hợp đồng 1 năm: Áp dụng điều khoản linh hoạt cho phép bảo lưu hoặc chuyển nhượng địa điểm lắp đặt miễn phí.`,
        `Khách hàng phản ánh chất lượng ${iService}: Tạo phiếu kỹ thuật ưu tiên kiểm tra suy hao quang học và nâng cấp băng thông dự phòng.`
      ]
    };

    return {
      "Churn Prediction": isChurn,
      prediction: isChurn,
      risk_score: riskScore,
      risk_level: riskLevel,
      risk_factors: riskFactors,
      copilot
    };
  };

  const executePrediction = useCallback(async (chargesVal, contractVal, cidVal, tenureVal, internetVal) => {
    setError(null);
    const charges = parseFloat(chargesVal);
    if (isNaN(charges) || charges <= 0) {
      setError("Vui lòng nhập mức cước hàng tháng hợp lệ (> 0)");
      return;
    }

    // Hiển thị kết quả ước tính tức thì (0ms) để giao diện phản hồi ngay lập tức
    const instantFallback = buildLocalFallbackResult(charges, contractVal, cidVal, tenureVal, internetVal);
    setPredictionResult(instantFallback);
    setCopilotData(instantFallback.copilot);

    // Tự động đặt hợp đồng mục tiêu phù hợp cho bộ mô phỏng What-If
    if (contractVal === "Month-to-month") {
      setTargetContract("One year");
      setDiscountPercent(15);
    } else if (contractVal === "One year") {
      setTargetContract("Two year");
      setDiscountPercent(10);
    } else {
      setTargetContract("Two year");
      setDiscountPercent(5);
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || "https://customer-prediction-bigdata.onrender.com";

      const response = await axios.post(`${apiUrl}/predict`, {
        MonthlyCharges: charges,
        Contract: contractVal,
        CustomerID: cidVal,
        Tenure: parseInt(tenureVal, 10) || 8,
        InternetService: internetVal
      });

      const data = response.data;
      setPredictionResult(data);

      if (data.copilot) {
        setCopilotData(data.copilot);
      } else {
        // Nếu backend đang chạy bản cũ chưa trả về copilot gộp chung, gọi tiếp endpoint copilot
        try {
          const copilotRes = await axios.post(`${apiUrl}/api/ai-retention-copilot`, {
            MonthlyCharges: charges,
            Contract: contractVal,
            CustomerID: cidVal,
            Tenure: parseInt(tenureVal, 10) || 8,
            InternetService: internetVal
          });
          setCopilotData(copilotRes.data);
        } catch {
          // Giữ bản copilot local nếu endpoint phụ chưa phản hồi
        }
      }
    } catch (err) {
      console.warn("Sử dụng kết quả tính toán nội bộ do server đang khởi động:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động nhận dữ liệu khách hàng được chuyển từ trang Lọc / Tìm kiếm / Trang chủ
  useEffect(() => {
    const incomingCustomer = location.state?.customer;
    if (incomingCustomer) {
      const cid = incomingCustomer.CustomerID || incomingCustomer.customerID || "KH-VIP";
      const charges = String(incomingCustomer.MonthlyCharges || "75.50");
      const cType = incomingCustomer.Contract || "Month-to-month";
      const ten = String(incomingCustomer.tenure || "8");
      const iService = incomingCustomer.InternetService || "Fiber optic";

      setCustomerId(cid);
      setMonthlyCharges(charges);
      setContract(cType);
      setTenure(ten);
      setInternetService(iService);

      executePrediction(charges, cType, cid, ten, iService);
    } else {
      // Chạy sẵn 1 hồ sơ mẫu ngay khi mở trang để người dùng không thấy trang trống
      executePrediction("104.80", "Month-to-month", "7892-POOKP", "28", "Fiber optic");
    }
  }, [location.state, executePrediction]);

  const handlePredict = (e) => {
    e.preventDefault();
    executePrediction(monthlyCharges, contract, customerId, tenure, internetService);
  };

  const applyPreset = (preset) => {
    setCustomerId(preset.id);
    setMonthlyCharges(preset.charges);
    setContract(preset.contract);
    setTenure(preset.tenure);
    setInternetService(preset.internet);
    executePrediction(preset.charges, preset.contract, preset.id, preset.tenure, preset.internet);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "script") {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const isChurn = predictionResult && predictionResult["Churn Prediction"] === "Yes";
  const riskScore = predictionResult?.risk_score ?? (isChurn ? 78.5 : 18.2);
  const riskLevel = predictionResult?.risk_level ?? (isChurn ? "High" : "Low");

  // Kết quả mô phỏng What-If thời gian thực (0ms)
  const simulation = simulateWhatIfScenario({
    monthlyCharges,
    currentContract: contract,
    targetContract,
    discountPercent,
    baseRiskScore: riskScore
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="eyebrow-label">
          <Activity size={14} />
          <span>PHÂN HỆ ĐỊNH LƯỢNG RỦI RO & KỊCH BẢN CAN THIỆP</span>
        </div>
        <h1 className="page-header-title">
          Dự Báo Rủi Ro Rời Mạng & Mô Phỏng Chính Sách Giữ Chân
        </h1>
        <p className="page-header-sub">
          Đánh giá xác suất rời bỏ theo mô hình Logistic Regression, mô phỏng độ nhạy chính sách giá (What-If) và xuất kịch bản CSKH.
        </p>
      </div>

      <div className="prediction-layout">
        {/* Cột Trái: Form Thông số & Preset */}
        <div className="input-card">
          <h2 className="card-heading">Thông Số Hồ Sơ Thuê Bao</h2>

          <div style={{ marginBottom: "1rem" }}>
            <span className="form-label" style={{ marginBottom: "0.45rem" }}>
              Nạp nhanh hồ sơ thực nghiệm:
            </span>
            <div className="preset-pills">
              <button
                type="button"
                className="preset-pill"
                onClick={() =>
                  applyPreset({
                    id: "7892-POOKP",
                    charges: "104.80",
                    contract: "Month-to-month",
                    tenure: "28",
                    internet: "Fiber optic"
                  })
                }
              >
                VIP Rủi Ro Cao ($104.8 • Tháng)
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() =>
                  applyPreset({
                    id: "9237-HQITU",
                    charges: "70.70",
                    contract: "Month-to-month",
                    tenure: "2",
                    internet: "Fiber optic"
                  })
                }
              >
                Thuê Bao Mới ($70.7 • 2 tháng)
              </button>
              <button
                type="button"
                className="preset-pill"
                onClick={() =>
                  applyPreset({
                    id: "5575-GNVDE",
                    charges: "56.95",
                    contract: "One year",
                    tenure: "34",
                    internet: "DSL"
                  })
                }
              >
                Khách Ổn Định ($56.9 • 1 năm)
              </button>
            </div>
          </div>

          <form onSubmit={handlePredict}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã Định Danh (Customer ID)</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Ví dụ: 7892-POOKP"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cước Hàng Tháng ($ Monthly) *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    className="form-input with-prefix"
                    value={monthlyCharges}
                    onChange={(e) => setMonthlyCharges(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Kỳ Hạn Hợp Đồng Hiện Tại (Contract) *</label>
                <select
                  className="form-select"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                >
                  <option value="Month-to-month">Month-to-month (Thanh toán từng tháng — Tỷ lệ rời bỏ 42.7%)</option>
                  <option value="One year">One year (Hợp đồng kỳ hạn 1 năm — Tỷ lệ rời bỏ 11.3%)</option>
                  <option value="Two year">Two year (Hợp đồng kỳ hạn 2 năm — Tỷ lệ rời bỏ 2.8%)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thời Gian Gắn Bó (Tháng)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hạ Tầng Kết Nối</label>
                <select
                  className="form-select"
                  value={internetService}
                  onChange={(e) => setInternetService(e.target.value)}
                >
                  <option value="Fiber optic">Fiber optic (Cáp quang tốc độ cao)</option>
                  <option value="DSL">DSL (Băng thông tiêu chuẩn)</option>
                  <option value="No">No Internet (Chỉ dùng thoại)</option>
                </select>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              <Activity size={16} />
              <span>{loading ? "Đang đồng bộ máy chủ ML..." : "Cập Nhật Đánh Giá & Mô Phỏng"}</span>
            </button>
          </form>
        </div>

        {/* Cột Phải: Kết quả Chấm điểm + Bộ mô phỏng What-If + Kịch bản CSKH */}
        <div className="output-column">
          {predictionResult && (
            <div className="result-card">
              <div className="result-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  {isChurn ? (
                    <AlertTriangle size={20} color="#be123c" />
                  ) : (
                    <ShieldCheck size={20} color="#047857" />
                  )}
                  <span className="result-title">
                    Hồ Sơ {customerId}: {isChurn ? "CẢNH BÁO NGUY CƠ RỜI MẠNG" : "TRẠNG THÁI THUÊ BAO ỔN ĐỊNH"}
                  </span>
                </div>
                <span className={`risk-badge ${riskLevel.toLowerCase()}`}>
                  MỨC RỦI RO: {riskLevel.toUpperCase()}
                </span>
              </div>

              {/* Thanh đo xác suất */}
              <div className="gauge-container">
                <div className="gauge-header">
                  <span>Xác Suất Rời Bỏ Dự Báo (Churn Probability)</span>
                  <span className="gauge-score">{riskScore}%</span>
                </div>
                <div className="gauge-bar-bg">
                  <div
                    className={`gauge-bar-fill ${riskLevel.toLowerCase()}`}
                    style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
                  />
                </div>
              </div>

              {/* Các yếu tố tác động */}
              {predictionResult.risk_factors && predictionResult.risk_factors.length > 0 && (
                <div className="risk-factors-box">
                  <div className="risk-factors-title">
                    <Lightbulb size={14} />
                    <span>Chẩn Đoán Nguyên Nhân Trọng Yếu (Key Drivers)</span>
                  </div>
                  <ul className="risk-factors-list">
                    {predictionResult.risk_factors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* BỘ MÔ PHỎNG WHAT-IF (TÍNH NĂNG MỚI) */}
              <div className="simulator-box">
                <div className="simulator-header">
                  <span className="simulator-title">
                    <Sliders size={14} />
                    <span>Mô Phỏng Tác Động Chính Sách Giữ Chân (What-If Simulator)</span>
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#71717a" }}>
                    Tính toán thời gian thực
                  </span>
                </div>

                <div className="simulator-controls">
                  <div>
                    <label className="form-label">Kỳ hạn hợp đồng đề xuất chuyển đổi:</label>
                    <select
                      className="form-select"
                      value={targetContract}
                      onChange={(e) => setTargetContract(e.target.value)}
                    >
                      <option value="One year">Chuyển sang kỳ hạn 1 năm (One year)</option>
                      <option value="Two year">Chuyển sang kỳ hạn 2 năm (Two year)</option>
                      <option value="Month-to-month">Giữ nguyên từng tháng (Month-to-month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Mức chiết khấu ưu đãi cước:</span>
                      <strong>{discountPercent}% (${simulation.discountedCharges}/tháng)</strong>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="5"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#09090b", cursor: "pointer", marginTop: "0.4rem" }}
                    />
                  </div>
                </div>

                <div className="simulator-metrics">
                  <div className="sim-metric-item">
                    <span className="sim-metric-label">Rủi Ro Sau Can Thiệp</span>
                    <span className="sim-metric-val">
                      {riskScore}% <ArrowRight size={12} style={{ verticalAlign: "middle" }} />{" "}
                      <span className="positive">{simulation.simulatedRisk}%</span>
                    </span>
                  </div>
                  <div className="sim-metric-item">
                    <span className="sim-metric-label">Biên Độ Giảm Rủi Ro</span>
                    <span className="sim-metric-val positive">
                      {simulation.riskReduction > 0 ? `-${simulation.riskReduction}%` : "0.0%"}
                    </span>
                  </div>
                  <div className="sim-metric-item">
                    <span className="sim-metric-label">Doanh Thu Bảo Toàn / Năm</span>
                    <span className="sim-metric-val">
                      ${simulation.retainedAnnualRevenue.toLocaleString("en-US")} (ROI {simulation.roiMultiple}x)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kịch bản hành động CSKH */}
          {copilotData && (
            <div className="copilot-card">
              <div className="copilot-header">
                <div className="copilot-badge">
                  <Briefcase size={13} />
                  <span>KỊCH BẢN CAN THIỆP & CHĂM SÓC KHÁCH HÀNG</span>
                </div>
                <span className="copilot-sub">MÃ HS: {customerId}</span>
              </div>

              <div className="offer-banner">
                <div className="offer-title">
                  <span>{copilotData.recommended_offer.title}</span>
                </div>
                <p className="offer-discount">{copilotData.recommended_offer.discount}</p>
                <p className="offer-perk">+ {copilotData.recommended_offer.perk}</p>
                <div className="offer-impact">{copilotData.recommended_offer.financial_impact}</div>
              </div>

              <div className="copilot-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "script" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("script")}
                >
                  <PhoneCall size={14} /> Kịch Bản Telesales
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "email" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("email")}
                >
                  <Mail size={14} /> Mẫu Email Đề Xuất
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "tips" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("tips")}
                >
                  <Lightbulb size={14} /> Xử Lý Từ Chối
                </button>
              </div>

              <div className="copilot-tab-content">
                {activeCopilotTab === "script" && (
                  <div className="script-box">
                    <div className="content-toolbar">
                      <span className="toolbar-label">Lời thoại chuẩn cho chuyên viên CSKH</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy(copilotData.telesales_script, "script")}
                      >
                        {copiedScript ? <Check size={13} color="#047857" /> : <Copy size={13} />}
                        {copiedScript ? "Đã sao chép" : "Sao chép lời thoại"}
                      </button>
                    </div>
                    <pre className="text-display">{copilotData.telesales_script}</pre>
                  </div>
                )}

                {activeCopilotTab === "email" && (
                  <div className="script-box">
                    <div className="content-toolbar">
                      <span className="toolbar-label">Mẫu thư điện tử gửi tự động qua hệ thống CRM</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy(copilotData.email_draft, "email")}
                      >
                        {copiedEmail ? <Check size={13} color="#047857" /> : <Copy size={13} />}
                        {copiedEmail ? "Đã sao chép" : "Sao chép Email"}
                      </button>
                    </div>
                    <pre className="text-display">{copilotData.email_draft}</pre>
                  </div>
                )}

                {activeCopilotTab === "tips" && (
                  <div className="tips-box">
                    <h4 className="tips-title">Hướng dẫn xử lý tình huống đàm phán thực tế:</h4>
                    <ul className="tips-list">
                      {copilotData.objection_handling.map((tip, i) => (
                        <li key={i}>
                          <span className="tip-bullet">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
