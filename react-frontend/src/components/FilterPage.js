import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Users, ChevronLeft, ChevronRight, ArrowLeft, Search, CheckCircle, AlertTriangle } from 'lucide-react';

const FilterPage = () => {
  const [churnValue, setChurnValue] = useState('Yes');
  const [results, setResults] = useState({
    count: 0,
    customers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data from API
  const fetchFilteredData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://customer-prediction-bigdata.onrender.com';
      console.log('Fetching filtered data from:', `${apiUrl}/api/filter-churn?churn=${churnValue}`);
      const response = await fetch(`${apiUrl}/api/filter-churn?churn=${churnValue}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      const data = await response.json();
      console.log('Filtered data received:', data);
      setResults(data);
      setCurrentPage(1); // Reset to page 1 when filtering
    } catch (err) {
      console.error('Filter error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server Backend hoặc server đang khởi động. Vui lòng thử lại sau 30 giây.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchFilteredData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchFilteredData();
  };

  // Calculate pagination
  const totalItems = results.customers ? results.customers.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Get current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = results.customers ? results.customers.slice(startIndex, endIndex) : [];

  // Navigation functions
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Format total charges
  const formatTotalCharges = (value) => {
    if (!value || value === "Unknown") return "$0.00";
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : `$${numValue.toFixed(2)}`;
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header-title">
          <Filter className="title-icon" size={28} />
          Lọc Dữ Liệu Khách Hàng (Churn Filter)
        </h1>
        <p className="page-header-sub">
          Phân loại và trích xuất hồ sơ khách hàng theo trạng thái rời bỏ (Churn Yes / No) thông qua cơ chế phân mảnh dữ liệu Big Data.
        </p>
      </div>

      {/* Filter Form Card */}
      <div className="filter-card">
        <form onSubmit={handleSubmit}>
          <div className="filter-row">
            <div style={{ minWidth: '220px' }}>
              <label htmlFor="churnValue" className="form-label">
                Trạng Thái Rời Mạng (Churn Status):
              </label>
              <select
                id="churnValue"
                className="form-select"
                value={churnValue}
                onChange={(e) => setChurnValue(e.target.value)}
              >
                <option value="Yes">Yes (Khách hàng có nguy cơ rời mạng)</option>
                <option value="No">No (Khách hàng đang duy trì dịch vụ)</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Filter size={16} />
                {loading ? 'Đang Lọc...' : 'Áp Dụng Bộ Lọc'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      {/* Filter Stats Banner */}
      {!loading && !error && results.count !== undefined && (
        <div className="results-banner">
          <div>
            Tìm thấy <span className="results-count-chip">{results.count}</span> khách hàng có trạng thái Churn: <strong>{churnValue}</strong>
          </div>
          <div className="cell-muted">
            Hiển thị trang {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="cell-muted">Đang tải và lọc danh sách khách hàng từ máy chủ...</p>
        </div>
      )}

      {/* Results table */}
      {!loading && currentItems.length > 0 ? (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Mã KH</th>
                  <th>Hồ Sơ Khách Hàng</th>
                  <th>Thông Tin Hợp Đồng</th>
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
                        Tổng: {formatTotalCharges(customer.TotalCharges)}
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

          {/* Pagination controls */}
          <div className="pagination-container">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={16} /> Trang Trước
            </button>
            <span className="pagination-info">
              Trang {currentPage} trên {totalPages} ({totalItems} kết quả)
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
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>Không tìm thấy kết quả</h3>
            <p className="cell-muted">Thử thay đổi điều kiện lọc ở trên.</p>
          </div>
        )
      )}

      {/* Navigation buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate('/prediction')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} /> Quay Lại Dự Đoán Churn
        </button>
        <button
          onClick={() => navigate('/search')}
          className="btn btn-secondary"
        >
          <Search size={16} /> Chuyển Đến Tìm Kiếm Khách Hàng
        </button>
      </div>
    </div>
  );
};

export default FilterPage;
