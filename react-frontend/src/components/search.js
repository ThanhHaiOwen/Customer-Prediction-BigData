import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, ChevronLeft, ChevronRight, ArrowLeft, Filter, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const SearchCustomerPage = () => {
  const [searchParams, setSearchParams] = useState({
    customerID: '',
    totalChargesMin: '',
    totalChargesMax: '',
    contract: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Search API
  const searchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (searchParams.customerID) queryParams.append('customerID', searchParams.customerID);
      if (searchParams.totalChargesMin) queryParams.append('totalChargesMin', searchParams.totalChargesMin);
      if (searchParams.totalChargesMax) queryParams.append('totalChargesMax', searchParams.totalChargesMax);
      if (searchParams.contract) queryParams.append('contract', searchParams.contract);

      const apiUrl = process.env.REACT_APP_API_URL || 'https://customer-prediction-bigdata.onrender.com';
      console.log('Searching customers from:', `${apiUrl}/api/search-customers?${queryParams.toString()}`);
      const response = await fetch(`${apiUrl}/api/search-customers?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      console.log('Search results:', data);
      setResults(data.customers || []);
      setCurrentPage(1); // Reset to page 1 on new search
    } catch (err) {
      console.error('Search error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server Backend hoặc server đang khởi động. Vui lòng thử lại sau 30 giây.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial search on mount
  useEffect(() => {
    searchCustomers();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchCustomers();
  };

  // Pagination calculation
  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Current page records
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = results.slice(startIndex, endIndex);

  // Navigation handlers
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset form
  const resetForm = () => {
    setSearchParams({
      customerID: '',
      totalChargesMin: '',
      totalChargesMax: '',
      contract: ''
    });
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header-title">
          <Search className="title-icon" size={28} />
          Tra Cứu Khách Hàng Đa Tiêu Chí (Customer Search)
        </h1>
        <p className="page-header-sub">
          Tìm kiếm nhanh chóng hồ sơ khách hàng theo ID, loại hợp đồng và phạm vi cước phí tích lũy (Total Charges).
        </p>
      </div>

      {/* Search Form Card */}
      <div className="search-card">
        <form onSubmit={handleSubmit}>
          <div className="search-grid">
            <div>
              <label htmlFor="customerID" className="form-label">Mã Khách Hàng (Customer ID):</label>
              <input
                type="text"
                id="customerID"
                name="customerID"
                className="form-input"
                placeholder="Ví dụ: 7590-VHVEG"
                value={searchParams.customerID}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="contract" className="form-label">Loại Hợp Đồng (Contract Type):</label>
              <select
                id="contract"
                name="contract"
                className="form-select"
                value={searchParams.contract}
                onChange={handleChange}
              >
                <option value="">Tất Cả Loại Hợp Đồng</option>
                <option value="Month-to-month">Month-to-month (Từng tháng)</option>
                <option value="One year">One year (1 năm)</option>
                <option value="Two year">Two year (2 năm)</option>
              </select>
            </div>

            <div>
              <label htmlFor="totalChargesMin" className="form-label">Tổng Cước Tối Thiểu ($ Min):</label>
              <input
                type="number"
                id="totalChargesMin"
                name="totalChargesMin"
                min="0"
                className="form-input"
                placeholder="0"
                value={searchParams.totalChargesMin}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="totalChargesMax" className="form-label">Tổng Cước Tối Đa ($ Max):</label>
              <input
                type="number"
                id="totalChargesMax"
                name="totalChargesMax"
                min="0"
                className="form-input"
                placeholder="9000"
                value={searchParams.totalChargesMax}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
            >
              <RotateCcw size={16} /> Đặt Lại Form
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <Search size={16} /> {loading ? 'Đang Tìm...' : 'Tìm Kiếm'}
            </button>
          </div>
        </form>
      </div>

      {/* Error alert */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Results banner */}
      {!loading && !error && (
        <div className="results-banner">
          <div>
            Tìm thấy <span className="results-count-chip">{totalItems}</span> khách hàng phù hợp điều kiện
          </div>
          <div className="cell-muted">
            Hiển thị trang {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="cell-muted">Đang tìm kiếm hồ sơ khách hàng trong cơ sở dữ liệu...</p>
        </div>
      )}

      {/* Results Table */}
      {!loading && currentItems.length > 0 ? (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Mã KH</th>
                  <th>Hồ Sơ Khách Hàng</th>
                  <th>Thông Tin Dịch Vụ & Hợp Đồng</th>
                  <th style={{ width: '160px' }}>Cước Phí & Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((customer, index) => (
                  <tr key={customer.CustomerID || index}>
                    <td>
                      <span className="badge-customer-id">
                        {customer.CustomerID || `KH-${index}`}
                      </span>
                    </td>
                    <td>
                      <div className="cell-info-line">
                        <strong>{customer.gender || 'N/A'}</strong> • {customer.SeniorCitizen === 1 ? 'Người cao tuổi' : 'Khách phổ thông'}
                      </div>
                      <div className="cell-info-line cell-muted">
                        Đối tác: {customer.Partner || 'No'} • Người phụ thuộc: {customer.Dependents || 'No'}
                      </div>
                      <div className="cell-info-line cell-muted">
                        Thời gian gắn bó: <strong>{customer.tenure} tháng</strong>
                      </div>
                    </td>
                    <td>
                      <div className="cell-info-line">
                        Internet: <strong>{customer.InternetService}</strong>
                      </div>
                      <div className="cell-info-line cell-muted">
                        Hợp đồng: {customer.Contract}
                      </div>
                      <div className="cell-info-line cell-muted">
                        Thanh toán: {customer.PaymentMethod}
                      </div>
                    </td>
                    <td>
                      <div className="cell-info-line" style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                        ${customer.MonthlyCharges}/tháng
                      </div>
                      <div className="cell-info-line cell-muted" style={{ marginBottom: '0.5rem' }}>
                        Tổng: ${customer.TotalCharges}
                      </div>
                      <div>
                        {customer.Churn === 'Yes' ? (
                          <span className="badge-churn-yes">
                            <AlertTriangle size={13} /> Churned
                          </span>
                        ) : (
                          <span className="badge-churn-no">
                            <CheckCircle size={13} /> Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} /> Trang Trước
            </button>
            <span className="pagination-info">
              Trang {currentPage} trên {totalPages} ({totalItems} hồ sơ)
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Trang Sau <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        !loading && !error && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Users size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Không tìm thấy khách hàng nào</h3>
            <p className="cell-muted">Vui lòng điều chỉnh lại tiêu chí tìm kiếm hoặc bấm "Đặt Lại Form".</p>
          </div>
        )
      )}

      {/* Navigation action buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate('/prediction')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} /> Quay Lại Dự Đoán Churn
        </button>
        <button
          onClick={() => navigate('/filter')}
          className="btn btn-secondary"
        >
          <Filter size={16} /> Chuyển Đến Bộ Lọc Churn
        </button>
      </div>
    </div>
  );
};

export default SearchCustomerPage;
