import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
      const response = await fetch(`${apiUrl}/api/filter-churn?churn=${churnValue}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }
      const data = await response.json();
      setResults(data);
      setCurrentPage(1); // Reset to page 1 when filtering
    } catch (err) {
      setError(err.message);
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  // Format total charges to handle variable formats
  const formatTotalCharges = (value) => {
    if (!value || value === "Unknown") return "$0.00";
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : `$${numValue.toFixed(2)}`;
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>LỌC DỮ LIỆU KHÁCH HÀNG THEO CHURN</h1>

      {/* Filter form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <label htmlFor="churnValue">Churn Status:</label>
        <select
          id="churnValue"
          value={churnValue}
          onChange={(e) => setChurnValue(e.target.value)}
          style={{ margin: '0 10px' }}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        <button type="submit">Apply Filter</button>
      </form>
      
      {/* Filter stats */}
      {!loading && !error && results.count !== undefined && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Found: {results.count} customers</strong> with Churn status: <strong>{churnValue}</strong>
        </div>
      )}

      {/* Loading indicator */}
      {loading && <p>Loading...</p>}

      {/* Error display */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Results table */}
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
                    <div>Total: {formatTotalCharges(customer.TotalCharges)}</div>
                    <div style={{ color: customer.Churn === 'Yes' ? 'red' : 'green' }}>
                      {customer.Churn === 'Yes' ? 'Churned' : 'Active'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
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
        // Show when no results
        !loading && !error && <p>No results found.</p>
      )}
      
      {/* Navigation buttons */}
      <div style={{ marginTop: '20px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{ 
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer' 
          }}
        >
          ← Back to Prediction
        </button>
        
        {/* Search page button */}
        <button
          onClick={() => navigate('/search')}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer' 
          }}
        >
          Go to Search Page
        </button>
      </div>
    </div>
  );
};

export default FilterPage;