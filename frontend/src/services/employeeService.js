import api from './api';

export const getEmployees = async () => {
  try {
    const response = await api.get('/employees');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await api.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const generateQRCode = async (employeeId) => {
  try {
    const response = await api.post(`/employees/${employeeId}/qr-code`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployeeProfile = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/profile`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployeeMealHistory = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/meal-history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployeeWeeklySelections = async (employeeId) => {
  try {
    const response = await api.get(`/employees/${employeeId}/weekly-selections`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
