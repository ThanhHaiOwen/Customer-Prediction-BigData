import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart3, Filter, Search, Shield } from 'lucide-react';
import { warmupAndPrefetch } from '../services/dataCache';

const Navbar = () => {
  useEffect(() => {
    // Khởi chạy nạp bộ nhớ đệm ngầm ngay khi mở ứng dụng để chuyển trang 0ms
    warmupAndPrefetch();
  }, []);

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <NavLink to="/" className="navbar-logo">
          <div className="logo-icon-box">
            <Shield size={18} />
          </div>
          <div>
            <span className="logo-title">TelcoGuard</span>
            <span className="logo-badge">Revenue & Churn Intelligence</span>
          </div>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={16} />
            <span>Tổng Quan Điều Hành</span>
          </NavLink>
          <NavLink to="/prediction" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={16} />
            <span>Dự Báo & Mô Phỏng</span>
          </NavLink>
          <NavLink to="/chart" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={16} />
            <span>Phân Tích Biểu Đồ</span>
          </NavLink>
          <NavLink to="/filter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Filter size={16} />
            <span>Phân Khúc Churn</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={16} />
            <span>Tra Cứu Hồ Sơ</span>
          </NavLink>
        </nav>

        <div className="navbar-status">
          <span className="status-dot" />
          <span>7,043 Hồ Sơ • Cache Active</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
