import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PredictionForm from './components/PredictionForm';
import FilterPage from './components/FilterPage';
import ChartPage from './components/chartPage';
import SearchCustomerPage from './components/search';

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prediction" element={<PredictionForm />} />
          <Route path="/filter" element={<FilterPage />} />
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/search" element={<SearchCustomerPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
