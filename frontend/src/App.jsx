/**
 * Segmint — Main Application Routing
 * Complete multi-page analytics and ML workflow platform.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import SegmentsPage from './pages/SegmentsPage';
import CustomersPage from './pages/CustomersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelComparisonPage from './pages/ModelComparisonPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          {/* Landing / Workflow Hub */}
          <Route path="/" element={<LandingPage />} />

          {/* Setup, Upload & Ingestion */}
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/pipeline" element={<Navigate to="/setup" replace />} />

          {/* Intelligence & Analytics Views */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/segments" element={<SegmentsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/comparison" element={<ModelComparisonPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
