import api from './api';

export const weeklyMenuSelectionService = {
  // Get available menus for next week
  getAvailableMenus: async () => {
    try {
      const response = await api.get('/weekly-menu-selection/available-menus');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's current selections
  getCurrentSelections: async (weekStart) => {
    try {
      const params = weekStart ? { weekStart } : {};
      const response = await api.get('/weekly-menu-selection/selections', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create weekly selections
  createSelections: async (selections) => {
    try {
      const response = await api.post('/weekly-menu-selection/selections', { selections });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Get users without selection
  getUsersWithoutSelection: async () => {
    try {
      const response = await api.get('/weekly-menu-selection/users-without-selection');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin: Get selection statistics
  getStatistics: async (startDate, endDate) => {
    try {
      const params = { startDate, endDate };
      const response = await api.get('/weekly-menu-selection/statistics', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
