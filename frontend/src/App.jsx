/**
 * Segmint — Main Application
 * React Router setup with sidebar navigation.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import PipelinePage from './pages/PipelinePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
