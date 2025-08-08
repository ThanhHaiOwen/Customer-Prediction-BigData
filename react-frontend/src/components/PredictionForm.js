import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate từ react-router-dom
import axios from "axios";
import "../styles.css";

const PredictionForm = () => {
  const [monthlyCharges, setMonthlyCharges] = useState("");
  const [contract, setContract] = useState("Month-to-month");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Khởi tạo navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/predict`, {
        MonthlyCharges: parseFloat(monthlyCharges),
        Contract: contract,
      });
      setPrediction(response.data["Churn Prediction"]);
    } catch (err) {
      console.error(err);
      setError("Lỗi khi gửi dữ liệu, kiểm tra API!");
    }
  };

  // Thiết lập phím tắt: Ctrl + Shift + F để chuyển đến FilterPage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của trình duyệt
        navigate("/filter"); // Chuyển hướng đến FilterPage (đường dẫn /filter)
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="container">
      <div className="card">
        <h2>Dự đoán khả năng rời bỏ của khách hàng</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="monthlyCharges">Chi phí hàng tháng:</label>
            <input
              id="monthlyCharges"
              className="form-control"
              type="number"
              value={monthlyCharges}
            onChange={(e) => setMonthlyCharges(e.target.value)}
            placeholder="Nhập số tiền..."
            required
          />
          </div>
          <div className="form-group">
            <label htmlFor="contract">Loại hợp đồng:</label>
            <select
              id="contract"
              className="form-control"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
            >
              <option value="Month-to-month">Theo tháng</option>
              <option value="One year">1 năm</option>
              <option value="Two year">2 năm</option>
            </select>
          </div>
          <button type="submit" className="btn">
            Dự đoán ngay
          </button>
        </form>
        
        {prediction && (
          <div className={`result-card ${prediction === "Yes" ? "danger" : ""}`}>
            <h3>Kết quả dự đoán</h3>
            <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
              {prediction === "Yes" 
                ? "⚠️ Khách hàng có khả năng rời bỏ dịch vụ" 
                : "✅ Khách hàng có khả năng tiếp tục sử dụng dịch vụ"}
            </p>
          </div>
        )}
        
        {error && (
          <div className="result-card danger">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionForm;
