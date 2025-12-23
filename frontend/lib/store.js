import { create } from 'zustand';
import api from './api';

/**
 * Cart Store
 * Manages shopping cart state
 */
export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  total: 0,
  totalItems: 0,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const { data } = await api.get('/cart');
      set({
        items: data.data?.items || [],
        subtotal: data.data?.subtotal || 0,
        total: data.data?.total || 0,
        totalItems: data.data?.totalItems || 0,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching cart:', error);
    }
  },

  addToCart: async (productId, quantity = 1, variant = null, price) => {
    try {
      set({ loading: true });
      await api.post('/cart/add', { productId, quantity, variant, price });
      await get().fetchCart();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      set({ loading: true });
      await api.put(`/cart/item/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ loading: true });
      await api.delete(`/cart/item/${itemId}`);
      await get().fetchCart();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      set({ loading: true });
      await api.delete('/cart');
      set({ items: [], subtotal: 0, total: 0, totalItems: 0, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

/**
 * Auth Store
 * Manages authentication state using HttpOnly cookie sessions
 * 
 * Key features:
 * - isLoading starts as true to prevent UI flicker
 * - login/logout directly call API
 * - checkAuth validates session on page load
 */
export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: true, // Prevents "Login" button flicker on page load

  /**
   * Login with email and password
   * Session cookie is automatically set by browser
   */
  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.success) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
        });
        return data.data; // Return user for component use
      }
    } catch (error) {
      set({ isLoading: false });
      throw error; // Let component handle (show toast, etc.)
    }
  },

  /**
   * Logout - destroy session on server and clear local state
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state, even if API call fails
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Check if session is still valid
   * Called on app mount (in Navbar) to restore session after page refresh
   */
  checkAuth: async () => {
    set({ isLoading: true });

    try {
      const { data } = await api.get('/auth/me');

      if (data.success && data.data) {
        set({
          user: data.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      // Session expired or invalid
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Set user directly (for register flow)
   */
  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },
}));
