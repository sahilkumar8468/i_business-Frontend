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
  userLogin: async (credentials: any) => {
    const response = await api.post('/users/login', credentials);
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
  },
  getBusinessDetails: async (businessId: string) => {
    const response = await api.get(`/businesses/${businessId}`);
    return response.data;
  },
  updateBusinessConfig: async (businessId: string, config: any) => {
    const response = await api.patch(`/businesses/${businessId}/config`, { config });
    return response.data;
  },
  addBusinessEntry: async (businessId: string, entryData: any) => {
    const response = await api.post(`/businesses/${businessId}/entries`, entryData);
    return response.data;
  },
  getBusinessEntries: async (businessId: string, params: any) => {
    const response = await api.get(`/businesses/${businessId}/entries`, { params });
    return response.data;
  },
  getBusinessProfit: async (businessId: string, userId?: string) => {
    const params = userId ? { userId } : {};
    const response = await api.get(`/businesses/${businessId}/profit`, { params });
    return response.data;
  },
  getBusinessPartners: async (businessId: string) => {
    const response = await api.get(`/businesses/${businessId}/partners`);
    return response.data;
  },
  updateBusinessPartners: async (businessId: string, partners: any[]) => {
    const response = await api.post(`/businesses/${businessId}/partners`, { partners });
    return response.data;
  },
  joinBusiness: async (businessId: string) => {
    const response = await api.post('/businesses/join', { businessId });
    return response.data;
  },
  updateBusiness: async (businessId: string, data: any) => {
    const response = await api.patch(`/businesses/${businessId}`, data);
    return response.data;
  },
  deleteBusiness: async (businessId: string) => {
    const response = await api.delete(`/businesses/${businessId}`);
    return response.data;
  },
  updateEntry: async (businessId: string, entryId: string, data: any) => {
    const response = await api.patch(`/businesses/${businessId}/entries/${entryId}`, data);
    return response.data;
  },
  deleteEntry: async (businessId: string, entryId: string) => {
    const response = await api.delete(`/businesses/${businessId}/entries/${entryId}`);
    return response.data;
  }
};

export const assetService = {
  getAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },
  addAsset: async (data: any) => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  deleteAsset: async (id: string) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  }
};

export const expenseService = {
  getExpenses: async (params?: any) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  addExpense: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  }
};

export const cashService = {
  getCashSummary: async () => {
    const response = await api.get('/cash');
    return response.data;
  },
  updateCashSummary: async (data: any) => {
    const response = await api.post('/cash', data);
    return response.data;
  }
};

export default api;
