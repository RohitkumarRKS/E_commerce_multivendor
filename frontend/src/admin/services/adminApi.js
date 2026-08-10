import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (!window.location.pathname.includes('/superadmin@2026/login')) {
        window.location.href = '/superadmin@2026/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: (data) => adminApi.post('/auth/admin/login', data),
  getMe: () => adminApi.get('/auth/me'),
};

export const adminStatsAPI = {
  getStats: () => adminApi.get('/admin/stats'),
};

export const adminCategoryAPI = {
  getAll: () => adminApi.get('/categories/all'),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return adminApi.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    return adminApi.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id) => adminApi.delete(`/categories/${id}`),
};

export const adminProductAPI = {
  getAll: (params) => adminApi.get('/products', { params }),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'images') {
        data.images.forEach((img) => formData.append('images', img));
      } else {
        formData.append(key, data[key]);
      }
    });
    return adminApi.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => adminApi.put(`/products/${id}`, data),
  delete: (id) => adminApi.delete(`/products/${id}`),
};

export const adminUserAPI = {
  getAll: (params) => adminApi.get('/users', { params }),
  update: (id, data) => adminApi.put(`/users/${id}`, data),
  delete: (id) => adminApi.delete(`/users/${id}`),
};

export const adminOrderAPI = {
  getAll: (params) => adminApi.get('/orders', { params }),
  updateStatus: (id, status) => adminApi.put(`/orders/${id}/status`, { status }),
};

export const adminBannerAPI = {
  getAll: () => adminApi.get('/banners/all'),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return adminApi.post('/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  update: (id, data) => adminApi.put(`/banners/${id}`, data),
  delete: (id) => adminApi.delete(`/banners/${id}`),
};

export default adminApi;
