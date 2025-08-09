import React, { useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Fetching chart data from:', `${apiUrl}/api/churn-data`);
      const response = await axios.get(`${apiUrl}/api/churn-data`);
      const data = response.data;
      console.log('Chart data received:', data);

      const labels = data.map(item => item.Contract);
      const churnRates = data.map(item => item.ChurnRate);
      const customerCounts = data.map(item => item.TotalCustomers);
      const avgCharges = data.map(item => item.AvgMonthlyCharges);

      const churnRateData = {
        labels,
        datasets: [
          {
            label: "Tỷ Lệ Churn (%)",
            data: churnRates,
            backgroundColor: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
          },
        ],
      };

      const customerCountData = {
        labels,
        datasets: [
          {
            label: "Số lượng khách hàng",
            data: customerCounts,
            backgroundColor: ["#FF9F43", "#6C5CE7", "#A29BFE"],
          },
        ],
      };

      const avgMonthlyChargesData = {
        labels,
        datasets: [
          {
            label: "Trung bình chi phí hàng tháng (USD)",
            data: avgCharges,
            backgroundColor: ["#FD79A8", "#FDCB6E", "#6C5CE7"],
          },
        ],
      };

      const customerDistributionData = {
        labels,
        datasets: [
          {
            label: "Phân bố khách hàng",
            data: customerCounts,
            backgroundColor: ["#E17055", "#74B9FF", "#00B894"],
            hoverOffset: 4,
          },
        ],
      };

      setChartData({
        churnRateData,
        customerCountData,
        avgMonthlyChargesData,
        customerDistributionData,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      if (error.response) {
        setError(`Lỗi API: ${error.response.data.error || error.response.statusText}`);
      } else if (error.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không!");
      } else {
        setError(`Lỗi: ${error.message}`);
      }
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
    </div>
  );
};

export default ChartPage;
