import React, { useState } from "react";
import axios from "axios";
import { Brain, Sparkles, AlertTriangle, ShieldCheck, Copy, Check, PhoneCall, Mail, DollarSign, Lightbulb } from "lucide-react";

export default function PredictionForm() {
  const [monthlyCharges, setMonthlyCharges] = useState("75.5");
  const [contract, setContract] = useState("Month-to-month");
  const [customerId, setCustomerId] = useState("KH-7892");
  const [tenure, setTenure] = useState("8");
  const [internetService, setInternetService] = useState("Fiber optic");

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  // AI Copilot state
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotData, setCopilotData] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeCopilotTab, setActiveCopilotTab] = useState("script"); // "script" | "email" | "offer"

  const handlePredict = async (e) => {
    e.preventDefault();
    setError(null);
    setPredictionResult(null);
    setCopilotData(null);

    const charges = parseFloat(monthlyCharges);
    if (isNaN(charges) || charges <= 0) {
      setError("Vui lòng nhập chi phí hàng tháng hợp lệ (> 0)");
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || "https://customer-prediction-bigdata.onrender.com";
      
      const response = await axios.post(`${apiUrl}/predict`, {
        MonthlyCharges: charges,
        Contract: contract,
      });

      const data = response.data;
      setPredictionResult(data);

      // Tự động kích hoạt AI Copilot nếu kết quả là rủi ro cao hoặc trung bình
      if (data["Churn Prediction"] === "Yes" || (data.risk_score && data.risk_score >= 40)) {
        fetchCopilotData(charges, contract, customerId, tenure, internetService);
      }
    } catch (err) {
      console.error("Lỗi dự đoán:", err);
      setError("Không thể kết nối tới server Backend hoặc server đang khởi động. Vui lòng thử lại sau 30 giây.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCopilotData = async (charges, cType, cId, ten, iService) => {
    try {
      setCopilotLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || "https://customer-prediction-bigdata.onrender.com";
      
      const response = await axios.post(`${apiUrl}/api/ai-retention-copilot`, {
        MonthlyCharges: charges,
        Contract: cType,
        CustomerID: cId,
        Tenure: parseInt(ten) || 8,
        InternetService: iService,
      });

      setCopilotData(response.data);
    } catch (err) {
      console.error("Lỗi AI Copilot:", err);
    } finally {
      setCopilotLoading(false);
    }
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

  return (
    <div className="page-wrapper">
      <div className="form-header">
        <h1 className="form-page-title">
          <Brain className="title-icon" />
          Dự Đoán Rủi Ro & AI Retention Copilot
        </h1>
        <p className="form-page-sub">
          Mô hình Machine Learning phân tích xác suất rời mạng và AI Copilot tự động tạo kịch bản Telesales, Email giữ chân khách hàng.
        </p>
      </div>

      <div className="prediction-layout">
        {/* Input Card */}
        <div className="input-card">
          <h2 className="card-heading">Nhập Thông Tin Khách Hàng</h2>
          <form onSubmit={handlePredict}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Mã Khách Hàng (Tùy chọn)</label>
                <input
                  type="text"
                  className="form-input"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Ví dụ: KH-7892"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chi Phí Hàng Tháng ($ Monthly Charges) *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    className="form-input with-prefix"
                    value={monthlyCharges}
                    onChange={(e) => setMonthlyCharges(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Loại Hợp Đồng (Contract) *</label>
                <select
                  className="form-select"
                  value={contract}
                  onChange={(e) => setContract(e.target.value)}
                >
                  <option value="Month-to-month">Month-to-month (Từng tháng - Rủi ro cao)</option>
                  <option value="One year">One year (Kỳ hạn 1 năm)</option>
                  <option value="Two year">Two year (Kỳ hạn 2 năm - Rất an toàn)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Thời Gian Gắn Bó (Tenure - Tháng)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Dịch Vụ Internet</label>
                <select
                  className="form-select"
                  value={internetService}
                  onChange={(e) => setInternetService(e.target.value)}
                >
                  <option value="Fiber optic">Fiber optic (Cáp quang)</option>
                  <option value="DSL">DSL (Đường truyền đồng)</option>
                  <option value="No">Không sử dụng internet</option>
                </select>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span>Đang phân tích mô hình...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Dự Đoán Nguy Cơ Rời Bỏ</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Output & Risk Gauge */}
        <div className="output-column">
          {predictionResult ? (
            <div className="result-card">
              <div className="result-header">
                <span className="result-title">Kết Quả Phân Tích Churn</span>
                <span className={`risk-badge ${predictionResult.risk_level?.toLowerCase() || (predictionResult["Churn Prediction"] === "Yes" ? "high" : "low")}`}>
                  {predictionResult.risk_level ? `RỦI RO ${predictionResult.risk_level.toUpperCase()}` : (predictionResult["Churn Prediction"] === "Yes" ? "RỦI RO CAO" : "AN TOÀN")}
                </span>
              </div>

              {/* Gauge Indicator */}
              <div className="gauge-container">
                <div className="gauge-header">
                  <span>Xác suất rời bỏ (Churn Probability):</span>
                  <span className="gauge-score">
                    {predictionResult.risk_score ? `${predictionResult.risk_score}%` : (predictionResult["Churn Prediction"] === "Yes" ? "85.0%" : "15.0%")}
                  </span>
                </div>
                <div className="gauge-bar-bg">
                  <div
                    className={`gauge-bar-fill ${predictionResult.risk_level?.toLowerCase() || (predictionResult["Churn Prediction"] === "Yes" ? "high" : "low")}`}
                    style={{ width: `${predictionResult.risk_score || (predictionResult["Churn Prediction"] === "Yes" ? 85 : 15)}%` }}
                  />
                </div>
              </div>

              {/* Detected Risk Factors */}
              {predictionResult.risk_factors && predictionResult.risk_factors.length > 0 && (
                <div className="risk-factors-box">
                  <div className="risk-factors-title">
                    <AlertTriangle size={16} />
                    <span>Các nhân tố rủi ro chính được phát hiện:</span>
                  </div>
                  <ul className="risk-factors-list">
                    {predictionResult.risk_factors.map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Copilot Action Button */}
              {!copilotData && !copilotLoading && (
                <button
                  type="button"
                  className="trigger-copilot-btn"
                  onClick={() => fetchCopilotData(parseFloat(monthlyCharges), contract, customerId, tenure, internetService)}
                >
                  <Sparkles size={18} />
                  <span>Tạo Kịch Bản Giữ Chân Bằng AI</span>
                </button>
              )}
            </div>
          ) : (
            <div className="placeholder-card">
              <ShieldCheck size={48} className="placeholder-icon" />
              <h3>Sẵn sàng dự đoán</h3>
              <p>Nhập chi phí hàng tháng và loại hợp đồng ở bên trái để kiểm tra xác suất rời bỏ và nhận khuyến nghị từ AI.</p>
            </div>
          )}

          {/* AI Retention Copilot Section */}
          {copilotLoading && (
            <div className="copilot-loading-card">
              <Sparkles className="spin-icon" size={28} />
              <h4>AI Retention Copilot đang soạn kịch bản giữ chân...</h4>
              <p>Phân tích gói cước, tính toán biên lợi nhuận và tạo kịch bản Telesales được cá nhân hóa.</p>
            </div>
          )}

          {copilotData && (
            <div className="copilot-card">
              <div className="copilot-header">
                <div className="copilot-badge">
                  <Sparkles size={16} />
                  <span>AI RETENTION COPILOT</span>
                </div>
                <span className="copilot-sub">Được tạo tự động theo dữ liệu khách hàng</span>
              </div>

              {/* Strategy Banner */}
              <div className="offer-banner">
                <div className="offer-title">
                  <DollarSign size={18} />
                  <span>{copilotData.recommended_offer?.title}</span>
                </div>
                <p className="offer-discount">{copilotData.recommended_offer?.discount}</p>
                <p className="offer-perk">🎁 {copilotData.recommended_offer?.perk}</p>
                <div className="offer-impact">
                  <strong>Hiệu quả tài chính:</strong> {copilotData.recommended_offer?.financial_impact}
                </div>
              </div>

              {/* Tab Selector */}
              <div className="copilot-tabs">
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "script" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("script")}
                >
                  <PhoneCall size={16} />
                  <span>Lời Thoại Telesales</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "email" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("email")}
                >
                  <Mail size={16} />
                  <span>Email Tri Ân Mẫu</span>
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeCopilotTab === "tips" ? "active" : ""}`}
                  onClick={() => setActiveCopilotTab("tips")}
                >
                  <Lightbulb size={16} />
                  <span>Mẹo Đàm Phán</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="copilot-tab-content">
                {activeCopilotTab === "script" && (
                  <div className="script-container">
                    <div className="content-toolbar">
                      <span className="toolbar-label">Kịch bản gọi điện cho nhân viên CSKH:</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy(copilotData.telesales_script, "script")}
                      >
                        {copiedScript ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedScript ? "Đã sao chép!" : "Sao chép lời thoại"}</span>
                      </button>
                    </div>
                    <pre className="text-display">{copilotData.telesales_script}</pre>
                  </div>
                )}

                {activeCopilotTab === "email" && (
                  <div className="email-container">
                    <div className="content-toolbar">
                      <span className="toolbar-label">Nội dung email giữ chân tự động:</span>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => handleCopy(copilotData.email_draft, "email")}
                      >
                        {copiedEmail ? <Check size={16} /> : <Copy size={16} />}
                        <span>{copiedEmail ? "Đã sao chép!" : "Sao chép email"}</span>
                      </button>
                    </div>
                    <pre className="text-display">{copilotData.email_draft}</pre>
                  </div>
                )}

                {activeCopilotTab === "tips" && (
                  <div className="tips-container">
                    <h4 className="tips-title">Chiến thuật xử lý từ chối (Handling Objections):</h4>
                    <ul className="tips-list">
                      {copilotData.objection_handling?.map((tip, idx) => (
                        <li key={idx}>
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
