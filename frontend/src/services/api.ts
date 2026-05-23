import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth & Onboarding
  registerUser: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  saveProfile: async (userId: string, data: any) => {
    const response = await api.post('/onboarding/profile', { user_id: userId, ...data });
    return response.data;
  },

  saveSchedule: async (userId: string, data: any) => {
    const response = await api.post('/onboarding/schedule', { user_id: userId, ...data });
    return response.data;
  },

  saveKitchen: async (userId: string, data: any) => {
    const response = await api.post('/onboarding/kitchen', { user_id: userId, ...data });
    return response.data;
  },

  // Daily Plan
  getTodayPlan: async (userId: string) => {
    const response = await api.get(`/plan/today?user_id=${userId}`);
    return response.data;
  },

  regeneratePlan: async (userId: string) => {
    const response = await api.post('/plan/regenerate', { user_id: userId });
    return response.data;
  },

  // Logging
  logWeight: async (userId: string, weight: number) => {
    const response = await api.post('/log/weight', { user_id: userId, weight_kg: weight });
    return response.data;
  },

  logMeal: async (userId: string, meal: any) => {
    const response = await api.post('/log/meal', { user_id: userId, meal });
    return response.data;
  },

  logWorkout: async (userId: string, done: boolean) => {
    const response = await api.post('/log/workout', { user_id: userId, done });
    return response.data;
  },

  getHistory: async (userId: string) => {
    const response = await api.get(`/log/history?user_id=${userId}`);
    return response.data;
  },

  // Kitchen
  updateKitchen: async (userId: string, items: any) => {
    const response = await api.put('/kitchen/update', { user_id: userId, items });
    return response.data;
  },
};
