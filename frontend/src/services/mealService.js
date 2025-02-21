import api from './api';

export const registerMeal = async (registrationData) => {
  try {
    const response = await api.post('/meals/register', registrationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMealHistory = async (userId) => {
  try {
    const response = await api.get(`/meals/history/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMealStatistics = async () => {
  try {
    const response = await api.get('/meals/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDailyMealCount = async (date) => {
  try {
    const response = await api.get(`/meals/daily-count/${date}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const validateMealRegistration = async (userId, mealType, date) => {
  try {
    const response = await api.post('/meals/validate', {
      userId,
      mealType,
      date
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUpcomingMeals = async (userId) => {
  try {
    const response = await api.get(`/meals/upcoming/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMealsByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/meals/range', {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMealTypes = async () => {
  try {
    const response = await api.get('/meals/types');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
