import React, { useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/churn-data`);
      const data = response.data;

      // Chuẩn bị dữ liệu chung
      const labels = data.map(item => item.Contract);
      const churnRates = data.map(item => item.ChurnRate);
      const customerCounts = data.map(item => item.TotalCustomers); // Sửa từ count_customerID thành TotalCustomers
      const avgCharges = data.map(item => item.AvgMonthlyCharges); // Sửa từ average_MonthlyCharges thành AvgMonthlyCharges

      // Dữ liệu cho biểu đồ tỷ lệ churn (Bar)
      const churnRateData = {
        labels,
        datasets: [
          {
            label: "Tỷ Lệ Churn (%)",
            data: churnRates,
            backgroundColor: ["red", "blue", "green"],
          },
        ],
      };

      // Dữ liệu cho biểu đồ số lượng khách hàng (Bar)
      const customerCountData = {
        labels,
        datasets: [
          {
            label: "Số lượng khách hàng",
            data: customerCounts,
            backgroundColor: ["red", "blue", "green"],
          },
        ],
      };

      // Dữ liệu cho biểu đồ trung bình chi phí hàng tháng (Bar)
      const avgMonthlyChargesData = {
        labels,
        datasets: [
          {
            label: "Trung bình chi phí hàng tháng (USD)",
            data: avgCharges,
            backgroundColor: ["red", "blue", "green"],
          },
        ],
      };

      // Dữ liệu cho biểu đồ phân bố khách hàng (Pie)
      const customerDistributionData = {
        labels,
        datasets: [
          {
            label: "Phân bố khách hàng",
            data: customerCounts,
            backgroundColor: ["red", "blue", "green"],
            hoverOffset: 4,
          },
        ],
      };

      // Lưu tất cả dữ liệu vào state
      setChartData({
        churnRateData,
        customerCountData,
        avgMonthlyChargesData,
        customerDistributionData,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      setError("Không thể tải dữ liệu biểu đồ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Thống kê và Phân tích Churn Rate</h2>
        <button
          onClick={fetchChartData}
          className={`btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Tạo Biểu Đồ'}
        </button>

        {error && (
          <div className="result-card danger">
            <p>{error}</p>
          </div>
        )}

      {chartData && (
        <div className="chart-grid">
          {/* Biểu đồ cột: Tỷ lệ churn */}
          <div className="chart-card">
            <h3>Tỷ lệ rời bỏ theo loại hợp đồng</h3>
            <Bar
              data={chartData.churnRateData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Tỷ Lệ (%)" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: {
                  legend: { position: "top" },
                  tooltip: { mode: 'index', intersect: false },
                },
              }}
            />
          </div>

          {/* Biểu đồ cột: Số lượng khách hàng */}
          <div className="chart-card">
            <h3>Phân bố khách hàng</h3>
            <Bar
              data={chartData.customerCountData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Số lượng" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: {
                  legend: { position: "top" },
                  tooltip: { mode: 'index', intersect: false },
                },
              }}
            />
          </div>

          {/* Biểu đồ cột: Chi phí trung bình */}
          <div className="chart-card">
            <h3>Chi phí trung bình hàng tháng</h3>
            <Bar
              data={chartData.avgMonthlyChargesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "USD" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: {
                  legend: { position: "top" },
                  tooltip: { mode: 'index', intersect: false },
                },
              }}
            />
          </div>

          {/* Biểu đồ tròn: Tổng quan */}
          <div className="chart-card">
            <h3>Tổng quan phân bố khách hàng</h3>
            <Pie
              data={chartData.customerDistributionData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  tooltip: { mode: 'index', intersect: false },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartPage;
  );
};

export default ChartPage;