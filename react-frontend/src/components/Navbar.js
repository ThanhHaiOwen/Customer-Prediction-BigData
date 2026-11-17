import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Brain, Filter, BarChart3, Search, Sparkles } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <NavLink to="/" className="navbar-logo">
          <div className="logo-icon-box">
            <Sparkles className="logo-icon" size={22} />
          </div>
          <div>
            <span className="logo-title">ChurnGuard AI</span>
            <span className="logo-badge">Retention Copilot</span>
          </div>
        </NavLink>

        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Home size={18} />
            <span>Tổng Quan</span>
          </NavLink>
          <NavLink to="/prediction" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Brain size={18} />
            <span>Dự Đoán & AI Copilot</span>
          </NavLink>
          <NavLink to="/chart" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Biểu Đồ Analytics</span>
          </NavLink>
          <NavLink to="/filter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Filter size={18} />
            <span>Lọc Khách Hàng</span>
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search size={18} />
            <span>Tìm Kiếm</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
