import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { BarChart3, RefreshCw, ArrowLeft, TrendingDown } from "lucide-react";
import { getChartDataCached } from "../services/dataCache";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ChartPage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const buildChartDatasets = (data) => {
    const labels = data.map(item => item.Contract);
    const churnRates = data.map(item => item.ChurnRate);
    const customerCounts = data.map(item => item.TotalCustomers);
    const avgCharges = data.map(item => item.AvgMonthlyCharges);

    const churnRateData = {
      labels,
      datasets: [
        {
          label: "Tỷ Trọng Rời Mạng (%)",
          data: churnRates,
          backgroundColor: ["#be123c", "#3f3f46", "#047857"],
          borderRadius: 4,
          barThickness: 44
        }
      ]
    };

    const customerCountData = {
      labels,
      datasets: [
        {
          label: "Số Lượng Thuê Bao",
          data: customerCounts,
          backgroundColor: ["#09090b", "#52525b", "#a1a1aa"],
          borderRadius: 4,
          barThickness: 44
        }
      ]
    };

    const avgMonthlyChargesData = {
      labels,
      datasets: [
        {
          label: "ARPU Trung Bình ($ USD/tháng)",
          data: avgCharges,
          backgroundColor: ["#18181b", "#3f3f46", "#71717a"],
          borderRadius: 4,
          barThickness: 44
        }
      ]
    };

    const customerDistributionData = {
      labels,
      datasets: [
        {
          label: "Số Lượng Thuê Bao",
          data: customerCounts,
          backgroundColor: ["#09090b", "#52525b", "#d4d4d8"],
          borderWidth: 1,
          borderColor: "#ffffff",
          hoverOffset: 4
        }
      ]
    };

    return {
      churnRateData,
      customerCountData,
      avgMonthlyChargesData,
      customerDistributionData
    };
  };

  const loadCharts = useCallback(async (forceRefresh = false) => {
    setError(null);
    try {
      if (forceRefresh) setLoading(true);
      const data = await getChartDataCached(forceRefresh);
      setChartData(buildChartDatasets(data));
    } catch (err) {
      setError(err.message || "Không thể đồng bộ dữ liệu biểu đồ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hiển thị tức thì (0ms) từ bộ nhớ đệm
    loadCharts(false);
  }, [loadCharts]);

  return (
    <div className="page-wrapper">
      {/* Executive Header */}
      <div className="executive-header">
        <div>
          <div className="eyebrow-label">
            <BarChart3 size={14} />
            <span>PHÂN TÍCH ĐỊNH LƯỢNG CƠ CẤU DOANH THU & HỢP ĐỒNG</span>
          </div>
          <h1 className="page-header-title">
            Báo Cáo Trực Quan Hóa Phân Khúc Thuê Bao (BI Analytics)
          </h1>
          <p className="page-header-sub">
            Đối chiếu tương quan giữa loại hợp đồng, quy mô tập khách hàng và doanh thu trung bình trên mỗi thuê bao (ARPU)
          </p>
        </div>

        <div className="header-actions">
          <button
            onClick={() => loadCharts(true)}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
            <span>{loading ? "Đang đồng bộ..." : "Đồng Bộ Máy Chủ"}</span>
          </button>
          <button
            onClick={() => navigate("/prediction")}
            className="btn btn-primary"
          >
            <TrendingDown size={15} />
            <span>Mô Phỏng Giảm Rủi Ro</span>
          </button>
        </div>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Executive Summary Insights Strip */}
      <div className="insight-strip">
        <div className="insight-box">
          <div className="insight-box-label">ĐIỂM NÓNG RỦI RO (CRITICAL SEGMENT)</div>
          <div className="insight-box-val" style={{ color: "#be123c" }}>55.02% Tổng Churn</div>
          <div className="insight-box-desc">
            Nhóm hợp đồng ngắn hạn <strong>Month-to-month</strong> (3,875 thuê bao) chiếm hơn một nửa tổng lượng rời mạng toàn hệ thống.
          </div>
        </div>

        <div className="insight-box">
          <div className="insight-box-label">ĐÒN BẨY GIỮ CHÂN (CONTRACT LOCK-IN)</div>
          <div className="insight-box-val" style={{ color: "#047857" }}>Giảm 62% Rủi Ro</div>
          <div className="insight-box-desc">
            Chuyển đổi khách hàng từ trả theo tháng sang kỳ hạn <strong>One year</strong> giúp kéo giảm mạnh áp lực hủy dịch vụ.
          </div>
        </div>

        <div className="insight-box">
          <div className="insight-box-label">BIÊN ĐỘ DOANH THU (ARPU SPREAD)</div>
          <div className="insight-box-val">$66.40 vs $60.77</div>
          <div className="insight-box-desc">
            Khách hàng trả theo tháng chịu mức cước bình quân cao hơn <strong>+$5.63/tháng</strong> so với hợp đồng kỳ hạn 2 năm.
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {chartData && (
        <div className="chart-grid">
          <div className="chart-card">
            <h3>
              <span>Tỷ Trọng Rời Bỏ Theo Kỳ Hạn Hợp Đồng (%)</span>
              <span className="feature-badge">Churn Share</span>
            </h3>
            <div>
              <Bar
                data={chartData.churnRateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#f4f4f5" },
                      title: { display: true, text: "Tỷ Trọng (%)" }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false }
                  }
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>
              <span>Quy Mô Thuê Bao Theo Loại Hợp Đồng</span>
              <span className="feature-badge">Volume</span>
            </h3>
            <div>
              <Bar
                data={chartData.customerCountData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#f4f4f5" },
                      title: { display: true, text: "Số Lượng Thuê Bao" }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false }
                  }
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>
              <span>Doanh Thu Bình Quân Hàng Tháng (ARPU - $ USD)</span>
              <span className="feature-badge">Revenue / Mo</span>
            </h3>
            <div>
              <Bar
                data={chartData.avgMonthlyChargesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#f4f4f5" },
                      title: { display: true, text: "USD ($)" }
                    },
                    x: {
                      grid: { display: false }
                    }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: { mode: "index", intersect: false }
                  }
                }}
              />
            </div>
          </div>

          <div className="chart-card">
            <h3>
              <span>Cơ Cấu Danh Mục Hợp Đồng Toàn Hệ Thống</span>
              <span className="feature-badge">Portfolio Mix</span>
            </h3>
            <div>
              <Pie
                data={chartData.customerDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                    tooltip: { mode: "index", intersect: false }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/")} className="btn btn-secondary">
          <ArrowLeft size={15} />
          <span>Quay Lại Bảng Điều Khiển</span>
        </button>
      </div>
    </div>
  );
};

export default ChartPage;
