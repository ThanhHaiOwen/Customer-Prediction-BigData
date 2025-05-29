import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage'; // Import HomePage mới
import PredictionForm from './components/PredictionForm';
import FilterPage from './components/FilterPage';
import ChartPage from './components/chartPage';
import SearchCustomerPage from './components/search';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} /> {/* Thay đổi route mặc định thành HomePage */}
      <Route path="/prediction" element={<PredictionForm />} /> {/* Cập nhật đường dẫn */}
      <Route path="/filter" element={<FilterPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/search" element={<SearchCustomerPage />} />
    </Routes>
  );
}

export default App;