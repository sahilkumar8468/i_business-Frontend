import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CashManagementPage from './pages/CashManagementPage';
import BusinessesPage from './pages/BusinessesPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import AssetsPage from './pages/AssetsPage';
import HomeExpensesPage from './pages/HomeExpensesPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cash" element={<CashManagementPage />} />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/businesses/:businessId" element={<BusinessDetailsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/expenses" element={<HomeExpensesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
