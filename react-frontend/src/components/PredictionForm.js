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
      const response = await axios.post("http://127.0.0.1:5000/predict", {
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
    <div className="prediction-form">
      <h1>Dự đoán Churn của khách hàng</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Monthly Charges:</label>
          <input
            type="number"
            value={monthlyCharges}
            onChange={(e) => setMonthlyCharges(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contract:</label>
          <select
            value={contract}
            onChange={(e) => setContract(e.target.value)}
          >
            <option value="Month-to-month">Month-to-month</option>
            <option value="One year">One year</option>
            <option value="Two year">Two year</option>
          </select>
        </div>
        <button type="submit">Dự đoán</button>
      </form>
      {prediction && (
        <div>
          <h3>Kết quả dự đoán: {prediction}</h3>
        </div>
      )}
      {error && (
        <div>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
