import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor to add Auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  adminLogin: async (credentials: any) => {
    const response = await api.post('/admin/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};

export const businessService = {
  createBusiness: async (data: any) => {
    const response = await api.post('/businesses', data);
    return response.data;
  },
  getBusinesses: async () => {
    const response = await api.get('/businesses');
    return response.data;
  }
};

export default api;
