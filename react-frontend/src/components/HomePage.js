import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Filter,
  Search,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Download,
  ShieldAlert
} from "lucide-react";
import { PRIORITY_WATCHLIST, exportCustomersToCSV } from "../services/dataCache";

export default function HomePage() {
  const navigate = useNavigate();

  const kpis = [
    {
      title: "TỔNG THUÊ BAO QUẢN LÝ",
      value: "7,043",
      footerLabel: "Chu kỳ theo dõi: Q4",
      delta: "100% Đồng bộ",
      deltaType: "positive",
      icon: Users
    },
    {
      title: "TỶ LỆ RỜI MẠNG (CHURN RATE)",
      value: "26.54%",
      footerLabel: "Ngưỡng chuẩn ngành: 18.0%",
      delta: "1,869 Thuê bao",
      deltaType: "negative",
      icon: AlertTriangle
    },
    {
      title: "DOANH THU RỦI RO (ARR AT RISK)",
      value: "$1,669,570",
      footerLabel: "Bình quân $139,130 / tháng",
      delta: "Nhóm cước cao >$70",
      deltaType: "negative",
      icon: DollarSign
    },
    {
      title: "HIỆU SUẤT GIỮ CHÂN (ROI)",
      value: "6.1x",
      footerLabel: "Chi phí chiến dịch: ~15%",
      delta: "+$1.12M Bảo toàn",
      deltaType: "positive",
      icon: TrendingUp
    }
  ];

  const modules = [
    {
      title: "Dự Báo Rủi Ro & Mô Phỏng What-If",
      desc: "Chấm điểm xác suất rời mạng định lượng, mô phỏng độ nhạy chiết khấu và xuất kịch bản đàm phán CSKH.",
      badge: "ML + Simulator",
      icon: Activity,
      path: "/prediction"
    },
    {
      title: "Phân Tích Cơ Cấu & Biểu Đồ",
      desc: "Đối chiếu ma trận tương quan giữa kỳ hạn hợp đồng, doanh thu bình quân (ARPU) và tỷ lệ hủy dịch vụ.",
      badge: "BI Analytics",
      icon: BarChart3,
      path: "/chart"
    },
    {
      title: "Phân Khúc Thuê Bao Rời Mạng",
      desc: "Trích xuất danh sách thuê bao theo trạng thái Churn (Yes/No) tốc độ cao và xuất tệp CSV cho chiến dịch CRM.",
      badge: "Segmentation",
      icon: Filter,
      path: "/filter"
    },
    {
      title: "Tra Cứu Hồ Sơ Đa Tiêu Chí",
      desc: "Truy vấn tức thì hồ sơ khách hàng theo mã định danh, loại hợp đồng và biên độ tổng cước phí tích lũy.",
      badge: "Instant Query",
      icon: Search,
      path: "/search"
    }
  ];

  const handleAnalyzeCustomer = (customer) => {
    navigate("/prediction", { state: { customer } });
  };

  return (
    <div className="page-wrapper">
      {/* Executive Command Header */}
      <div className="executive-header">
        <div>
          <div className="eyebrow-label">
            <ShieldAlert size={14} />
            <span>HỆ THỐNG QUẢN TRỊ DOANH THU & GIỮ CHÂN KHÁCH HÀNG VIỄN THÔNG</span>
          </div>
          <h1 className="page-header-title">
            Báo Cáo Điều Hành & Cảnh Báo Rủi Ro Rời Mạng
          </h1>
          <p className="page-header-sub">
            Tổng hợp dữ liệu phân tích từ 7,043 hồ sơ thuê bao • Hỗ trợ ra quyết định tối ưu hóa vòng đời khách hàng (CLV)
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => exportCustomersToCSV(PRIORITY_WATCHLIST, "Danh_Sach_Uu_Tien_Canh_Bao.csv")}
          >
            <Download size={15} />
            <span>Xuất Watchlist (CSV)</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/prediction")}
          >
            <Activity size={15} />
            <span>Chạy Mô Phỏng Dự Báo</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="kpi-card">
              <div>
                <div className="kpi-header">
                  <span className="kpi-title">{item.title}</span>
                  <div className="kpi-icon-badge">
                    <IconComponent size={15} />
                  </div>
                </div>
                <div className="kpi-value">{item.value}</div>
              </div>
              <div className="kpi-footer">
                <span>{item.footerLabel}</span>
                <span className={`kpi-delta ${item.deltaType}`}>{item.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Functional Modules Grid */}
      <div className="section-header-bar">
        <div>
          <h2 className="section-heading">Phân Hệ Nghiệp Vụ (Core Workspaces)</h2>
          <p className="section-sub">Lựa chọn phân hệ để thực hiện phân tích chuyên sâu hoặc trích xuất dữ liệu chiến dịch</p>
        </div>
      </div>

      <div className="features-grid">
        {modules.map((mod, idx) => {
          const IconComponent = mod.icon;
          return (
            <div
              key={idx}
              className="feature-card"
              onClick={() => navigate(mod.path)}
            >
              <div className="feature-top">
                <div className="feature-icon-box">
                  <IconComponent size={18} />
                </div>
                <span className="feature-badge">{mod.badge}</span>
              </div>
              <h3 className="feature-title">{mod.title}</h3>
              <p className="feature-desc">{mod.desc}</p>
              <div className="feature-action">
                <span>Mở phân hệ</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority High-Risk Watchlist Table (1-Click Handoff) */}
      <div className="section-header-bar" style={{ marginTop: "0.5rem" }}>
        <div>
          <h2 className="section-heading">Danh Sách Tài Khoản Trọng Điểm Cần Can Thiệp Ngay (Priority Watchlist)</h2>
          <p className="section-sub">
            Các thuê bao có doanh thu hàng tháng cao (ARPU &gt; $50) nhưng đang sử dụng hợp đồng ngắn hạn có nguy cơ rời mạng lớn nhất
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/filter")}>
          <span>Xem toàn bộ 1,869 thuê bao rủi ro</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mã Thuê Bao</th>
              <th>Hồ Sơ & Hạ Tầng</th>
              <th>Kỳ Hạn Hợp Đồng</th>
              <th>Cước Hàng Tháng</th>
              <th>Tổng Chi Tiêu (LTV)</th>
              <th>Xác Suất Rủi Ro</th>
              <th style={{ textAlign: "right" }}>Thao Tác Nghiệp Vụ</th>
            </tr>
          </thead>
          <tbody>
            {PRIORITY_WATCHLIST.map((item) => (
              <tr key={item.CustomerID}>
                <td>
                  <span className="badge-customer-id">{item.CustomerID}</span>
                </td>
                <td>
                  <div className="cell-info-line">
                    <strong>{item.InternetService}</strong> • Gắn bó {item.tenure} tháng
                  </div>
                  <div className="cell-muted">
                    {item.PaymentMethod}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: "#09090b" }}>{item.Contract}</span>
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                  ${item.MonthlyCharges.toFixed(2)}/tháng
                </td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>
                  ${item.TotalCharges.toFixed(2)}
                </td>
                <td>
                  <span className="badge-churn-yes">
                    {item.estimatedRisk}% • Rủi ro cao
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn-action-row"
                    onClick={() => handleAnalyzeCustomer(item)}
                  >
                    <span>Phân tích & Giữ chân</span>
                    <ArrowRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
