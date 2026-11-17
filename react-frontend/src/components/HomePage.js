import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, BarChart3, Filter, Search, Users, AlertTriangle, DollarSign, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const kpis = [
    {
      title: "Tổng Khách Hàng Theo Dõi",
      value: "7,043",
      sub: "Hồ sơ viễn thông Telco",
      icon: Users,
      color: "#2563eb",
      bgColor: "#eff6ff"
    },
    {
      title: "Tỷ Lệ Rời Bỏ Trung Bình",
      value: "26.54%",
      sub: "1,869 khách hàng churn",
      icon: AlertTriangle,
      color: "#dc2626",
      bgColor: "#fef2f2"
    },
    {
      title: "Doanh Thu Rủi Ro / Năm",
      value: "$1.67M",
      sub: "$139,130 USD / tháng",
      icon: DollarSign,
      color: "#d97706",
      bgColor: "#fffbeb"
    },
    {
      title: "Tỷ Suất ROI Giữ Chân",
      value: "6.1x",
      sub: "Doanh thu bảo toàn từ AI",
      icon: Sparkles,
      color: "#16a34a",
      bgColor: "#f0fdf4"
    }
  ];

  const features = [
    {
      title: "Dự Đoán Churn & AI Copilot",
      desc: "Chấm điểm xác suất rời mạng theo thời gian thực và tự động tạo kịch bản Telesales, Email giữ chân bằng AI.",
      badge: "Tích Hợp AI Mới",
      badgeColor: "#8b5cf6",
      icon: Brain,
      path: "/prediction",
      color: "#7c3aed"
    },
    {
      title: "Biểu Đồ & Xu Hướng Analytics",
      desc: "Trực quan hóa ma trận tương quan giữa hợp đồng, cước phí hàng tháng và tỷ lệ rời mạng của từng phân khúc.",
      badge: "Trực Quan Hóa",
      badgeColor: "#2563eb",
      icon: BarChart3,
      path: "/chart",
      color: "#2563eb"
    },
    {
      title: "Bộ Lọc Khách Hàng Churn",
      desc: "Phân loại khách hàng theo nhóm Churn Yes / No thông qua xử lý MapReduce để phân bổ cho đội ngũ CSKH.",
      badge: "MapReduce Filter",
      badgeColor: "#059669",
      icon: Filter,
      path: "/filter",
      color: "#059669"
    },
    {
      title: "Tra Cứu Khách Hàng Đa Tiêu Chí",
      desc: "Tìm kiếm chi tiết theo ID, loại dịch vụ mạng, hình thức thanh toán và hợp đồng với tốc độ truy xuất tối ưu.",
      badge: "Tìm Kiếm Nhanh",
      badgeColor: "#ea580c",
      icon: Search,
      path: "/search",
      color: "#ea580c"
    }
  ];

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Hệ Thống Phân Tích & Giữ Chân Khách Hàng Thông Minh</span>
        </div>
        <h1 className="hero-title">
          Chấm Điểm Rủi Ro Churn & <br />
          <span className="hero-highlight">Tối Ưu Hóa Kịch Bản Giữ Chân Bằng AI</span>
        </h1>
        <p className="hero-subtitle">
          Giải pháp toàn diện kết hợp Machine Learning dự đoán nguy cơ rời mạng và Trợ lý AI đề xuất kịch bản Telesales, 
          hỗ trợ doanh nghiệp bảo vệ dòng doanh thu định kỳ với tỷ suất sinh lời vượt trội.
        </p>
      </section>

      {/* KPI Cards Grid */}
      <section className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">{kpi.title}</span>
                <div className="kpi-icon-badge" style={{ backgroundColor: kpi.bgColor, color: kpi.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="kpi-sub">{kpi.sub}</div>
            </div>
          );
        })}
      </section>

      {/* Feature Navigation Cards */}
      <section className="features-grid">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div 
              key={idx} 
              className="feature-card" 
              onClick={() => navigate(feat.path)}
              role="button"
              tabIndex={0}
            >
              <div className="feature-top">
                <div className="feature-icon-box" style={{ color: feat.color, backgroundColor: `${feat.color}15` }}>
                  <Icon size={26} />
                </div>
                <span className="feature-badge" style={{ backgroundColor: `${feat.badgeColor}15`, color: feat.badgeColor }}>
                  {feat.badge}
                </span>
              </div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
              <div className="feature-action" style={{ color: feat.color }}>
                <span>Truy cập tính năng</span>
                <ArrowRight size={16} />
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
