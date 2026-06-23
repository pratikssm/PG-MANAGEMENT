// API Configuration and Client Setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function apiCall<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Auth endpoints
  auth: {
    register: (payload: any) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
    login: (payload: any) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
    logout: () => apiCall('/auth/logout', { method: 'POST' }),
    me: () => apiCall('/auth/me', { method: 'GET' }),
    requestOtp: (phone: string) => apiCall('/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
    verifyOtp: (phone: string, otp: string) => apiCall('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  },

  // Room endpoints
  rooms: {
    getAll: (params?: any) => apiCall('/rooms', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/rooms/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/rooms', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    delete: (id: string) => apiCall(`/rooms/${id}`, { method: 'DELETE' }),
  },

  // Registration endpoints
  registrations: {
    getAll: (params?: any) => apiCall('/registrations', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/registrations/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/registrations', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/registrations/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    delete: (id: string) => apiCall(`/registrations/${id}`, { method: 'DELETE' }),
  },

  // Invoice endpoints
  invoices: {
    getAll: (params?: any) => apiCall('/invoices', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/invoices/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/invoices', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    download: (id: string) => apiCall(`/invoices/${id}/download`, { method: 'GET' }),
  },

  // Complaint endpoints
  complaints: {
    getAll: (params?: any) => apiCall('/complaints', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/complaints/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/complaints', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  },

  // Laundry endpoints
  laundry: {
    getAll: (params?: any) => apiCall('/laundry', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/laundry/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/laundry', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/laundry/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  },

  // Menu endpoints
  menu: {
    getAll: (params?: any) => apiCall('/menu', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/menu/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/menu', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: any) => apiCall(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  },

  // Payment endpoints
  payments: {
    getAll: (params?: any) => apiCall('/payments', { method: 'GET', params }),
    getById: (id: string) => apiCall(`/payments/${id}`, { method: 'GET' }),
    create: (payload: any) => apiCall('/payments', { method: 'POST', body: JSON.stringify(payload) }),
    verify: (payload: any) => apiCall('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // Contact endpoints
  contacts: {
    create: (payload: any) => apiCall('/contacts', { method: 'POST', body: JSON.stringify(payload) }),
    getAll: (params?: any) => apiCall('/contacts', { method: 'GET', params }),
  },

  // Upload endpoints
  uploads: {
    uploadImage: (formData: FormData) => fetch(`${API_BASE_URL}/uploads/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    }).then(r => r.json()),
  },

  // Broadcast endpoints
  broadcast: {
    sendMessage: (payload: any) => apiCall('/broadcast/message', { method: 'POST', body: JSON.stringify(payload) }),
  },

  // Report endpoints
  reports: {
    generateOccupancyReport: (params?: any) => apiCall('/reports/occupancy', { method: 'GET', params }),
    generateRevenueReport: (params?: any) => apiCall('/reports/revenue', { method: 'GET', params }),
  },
};

export default api;
