/**
 * Segmint — API Client
 * Axios wrapper for backend communication.
 */

import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for pipeline runs
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Health ---
export const getHealth = () => api.get('/health');

// --- Pipeline ---
export const getPipelineStatus = () => api.get('/pipeline/status');
export const runPipeline = () => api.post('/pipeline/run');

// --- Customers ---
export const getCustomers = (params = {}) => api.get('/customers', { params });
export const getCustomer = (customerId) => api.get(`/customers/${customerId}`);

// --- Clusters ---
export const getClusterSummary = () => api.get('/clusters/summary');
export const getPCAData = () => api.get('/clusters/pca');
export const getDistribution = (metric = 'monetary') =>
  api.get('/clusters/distribution', { params: { metric } });

export default api;
