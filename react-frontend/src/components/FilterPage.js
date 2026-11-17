import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertTriangle,
  Download,
  ArrowRight
} from 'lucide-react';
import {
  getFilteredChurnCached,
  exportCustomersToCSV,
  PRIORITY_WATCHLIST
} from '../services/dataCache';

const FilterPage = () => {
  const [churnValue, setChurnValue] = useState('Yes');
  const [results, setResults] = useState({
    count: PRIORITY_WATCHLIST.length,
    customers: PRIORITY_WATCHLIST
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadFilteredData = useCallback(async (targetChurn) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFilteredChurnCached(targetChurn);
      setResults({
        count: data.count ?? (data.customers ? data.customers.length : 0),
        customers: data.customers || []
      });
      setCurrentPage(1);
    } catch (err) {
      console.error('Filter error:', err);
      setError("Đang hiển thị danh sách ưu tiên nội bộ. Máy chủ dữ liệu đang khởi động, vui lòng bấm lọc lại sau vài giây.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilteredData(churnValue);
  }, [churnValue, loadFilteredData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadFilteredData(churnValue);
  };

  const handleAnalyzeCustomer = (customer) => {
    navigate('/prediction', { state: { customer } });
  };

  // Calculate pagination
  const totalItems = results.customers ? results.customers.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = results.customers ? results.customers.slice(startIndex, endIndex) : [];

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatTotalCharges = (value) => {
    if (!value || value === "Unknown") return "$0.00";
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : `$${numValue.toFixed(2)}`;
  };

  return (
    <div className="page-wrapper">
      {/* Executive Header */}
      <div className="executive-header">
        <div>
          <div className="eyebrow-label">
            <Filter size={14} />
            <span>PHÂN KHÚC DỮ LIỆU KHÁCH HÀNG & XUẤT DANH SÁCH CRM</span>
          </div>
          <h1 className="page-header-title">
            Bộ Lọc Phân Khúc Thuê Bao Theo Trạng Thái Rời Mạng
          </h1>
          <p className="page-header-sub">
            Phân tách tập khách hàng rủi ro (Churn = Yes) và tập khách hàng ổn định (Churn = No) để triển khai chiến dịch giữ chân.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              exportCustomersToCSV(
                results.customers,
                `Phan_Khuc_Churn_${churnValue}_${results.count}_HoSo.csv`
              )
            }
            disabled={!results.customers || results.customers.length === 0}
          >
            <Download size={15} />
            <span>Xuất CSV ({results.count} hồ sơ)</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/search')}
          >
            <Search size={15} />
            <span>Tra Cứu Đa Tiêu Chí</span>
          </button>
        </div>
      </div>

      {/* Filter Control Card */}
      <div className="filter-card">
        <form onSubmit={handleSubmit}>
          <div className="filter-row">
            <div style={{ flex: 1, minWidth: '260px' }}>
              <label htmlFor="churnValue" className="form-label">
                Lựa Chọn Phân Khúc Trạng Thái (Churn Segment):
              </label>
              <select
                id="churnValue"
                className="form-select"
                value={churnValue}
                onChange={(e) => setChurnValue(e.target.value)}
              >
                <option value="Yes">Nhóm Rủi Ro Rời Mạng — Churn: Yes (Cần can thiệp CSKH)</option>
                <option value="No">Nhóm Duy Trì Dịch Vụ — Churn: No (Thuê bao ổn định)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Filter size={15} />
                <span>{loading ? 'Đang Đồng Bộ...' : 'Lọc Dữ Liệu'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Results Banner */}
      <div className="results-banner">
        <div>
          Phân khúc hiện tại: <strong>Churn = {churnValue}</strong> • Tổng số:{" "}
          <span className="results-count-chip">{results.count.toLocaleString('en-US')}</span> thuê bao
        </div>
        <div className="cell-muted">
          Đang hiển thị trang {currentPage} / {totalPages}
        </div>
      </div>

      {/* Data Table */}
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
                        Lũy kế: {formatTotalCharges(customer.TotalCharges)}
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
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem' }}>Không có bản ghi phù hợp</h3>
            <p className="cell-muted">Vui lòng chọn lại phân khúc lọc.</p>
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

export default FilterPage;
