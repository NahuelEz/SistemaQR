import api from './api';

export const getMenus = async () => {
  try {
    const response = await api.get('/menus');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createMenu = async (menuData) => {
  try {
    const response = await api.post('/menus', menuData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateMenu = async (id, menuData) => {
  try {
    const response = await api.put(`/menus/${id}`, menuData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMenu = async (id) => {
  try {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getWeeklyMenu = async (weekStartDate) => {
  try {
    const response = await api.get(`/menus/weekly/${weekStartDate}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const saveWeeklySelection = async (selections) => {
  try {
    const response = await api.post('/menus/weekly-selection', { selections });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployeeMenuSelections = async (userId) => {
  try {
    const response = await api.get(`/menus/selections/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
