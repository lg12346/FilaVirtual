import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Auth
export const registerUser = (data) => apiClient.post('/auth/register', data);
export const loginUser = (data) => apiClient.post('/auth/login', data);
export const getProfile = () => apiClient.get('/auth/profile');

// Tickets
export const generateTicket = () => apiClient.post('/tickets/generate', {});
export const getCurrentTicket = () => apiClient.get('/tickets/current');
export const getTicketHistory = () => apiClient.get('/tickets/history');
export const getPublicTickets = () => apiClient.get('/tickets/public');

// Admin
export const getAdminTickets = () => apiClient.get('/admin/tickets');
export const callNextTicket = (counterNumber) => apiClient.post('/admin/call-next', { counterNumber });
export const callSpecificTicket = (ticketId, counterNumber) => apiClient.post('/admin/call-specific', { ticketId, counterNumber });
export const completeTicket = (ticketId) => apiClient.post('/admin/complete-ticket', { ticketId });
export const markNoShow = (ticketId) => apiClient.post('/admin/no-show', { ticketId });
export const getAdminStats = () => apiClient.get('/admin/stats');

export default apiClient;
