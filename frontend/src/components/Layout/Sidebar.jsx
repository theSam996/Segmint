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
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">◆</div>
        <div className="sidebar-brand-text">
          <h1>Segmint</h1>
          <p>RFM Analytics</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">Analytics</span>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/customers"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">👥</span>
          <span>Customers</span>
        </NavLink>

        <span className="sidebar-label">System</span>

        <NavLink
          to="/pipeline"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span className="nav-link-icon">⚙️</span>
          <span>Pipeline</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className={`status-dot ${pipelineStatus}`}></span>
          <span>
            Pipeline: {pipelineStatus === 'completed' ? 'Ready' :
              pipelineStatus === 'running' ? 'Running...' :
              pipelineStatus === 'error' ? 'Error' : 'Idle'}
          </span>
        </div>
      </div>
    </aside>
  );
}
