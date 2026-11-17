import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Filter,
  CheckCircle,
  AlertTriangle,
  Users,
  Download,
  ArrowRight
} from 'lucide-react';
import {
  searchCustomersCached,
  exportCustomersToCSV,
  PRIORITY_WATCHLIST
} from '../services/dataCache';

const SearchCustomerPage = () => {
  const [searchParams, setSearchParams] = useState({
    customerID: '',
    totalChargesMin: '',
    totalChargesMax: '',
    contract: ''
  });
  const [results, setResults] = useState(PRIORITY_WATCHLIST);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const executeSearch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchCustomersCached(params);
      setResults(data.customers || []);
      setCurrentPage(1);
    } catch (err) {
      console.error('Search error:', err);
      setError("Đang hiển thị dữ liệu đệm nội bộ. Máy chủ đang khởi động, vui lòng thử lại sau vài giây.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch({
      customerID: '',
      totalChargesMin: '',
      totalChargesMax: '',
      contract: ''
    });
  }, [executeSearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...searchParams,
      [name]: value
    };
    setSearchParams(updated);
    // Tìm kiếm tức thì trong RAM khi thay đổi bộ lọc
    executeSearch(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchParams);
  };

  const resetForm = () => {
    const emptyParams = {
      customerID: '',
      totalChargesMin: '',
      totalChargesMax: '',
      contract: ''
    };
    setSearchParams(emptyParams);
    executeSearch(emptyParams);
  };

  const handleAnalyzeCustomer = (customer) => {
    navigate('/prediction', { state: { customer } });
  };

  // Pagination
  const totalItems = results.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = results.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="page-wrapper">
      {/* Executive Header */}
      <div className="executive-header">
        <div>
          <div className="eyebrow-label">
            <Search size={14} />
            <span>TRUY VẤN CƠ SỞ DỮ LIỆU THUÊ BAO THỜI GIAN THỰC</span>
          </div>
          <h1 className="page-header-title">
            Tra Cứu Hồ Sơ Khách Hàng Đa Tiêu Chí
          </h1>
          <p className="page-header-sub">
            Tìm kiếm tức thì theo mã định danh thuê bao, loại kỳ hạn hợp đồng và biên độ tổng doanh thu lũy kế (LTV).
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              exportCustomersToCSV(results, `Ket_Qua_Tra_Cuu_${results.length}_HoSo.csv`)
            }
            disabled={results.length === 0}
          >
            <Download size={15} />
            <span>Xuất CSV ({results.length.toLocaleString('en-US')} hồ sơ)</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/filter')}
          >
            <Filter size={15} />
            <span>Phân Khúc Churn</span>
          </button>
        </div>
      </div>

      {/* Search Form Card */}
      <div className="search-card">
        <form onSubmit={handleSubmit}>
          <div className="search-grid">
            <div>
              <label htmlFor="customerID" className="form-label">Mã Thuê Bao (Customer ID):</label>
              <input
                type="text"
                id="customerID"
                name="customerID"
                className="form-input"
                placeholder="Nhập mã (VD: 7590-VHVEG)..."
                value={searchParams.customerID}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="contract" className="form-label">Kỳ Hạn Hợp Đồng (Contract):</label>
              <select
                id="contract"
                name="contract"
                className="form-select"
                value={searchParams.contract}
                onChange={handleChange}
              >
                <option value="">Tất Cả Kỳ Hạn Hợp Đồng</option>
                <option value="Month-to-month">Month-to-month (Theo tháng)</option>
                <option value="One year">One year (Kỳ hạn 1 năm)</option>
                <option value="Two year">Two year (Kỳ hạn 2 năm)</option>
              </select>
            </div>

            <div>
              <label htmlFor="totalChargesMin" className="form-label">Tổng Chi Tiêu Tối Thiểu ($ Min):</label>
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
              <label htmlFor="totalChargesMax" className="form-label">Tổng Chi Tiêu Tối Đa ($ Max):</label>
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

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={resetForm} className="btn btn-secondary">
              <RotateCcw size={15} /> Đặt Lại Bộ Lọc
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={15} /> {loading ? 'Đang Truy Vấn...' : 'Áp Dụng Truy Vấn'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Results Banner */}
      <div className="results-banner">
        <div>
          Kết quả truy vấn:{" "}
          <span className="results-count-chip">{totalItems.toLocaleString('en-US')}</span> hồ sơ khớp điều kiện
        </div>
        <div className="cell-muted">
          Đang hiển thị trang {currentPage} / {totalPages}
        </div>
      </div>

      {/* Results Table */}
      {currentItems.length > 0 ? (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>Mã Thuê Bao</th>
                  <th>Thông Tin Nhân Khẩu & Gắn Bó</th>
                  <th>Hạ Tầng & Kỳ Hạn Hợp Đồng</th>
                  <th style={{ width: '170px' }}>Cước Phí & Trạng Thái</th>
                  <th style={{ width: '175px', textAlign: 'right' }}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((customer, index) => (
                  <tr key={customer.CustomerID || index}>
                    <td>
                      <span className="badge-customer-id">
                        {customer.CustomerID || customer.customerID || `KH-${index}`}
                      </span>
                    </td>
                    <td>
                      <div className="cell-info-line">
                        <strong>{customer.gender || 'N/A'}</strong> •{' '}
                        {customer.SeniorCitizen === 1 ? 'Khách cao tuổi' : 'Khách phổ thông'}
                      </div>
                      <div className="cell-info-line cell-muted">
                        Gia đình: {customer.Partner === 'Yes' ? 'Có đối tác' : 'Độc thân'} • Phụ thuộc: {customer.Dependents}
                      </div>
                      <div className="cell-info-line cell-muted">
                        Thời gian gắn bó: <strong>{customer.tenure} tháng</strong>
                      </div>
                    </td>
                    <td>
                      <div className="cell-info-line">
                        Hạ tầng: <strong>{customer.InternetService}</strong>
                      </div>
                      <div className="cell-info-line cell-muted">
                        Hợp đồng: <strong>{customer.Contract}</strong>
                      </div>
                      <div className="cell-info-line cell-muted">
                        Thanh toán: {customer.PaymentMethod}
                      </div>
                    </td>
                    <td>
                      <div className="cell-info-line" style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        ${Number(customer.MonthlyCharges || 0).toFixed(2)}/tháng
                      </div>
                      <div className="cell-info-line cell-muted" style={{ marginBottom: '0.35rem', fontVariantNumeric: 'tabular-nums' }}>
                        Lũy kế: ${customer.TotalCharges}
                      </div>
                      <div>
                        {customer.Churn === 'Yes' ? (
                          <span className="badge-churn-yes">
                            <AlertTriangle size={12} /> Churned
                          </span>
                        ) : (
                          <span className="badge-churn-no">
                            <CheckCircle size={12} /> Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-action-row"
                        onClick={() => handleAnalyzeCustomer(customer)}
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

          <div className="pagination-container">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              <ChevronLeft size={15} /> Trang Trước
            </button>
            <span className="pagination-info">
              Trang {currentPage} / {totalPages} ({totalItems.toLocaleString('en-US')} bản ghi)
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Trang Sau <ChevronRight size={15} />
            </button>
          </div>
        </>
      ) : (
        !loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Users size={36} style={{ color: '#a1a1aa', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem' }}>Không tìm thấy bản ghi khớp điều kiện</h3>
            <p className="cell-muted">Vui lòng điều chỉnh lại tiêu chí hoặc bấm "Đặt Lại Bộ Lọc".</p>
          </div>
        )
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <ArrowLeft size={15} /> Quay Lại Bảng Điều Khiển
        </button>
      </div>
    </div>
  );
};

export default SearchCustomerPage;
