import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Mỗi trang 10 record

  // Hàm cập nhật thông tin tìm kiếm
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gọi API tìm kiếm khách hàng
  const searchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Xây dựng query string từ các tham số tìm kiếm
      const queryParams = new URLSearchParams();
      if (searchParams.customerID) queryParams.append('customerID', searchParams.customerID);
      if (searchParams.totalChargesMin) queryParams.append('totalChargesMin', searchParams.totalChargesMin);
      if (searchParams.totalChargesMax) queryParams.append('totalChargesMax', searchParams.totalChargesMax);
      if (searchParams.contract) queryParams.append('contract', searchParams.contract);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      console.log('Searching customers from:', `${apiUrl}/api/search-customers?${queryParams.toString()}`);
      const response = await fetch(`${apiUrl}/api/search-customers?${queryParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      const data = await response.json();
      console.log('Search results:', data);
      setResults(data.customers || []);
      setCurrentPage(1); // Reset về trang 1 sau mỗi lần tìm kiếm
    } catch (err) {
      console.error('Search error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không!");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Gọi tìm kiếm lần đầu khi load trang (không có bộ lọc)
  useEffect(() => {
    searchCustomers();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    searchCustomers();
  };

  // Tính toán phân trang
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Lấy dữ liệu trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = results.slice(startIndex, endIndex);

  // Hàm chuyển trang
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Hàm reset form tìm kiếm
  const resetForm = () => {
    setSearchParams({
      customerID: '',
      totalChargesMin: '',
      totalChargesMax: '',
      contract: ''
    });
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Customer Search</h1>
      <p>Search and filter customers by ID, charges, and contract type</p>

      {/* Form tìm kiếm */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '15px' }}>
          <div>
            <label htmlFor="customerID">Customer ID:</label>
            <input
              type="text"
              id="customerID"
              name="customerID"
              value={searchParams.customerID}
              onChange={handleChange}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </div>
          
          <div>
            <label htmlFor="contract">Contract Type:</label>
            <select
              id="contract"
              name="contract"
              value={searchParams.contract}
              onChange={handleChange}
              style={{ margin: '0 10px', padding: '5px' }}
            >
              <option value="">All Contracts</option>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="totalChargesMin">Min Total Charges ($):</label>
            <input
              type="number"
              id="totalChargesMin"
              name="totalChargesMin"
              min="0"
              value={searchParams.totalChargesMin}
              onChange={handleChange}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </div>
          
          <div>
            <label htmlFor="totalChargesMax">Max Total Charges ($):</label>
            <input
              type="number"
              id="totalChargesMax"
              name="totalChargesMax"
              min="0"
              value={searchParams.totalChargesMax}
              onChange={handleChange}
              style={{ margin: '0 10px', padding: '5px' }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Search
          </button>
          <button type="button" onClick={resetForm} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Error */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Hiển thị số lượng kết quả */}
      {!loading && !error && (
        <p>Found {totalItems} customer(s)</p>
      )}

      {/* Bảng kết quả */}
      {currentItems.length > 0 ? (
        <>
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{ width: '100%', tableLayout: 'auto' }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer Info</th>
                <th>Contract Info</th>
                <th>Charges</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((customer, index) => (
                <tr key={customer.CustomerID || index}>
                  <td>{customer.CustomerID}</td>
                  <td>
                    <div>
                      <strong>{customer.gender}</strong> •{' '}
                      {customer.SeniorCitizen === 1 ? 'Senior' : 'Regular'}
                    </div>
                    <div>Partner: {customer.Partner} • Dependents: {customer.Dependents}</div>
                    <div>Tenure: {customer.tenure} months</div>
                  </td>
                  <td>
                    <div>Internet: {customer.InternetService}</div>
                    <div>Contract: {customer.Contract}</div>
                    <div>Payment: {customer.PaymentMethod}</div>
                  </td>
                  <td>
                    <div>${customer.MonthlyCharges}/mo</div>
                    <div>Total: ${customer.TotalCharges}</div>
                    <div style={{ color: customer.Churn === 'Yes' ? 'red' : 'green' }}>
                      {customer.Churn === 'Yes' ? 'Churned' : 'Active'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nút chuyển trang */}
          <div style={{ marginTop: '10px' }}>
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span style={{ margin: '0 10px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      ) : (
        // Hiển thị nếu không có kết quả
        !loading && !error && <p>No results found.</p>
      )}

      <div className="min-h-screen bg-stone-50 text-stone-800 p-6">
        {/* Nút Back */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          ← Back to Prediction
        </button>

        {/* Nút chuyển đến trang Filter */}
        <button
          onClick={() => navigate('/filter')}
          className="mb-4 ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Go to Filter Page
        </button>
      </div>
    </div>
  );
};

export default SearchCustomerPage;