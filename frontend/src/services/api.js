import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

// Menu services
export const menuService = {
  getWeeklyMenu: (startDate, endDate) => 
    api.get('/menus/weekly', { params: { startDate, endDate } }),
  getDailyMenu: (date) => 
    api.get('/menus/daily', { params: { date } }),
  createMenu: (menuData) => 
    api.post('/menus', menuData),
  updateMenu: (id, menuData) => 
    api.put(`/menus/${id}`, menuData),
  deleteMenu: (id) => 
    api.delete(`/menus/${id}`),
  createMenuSelection: (menuId, selectionData) => 
    api.post(`/menus/${menuId}/selections`, selectionData),
  getMenuSelections: (menuId) => 
    api.get(`/menus/${menuId}/selections`),
  getUserMenuSelections: (startDate, endDate) => 
    api.get('/menus/selections/user', { params: { startDate, endDate } })
};

// Meal registration services
export const mealService = {
  register: (registrationData) => 
    api.post('/meals/register', registrationData),
  verifyQRCode: (qrCode) => 
    api.post('/meals/verify-qr', { qrCode }),
  scanAndRegister: (data) => 
    api.post('/meals/scan-and-register', data),
  getDailyRegistrations: (date) => 
    api.get('/meals/daily', { params: { date } }),
  getWeeklyRegistrations: (startDate, endDate) => 
    api.get('/meals/weekly', { params: { startDate, endDate } }),
  getUserRegistrations: (startDate, endDate) => 
    api.get('/meals/user', { params: { startDate, endDate } }),
  getRegistrationStats: (startDate, endDate) => 
    api.get('/meals/stats', { params: { startDate, endDate } })
};

// Employee services
export const employeeService = {
  listEmployees: (page = 1, limit = 10) => 
    api.get('/employees', { params: { page, limit } }),
  getEmployee: (id) => 
    api.get(`/employees/${id}`),
  updateEmployee: (id, data) => 
    api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => 
    api.delete(`/employees/${id}`),
  getEmployeeQRCode: (id) => 
    api.get(`/employees/${id}/qr-code`),
  regenerateQRCode: (id) => 
    api.post(`/employees/${id}/regenerate-qr`),
  getEmployeeMenuSelections: (id, startDate, endDate) => 
    api.get(`/employees/${id}/menu-selections`, { params: { startDate, endDate } }),
  getEmployeeMealRegistrations: (id, startDate, endDate) => 
    api.get(`/employees/${id}/meal-registrations`, { params: { startDate, endDate } })
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
