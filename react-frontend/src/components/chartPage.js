import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { BarChart3, RefreshCw, ArrowLeft } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://customer-prediction-bigdata.onrender.com';
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
            backgroundColor: ["#ef4444", "#3b82f6", "#10b981"],
            borderRadius: 6,
          },
        ],
      };

      const customerCountData = {
        labels,
        datasets: [
          {
            label: "Số lượng khách hàng",
            data: customerCounts,
            backgroundColor: ["#f59e0b", "#6366f1", "#8b5cf6"],
            borderRadius: 6,
          },
        ],
      };

      const avgMonthlyChargesData = {
        labels,
        datasets: [
          {
            label: "Cước phí trung bình / tháng ($ USD)",
            data: avgCharges,
            backgroundColor: ["#ec4899", "#f59e0b", "#4f46e5"],
            borderRadius: 6,
          },
        ],
      };

      const customerDistributionData = {
        labels,
        datasets: [
          {
            label: "Phân bố khách hàng",
            data: customerCounts,
            backgroundColor: ["#ef4444", "#3b82f6", "#10b981"],
            hoverOffset: 6,
          },
        ],
      };

      setChartData({
        churnRateData,
        customerCountData,
        avgMonthlyChargesData,
        customerDistributionData,
      });
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu biểu đồ:", err);
      if (err.response) {
        setError(`Lỗi API: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        setError("Không thể kết nối đến server Backend hoặc server đang khởi động. Vui lòng thử lại sau 30 giây.");
      } else {
        setError(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải biểu đồ khi vào trang
  useEffect(() => {
    fetchChartData();
  }, []);

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-header-title">
            <BarChart3 className="title-icon" size={28} />
            Thống Kê & Phân Tích Churn Rate (Analytics)
          </h1>
          <p className="page-header-sub">
            Trực quan hóa sự liên hệ giữa loại hợp đồng viễn thông, cước phí hàng tháng và tỷ lệ rời bỏ mạng Telco.
          </p>
        </div>

        <button
          onClick={fetchChartData}
          className="btn btn-primary"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin-icon" : ""} />
          {loading ? "Đang Làm Mới..." : "Làm Mới Biểu Đồ"}
        </button>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {loading && !chartData && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <RefreshCw size={36} className="spin-icon" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Đang tính toán ma trận phân tích...</h3>
          <p className="cell-muted">Dữ liệu từ 7,043 hồ sơ khách hàng đang được tổng hợp.</p>
        </div>
      )}

      {chartData && (
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Tỷ Lệ Rời Bỏ Theo Loại Hợp Đồng (%)</h3>
            <div>
              <Bar
                data={chartData.churnRateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Tỷ Lệ Churn (%)" },
                    },
                    x: { title: { display: true, text: "Loại Hợp Đồng" } },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>Số Lượng Khách Hàng Theo Hợp Đồng</h3>
            <div>
              <Bar
                data={chartData.customerCountData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Số Lượng (Khách)" },
                    },
                    x: { title: { display: true, text: "Loại Hợp Đồng" } },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>Cước Phí Trung Bình Hàng Tháng ($)</h3>
            <div>
              <Bar
                data={chartData.avgMonthlyChargesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "USD / Tháng" },
                    },
                    x: { title: { display: true, text: "Loại Hợp Đồng" } },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false },
                  },
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>Tỷ Trọng Khách Hàng (Pie Chart)</h3>
            <div>
              <Pie
                data={chartData.customerDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                    tooltip: { mode: 'index', intersect: false },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation action button */}
      <div style={{ marginTop: '2.5rem' }}>
        <button
          onClick={() => navigate('/prediction')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} /> Quay Lại Dự Đoán Churn
        </button>
      </div>
    </div>
  );
};

export default ChartPage;
