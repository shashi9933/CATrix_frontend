import axios, { AxiosInstance } from 'axios';

// Use environment variable or default to Render backend
let API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)
  || 'https://catrix-backend.onrender.com/api';

// Ensure /api is included
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api';
}

console.log('🔗 API Base URL:', API_BASE_URL);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000, // Reduced to 15 seconds for faster feedback
  withCredentials: true // ✅ IMPORTANT: Send credentials (cookies, auth headers)
});

// Add token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Retry logic for failed requests (exponential backoff)
api.interceptors.response.use(undefined, async (error: any) => {
  const config = error.config;

  // Skip retry for login/auth endpoints
  if (error.config?.url?.includes('/auth/')) {
    return Promise.reject(error);
  }

  if (!config || !error.response || error.response.status < 500) {
    return Promise.reject(error);
  }

  config.__retryCount = config.__retryCount || 0;

  if (config.__retryCount >= 3) {
    return Promise.reject(error);
  }

  config.__retryCount += 1;
  const delay = Math.pow(2, config.__retryCount) * 1000;

  await new Promise(resolve => setTimeout(resolve, delay));
  return api(config);
});

// ===== AUTH API =====
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    api.post('auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post('auth/login', { email, password }),

  verify: () =>
    api.post('auth/verify'),

  guest: () =>
    api.post('auth/guest'),

  // Google OAuth login
  googleLogin: (email: string, name: string, googleId: string, picture?: string) =>
    api.post('auth/google', { email, name, googleId, picture })

};

// ===== USERS API =====
export const userAPI = {
  getProfile: () =>
    api.get('users/profile'),

  updateProfile: (name: string) =>
    api.patch('users/profile', { name })
};

// ===== TESTS API =====
export const testAPI = {
  getAll: () =>
    api.get('tests'),

  getById: (id: string) =>
    api.get(`tests/${id}`),

  create: (testData: any) =>
    api.post('tests', testData),

  // Start test attempt
  startAttempt: (testId: string) =>
    api.post(`tests/attempt/start/${testId}`, {}),

  // Save answer (auto-save)
  saveAnswer: (attemptId: string, questionId: string, selectedAnswer: string, timeTaken?: number) =>
    api.post(`tests/attempt/${attemptId}/answer`, { questionId, selectedAnswer, timeTaken }),

  // Submit test
  submitAttempt: (attemptId: string) =>
    api.post(`tests/attempt/${attemptId}/submit`, {}),

  // Get attempt details
  getAttempt: (attemptId: string) =>
    api.get(`tests/attempt/${attemptId}`),

  // Aliases for compatibility
  createAttempt: (testId: string) =>
    api.post('test-attempts', { testId }),

  recordAnswer: (attemptId: string, questionId: string, answer: string) =>
    api.post(`test-attempts/${attemptId}/answers`, { questionId, answer })
};

// ===== TEST ATTEMPTS API =====
export const testAttemptAPI = {
  create: (testId: string) =>
    api.post('test-attempts', { testId }),

  getById: (id: string) =>
    api.get(`test-attempts/${id}`),

  update: (id: string, data: any) =>
    api.patch(`test-attempts/${id}`, data),

  getUserAttempts: () =>
    api.get('test-attempts/user/attempts')
};

// ===== ANALYTICS API =====
export const analyticsAPI = {
  get: () =>
    api.get('analytics'),

  getUserAnalytics: () =>
    api.get('analytics'),

  getRecentTests: () =>
    api.get('analytics/recent-tests'),

  update: (data: any) =>
    api.post('analytics/update', data)
};

// ===== COLLEGES API =====
export const collegeAPI = {
  getAll: () =>
    api.get('colleges'),

  getById: (id: string) =>
    api.get(`colleges/${id}`),

  create: (collegeData: any) =>
    api.post('colleges', collegeData)
};

// ===== STUDY MATERIALS API =====
export const studyMaterialAPI = {
  getAll: () =>
    api.get('study-materials'),

  getBySection: (section: string) =>
    api.get(`study-materials/section/${section}`),

  getByTopic: (section: string, topic: string) =>
    api.get(`study-materials/section/${section}/topic/${topic}`),

  getById: (id: string) =>
    api.get(`study-materials/${id}`),

  create: (materialData: any) =>
    api.post('study-materials', materialData),

  // Save/unsave materials
  saveMaterial: (id: string) =>
    api.post(`study-materials/${id}/save`, {}),

  unsaveMaterial: (id: string) =>
    api.delete(`study-materials/${id}/save`),

  // Mark/unmark materials
  markMaterial: (id: string, isMarked: boolean = true) =>
    api.post(`study-materials/${id}/mark`, { isMarked }),

  // Get user's saved and marked materials
  getSavedMaterials: () =>
    api.get('study-materials/user/saved'),

  getMarkedMaterials: () =>
    api.get('study-materials/user/marked')
};

export default api;
