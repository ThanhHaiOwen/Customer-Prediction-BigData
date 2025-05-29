import React, { useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);

  const fetchChartData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/churn-data");
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
      alert("Không thể tải dữ liệu biểu đồ");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Thống kê Churn Rate</h1>
      <button
        onClick={fetchChartData}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "10px 20px",
          backgroundColor: "#f06292",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Tạo Biểu Đồ
      </button>

      {chartData && (
        <div>
          {/* Biểu đồ cột: Tỷ lệ churn */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ textAlign: "center" }}>Churn Rate theo loại hợp đồng</h2>
            <Bar
              data={chartData.churnRateData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 60, // Giữ nguyên vì churn rate là phần trăm
                    title: { display: true, text: "Tỷ Lệ Churn (%)" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: {
                  legend: { display: true, position: "top" },
                  title: { display: true, text: "Churn Rate theo loại hợp đồng" },
                },
              }}
            />
          </div>

          {/* Biểu đồ cột: Số lượng khách hàng */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ textAlign: "center" }}>Số lượng khách hàng theo loại hợp đồng</h2>
            <Bar
              data={chartData.customerCountData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 4000, // Đặt max phù hợp với số lượng khách hàng
                    title: { display: true, text: "Số lượng khách hàng" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: { legend: { display: true, position: "top" } },
              }}
            />
          </div>

          {/* Biểu đồ cột: Trung bình chi phí hàng tháng */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ textAlign: "center" }}>Trung bình chi phí hàng tháng theo loại hợp đồng</h2>
            <Bar
              data={chartData.avgMonthlyChargesData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 70, // Đặt max phù hợp với chi phí trung bình
                    title: { display: true, text: "Chi phí hàng tháng (USD)" },
                  },
                  x: { title: { display: true, text: "Loại Hợp Đồng" } },
                },
                plugins: { legend: { display: true, position: "top" } },
              }}
            />
          </div>

          {/* Biểu đồ tròn: Phân bố khách hàng */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ textAlign: "center" }}>Phân bố khách hàng theo loại hợp đồng</h2>
            <Pie
              data={chartData.customerDistributionData}
              options={{ plugins: { legend: { display: true, position: "top" } } }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartPage;