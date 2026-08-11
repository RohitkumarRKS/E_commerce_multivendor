import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
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

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getSellerProfile: (id) => api.get(`/users/seller/${id}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

// Brand APIs
export const brandAPI = {
  getAll: () => api.get('/brands'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/brands', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/brands', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/brands/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.put(`/brands/${id}`, data);
  },
  delete: (id) => api.delete(`/brands/${id}`),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getSellerProducts: (params) => api.get('/products/seller/mine', { params }),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        data.images.forEach((img) => formData.append('images', img));
      } else if (key === 'specifications') {
        formData.append('specifications', JSON.stringify(data.specifications));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images' && Array.isArray(data.images)) {
        data.images.forEach((img) => formData.append('images', img));
      } else if (key === 'specifications') {
        formData.append('specifications', JSON.stringify(data.specifications));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1) => api.post('/cart/add', { productId, quantity }),
  update: (itemId, quantity) => api.put(`/cart/update/${itemId}`, { quantity }),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/mine', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getSellerOrders: (params) => api.get('/orders/seller', { params }),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (orderId) => api.post('/payment/create-order', { orderId }),
  verify: (data) => api.post('/payment/verify', data),
};

// Banner APIs
export const bannerAPI = {
  getAll: () => api.get('/banners'),
};

// Review APIs
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (productId, data) => api.post(`/reviews/product/${productId}`, data),
};

// Promo Code APIs
export const promoAPI = {
  getAll: () => api.get('/promo'),
  create: (data) => api.post('/promo', data),
  update: (id, data) => api.put(`/promo/${id}`, data),
  delete: (id) => api.delete(`/promo/${id}`),
  validate: (data) => api.post('/promo/validate', data),
  getAvailable: () => api.get('/promo/available'),
};

// Return & Refund APIs
export const returnAPI = {
  request: (data) => api.post('/returns/request', data),
  getMyReturns: () => api.get('/returns/my-returns'),
  getSellerReturns: () => api.get('/returns/seller-returns'),
  getAllReturns: () => api.get('/returns/all-returns'),
  updateStatus: (id, data) => api.put(`/returns/${id}/status`, data),
};

// Email & Notification Control APIs (SuperAdmin)
export const emailAPI = {
  getLogs: (params) => api.get('/email/logs', { params }),
  getSettings: () => api.get('/email/settings'),
  updateSettings: (data) => api.put('/email/settings', data),
  sendTest: (data) => api.post('/email/test', data),
};

export default api;
