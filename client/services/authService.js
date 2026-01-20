import api from './api';

/**
 * Register a new user
 */
export const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};

/**
 * Login user
 */
export const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response;
};

/**
 * Logout user
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Get current user
 */
export const getMe = async () => {
    return await api.get('/auth/me');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
        return !!localStorage.getItem('token');
    }
    return false;
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    return null;
};

/**
 * Store user data
 */
export const storeUser = (user) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
    }
};
