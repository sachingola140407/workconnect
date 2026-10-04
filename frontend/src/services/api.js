import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

export const getSocketUrl = () => {
  return import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '/';
};

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  toggleAvailability: (isAvailable) => api.patch('/users/availability', { isAvailable }),
  updateProfessionalProfile: (data) => api.put('/users/professional-profile', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  setUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  verifyProfessional: (id, isVerified) => api.patch(`/admin/professionals/${id}/verify`, { isVerified }),
  getProfessionalActivity: (params) => api.get('/admin/professionals/activity', { params }),
  getProfessionalJobHistory: (id) => api.get(`/admin/professionals/${id}/jobs`),
};

export const servicesAPI = {
  getAll: () => api.get('/services'),
};

export const professionalsAPI = {
  search: (params) => api.get('/professionals', { params }),
  getById: (id) => api.get(`/professionals/${id}`),
};

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings'),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  getTracking: (id) => api.get(`/bookings/${id}/track`),
  updateTrackingLocation: (id, data) => api.patch(`/bookings/${id}/track-location`, data),
};

export const paymentsAPI = {
  submitBill: (data) => api.post('/payments/submit-bill', data),
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  generateQR: (data) => api.post('/payments/generate-qr', data),
  markCashPaid: (data) => api.post('/payments/cash-customer-paid', data),
  confirmCashReceived: (data) => api.post('/payments/cash-pro-confirmed', data),
  settlePlatformFee: (data) => api.post('/payments/settle-platform-fee', data),
  getPayment: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getInvoice: (bookingId) => api.get(`/payments/invoice/${bookingId}`),
  getEarnings: () => api.get('/payments/earnings'),
  getAdminStats: () => api.get('/payments/admin-stats'),
};

export default api;
