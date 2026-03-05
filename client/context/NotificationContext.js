'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getPatientPrescriptions } from '@/services/prescriptionService';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [lastPrescriptionCount, setLastPrescriptionCount] = useState(null);
    const pollingIntervalRef = useRef(null);

    // Add a notification
    const addNotification = useCallback((notification) => {
        const id = Date.now();
        const newNotification = {
            id,
            ...notification,
            createdAt: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Auto remove after 10 seconds if not persistent
        if (!notification.persistent) {
            setTimeout(() => {
                removeNotification(id);
            }, 10000);
        }

        return id;
    }, []);

    // Remove a notification
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Clear all notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    // Check for new prescriptions
    const checkForNewPrescriptions = useCallback(async () => {
        if (!user || !isAuthenticated || user.role !== 'client') return;

        try {
            const response = await getPatientPrescriptions(user._id);
            if (response.success) {
                const currentCount = response.data.length;
                
                // If this is first check, just store the count
                if (lastPrescriptionCount === null) {
                    setLastPrescriptionCount(currentCount);
                    // Store in localStorage to persist across sessions
                    localStorage.setItem(`lastPrescriptionCount_${user._id}`, currentCount.toString());
                    return;
                }

                // Check if there are new prescriptions
                if (currentCount > lastPrescriptionCount) {
                    const newCount = currentCount - lastPrescriptionCount;
                    const latestPrescription = response.data[0]; // Most recent prescription
                    
                    addNotification({
                        type: 'prescription',
                        title: 'New Prescription Received!',
                        message: `Dr. ${latestPrescription.doctor?.name || 'Your doctor'} has sent you ${newCount > 1 ? `${newCount} new prescriptions` : 'a new prescription'}. Diagnosis: ${latestPrescription.diagnosis}`,
                        prescriptionId: latestPrescription._id,
                        persistent: true,
                    });

                    setLastPrescriptionCount(currentCount);
                    localStorage.setItem(`lastPrescriptionCount_${user._id}`, currentCount.toString());
                }
            }
        } catch (error) {
            console.error('Error checking for new prescriptions:', error);
        }
    }, [user, isAuthenticated, lastPrescriptionCount, addNotification]);

    // Initialize last prescription count from localStorage
    useEffect(() => {
        if (user && isAuthenticated && user.role === 'client') {
            const stored = localStorage.getItem(`lastPrescriptionCount_${user._id}`);
            if (stored !== null) {
                setLastPrescriptionCount(parseInt(stored, 10));
            }
        }
    }, [user, isAuthenticated]);

    // Start polling for new prescriptions
    useEffect(() => {
        if (user && isAuthenticated && user.role === 'client') {
            // Initial check
            checkForNewPrescriptions();

            // Poll every 30 seconds
            pollingIntervalRef.current = setInterval(() => {
                checkForNewPrescriptions();
            }, 30000);

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [user, isAuthenticated, checkForNewPrescriptions]);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        checkForNewPrescriptions,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
