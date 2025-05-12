import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Candidates from './components/Candidates';
import Vacancies from './components/Vacancies';
import Settings from './components/Settings';
import NewVacancy from './components/NewVacancy';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/new-vacancy" element={<NewVacancy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 