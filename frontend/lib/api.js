import axios from 'axios';

// v2 - Force rebuild for CORS fix
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

console.log('🔌 API URL Configured as:', API_URL);

/**
 * Axios instance configured for cookie-based authentication
 * - withCredentials: true sends/receives HttpOnly cookies
 * - No manual token handling needed
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: This sends cookies with every request
});

// Add session ID for guest cart (only for unauthenticated cart operations)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Guest cart session ID (for users who aren't logged in)
    let guestSessionId = localStorage.getItem('guestSessionId');
    if (!guestSessionId) {
      guestSessionId = 'guest-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestSessionId', guestSessionId);
    }
    config.headers['X-Session-ID'] = guestSessionId;

    // Fallback Auth Token (for when cookies fail)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getBestsellers: () => api.get('/products/bestsellers'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
};

// Category APIs
export const categoryAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getOne: (id) => api.get(`/categories/${id}`),
  getProducts: (id, params) => api.get(`/categories/${id}/products`, { params }),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  updateItem: (itemId, quantity) => api.put(`/cart/item/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
};

// Coupon APIs
export const couponAPI = {
  validate: (code, cartTotal) => api.post('/coupons/validate', { code, cartTotal }),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
};

// Payment APIs
export const paymentAPI = {
  createIntent: (orderId) => api.post('/payments/create-intent', { orderId }),
  confirm: (orderId, paymentIntentId) => api.post('/payments/confirm', { orderId, paymentIntentId }),
};

// Review APIs
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getApproved: (page) => api.get('/reviews', { params: { page } }),
};

// Admin APIs
export const adminAPI = {
  // Product Management
  createProduct: (data) => api.post('/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, data) => api.put(`/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProducts: (params) => api.get('/products', { params }),

  // Order Management
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),

  // Analytics
  getStats: () => api.get('/analytics/stats'),
  getSalesData: (params) => api.get('/analytics/sales', { params }),
  getTopProducts: (params) => api.get('/analytics/top-products', { params }),
  getCategoryPerformance: (params) => api.get('/analytics/category-performance', { params }),

  // Customers
  getCustomers: (params) => api.get('/users', { params }),
  getCustomer: (id) => api.get(`/users/${id}`),
  updateCustomer: (id, data) => api.put(`/users/${id}`, data),
  deleteCustomer: (id) => api.delete(`/users/${id}`),
};

export default api;
