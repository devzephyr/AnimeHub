import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/password', data)
};

// Titles API
export const titlesAPI = {
  getAll: (params) => api.get('/titles', { params }),
  getOne: (id) => api.get(`/titles/${id}`),
  create: (data) => api.post('/titles', data),
  update: (id, data) => api.put(`/titles/${id}`, data),
  delete: (id) => api.delete(`/titles/${id}`),
  getGenres: () => api.get('/titles/genres'),
  getTopRated: (params) => api.get('/titles/top-rated', { params })
};

// Reviews API
export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getOne: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getMyReview: (titleId) => api.get(`/reviews/my/${titleId}`)
};

// Watchlist API
export const watchlistAPI = {
  get: (params) => api.get('/watchlist', { params }),
  add: (data) => api.post('/watchlist', data),
  update: (titleId, data) => api.put(`/watchlist/${titleId}`, data),
  remove: (titleId) => api.delete(`/watchlist/${titleId}`),
  check: (titleId) => api.get(`/watchlist/check/${titleId}`),
  getStats: () => api.get('/watchlist/stats')
};

export default api;
