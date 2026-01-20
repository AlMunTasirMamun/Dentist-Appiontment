'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as logoutService, storeUser, getStoredUser } from '@/services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Try to get user from API
                const response = await getMe();
                if (response.success && response.data) {
                    setUser(response.data);
                    storeUser(response.data);
                    setIsAuthenticated(true);
                }
            } else {
                // Check for stored user
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                    setIsAuthenticated(true);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setUser(userData);
        storeUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        logoutService();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (userData) => {
        setUser(userData);
        storeUser(userData);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        updateUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
