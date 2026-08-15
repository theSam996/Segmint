/**
 * Segmint — Customers Page
 * Search, browse, and inspect individual customer segments.
 */

import { useState, useEffect, useCallback } from 'react';
import { getCustomers, getCustomer } from '../api/client';
import { formatCurrency, formatNumber, formatDays } from '../utils/formatters';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('monetary');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 30, sort_by: sortBy, sort_order: sortOrder };
      if (search) params.search = search;
      const res = await getCustomers(params);
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(loadCustomers, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const selectCustomer = async (customerId) => {
    setDetailLoading(true);
    try {
      const res = await getCustomer(customerId);
      setSelectedCustomer(res.data);
    } catch {
      setSelectedCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ opacity: 0.2 }}>↕</span>;
    return <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>;
  };

  if (error && !customers.length) {
    return (
      <div className="main-content">
        <div className="page-header">
          <h2>Customers</h2>
          <p>Individual customer lookup & search</p>
        </div>
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No Customer Data</h3>
            <p>{error}</p>
            <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/pipeline'}>
              Go to Pipeline →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h2>Customers</h2>
        <p>Browse and search {formatNumber(total)} segmented customers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '1fr 380px' : '1fr', gap: 'var(--space-6)' }}>
        {/* Customer Table */}
        <div className="card">
          <div className="card-header">
            <div className="search-bar" style={{ flex: 1, maxWidth: '400px' }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by Customer ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {formatNumber(total)} results
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div className="flex-center" style={{ padding: '60px' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('customer_id')} style={{ cursor: 'pointer' }}>
                      ID <SortIcon field="customer_id" />
                    </th>
                    <th>Segment</th>
                    <th onClick={() => handleSort('recency')} style={{ cursor: 'pointer' }}>
                      Recency <SortIcon field="recency" />
                    </th>
                    <th onClick={() => handleSort('frequency')} style={{ cursor: 'pointer' }}>
                      Frequency <SortIcon field="frequency" />
                    </th>
                    <th onClick={() => handleSort('monetary')} style={{ cursor: 'pointer' }}>
                      Monetary <SortIcon field="monetary" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.customer_id}
                      onClick={() => selectCustomer(c.customer_id)}
                      style={{
                        cursor: 'pointer',
                        background: selectedCustomer?.customer_id === c.customer_id
                          ? 'rgba(124, 58, 237, 0.08)' : undefined,
                      }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {c.customer_id}
                      </td>
                      <td>
                        <span className="persona-tag">
                          <span>{c.persona_icon}</span>
                          {c.persona}
                        </span>
                      </td>
                      <td>{formatDays(c.recency)}</td>
                      <td>{formatNumber(c.frequency)}</td>
                      <td style={{ color: 'var(--accent-emerald-light)', fontWeight: 600 }}>
                        {formatCurrency(c.monetary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) {
                  p = i + 1;
                } else if (page <= 3) {
                  p = i + 1;
                } else if (page >= totalPages - 2) {
                  p = totalPages - 4 + i;
                } else {
                  p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    className={page === p ? 'active' : ''}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Customer Detail Panel */}
        {selectedCustomer && (
          <div className="card" style={{ alignSelf: 'start', animation: 'slideInLeft 0.3s ease' }}>
            <div className="card-header">
              <h3>Customer #{selectedCustomer.customer_id}</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-center" style={{ padding: '40px' }}>
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="card-body">
                {/* Persona Badge */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>
                    {selectedCustomer.persona_icon}
                  </div>
                  <span
                    className="persona-tag"
                    style={{
                      background: `${selectedCustomer.persona_color}20`,
                      color: selectedCustomer.persona_color,
                      borderColor: `${selectedCustomer.persona_color}40`,
                      fontSize: 'var(--text-sm)',
                      padding: '6px 16px',
                    }}
                  >
                    {selectedCustomer.persona}
                  </span>
                </div>

                {/* RFM Metrics */}
                <div className="customer-detail">
                  <div className="customer-rfm-metric card" style={{ background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div className="rfm-label">Recency</div>
                    <div className="rfm-value" style={{ color: 'var(--accent-amber-light)' }}>
                      {Math.round(selectedCustomer.recency)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>days</div>
                  </div>
                  <div className="customer-rfm-metric card" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                    <div className="rfm-label">Frequency</div>
                    <div className="rfm-value" style={{ color: 'var(--accent-blue-light)' }}>
                      {Math.round(selectedCustomer.frequency)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>orders</div>
                  </div>
                  <div className="customer-rfm-metric card" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div className="rfm-label">Monetary</div>
                    <div className="rfm-value" style={{ color: 'var(--accent-emerald-light)' }}>
                      {formatCurrency(selectedCustomer.monetary)}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>total spent</div>
                  </div>
                </div>

                {/* Recommended Action */}
                <div style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  background: 'rgba(124, 58, 237, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(124, 58, 237, 0.12)',
                }}>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--accent-purple-light)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 'var(--space-2)',
                  }}>
                    💡 Recommended Action
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {selectedCustomer.action}
                  </div>
                </div>

                {/* Cluster Info */}
                <div style={{
                  marginTop: 'var(--space-4)',
                  display: 'flex',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}>
                  <span>K-Means: Cluster {selectedCustomer.kmeans_cluster}</span>
                  <span>·</span>
                  <span>DBSCAN: Cluster {selectedCustomer.dbscan_cluster}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
