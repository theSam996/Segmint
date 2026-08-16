/**
 * Segmint — Sidebar Navigation
 */

import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPipelineStatus } from '../../api/client';

export default function Sidebar() {
  const [pipelineStatus, setPipelineStatus] = useState('idle');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await getPipelineStatus();
        setPipelineStatus(res.data.status);
      } catch {
        // API not reachable
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <div className="sidebar-brand-icon">◆</div>
        <div className="sidebar-brand-text">
          <h1>Segmint</h1>
          <p>RFM Analytics & ML</p>
        </div>
      </NavLink>

      <nav className="sidebar-nav">
        <span className="sidebar-label">Workflow</span>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">🏠</span>
          <span>Home & Workflow</span>
        </NavLink>

        <NavLink
          to="/setup"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">🚀</span>
          <span>Upload & Ingestion</span>
        </NavLink>

        <span className="sidebar-label">Intelligence</span>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/segments"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">🎯</span>
          <span>Segments & Actions</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">👥</span>
          <span>Customers</span>
        </NavLink>

        <span className="sidebar-label">Analytics & Science</span>

        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">📈</span>
          <span>Deep Analytics</span>
        </NavLink>

        <NavLink
          to="/comparison"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">⚖️</span>
          <span>Model Comparison</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className={`status-dot ${pipelineStatus}`}></span>
          <span>
            {pipelineStatus === 'completed' ? 'Pipeline: Ready' :
             pipelineStatus === 'running' ? 'Pipeline: Processing...' :
             pipelineStatus === 'error' ? 'Pipeline: Error' : 'Pipeline: Idle'}
          </span>
        </div>
      </div>
    </aside>
  );
}
