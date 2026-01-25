import api from './api';

/**
 * Get current user's appointments (Dedicated endpoint)
 */
export const getMyAppointments = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/appointments/my?${queryString}` : '/appointments/my';
    return await api.get(endpoint);
};

/**
 * Get all appointments (Admin only)
 */
export const getAppointments = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    return await api.get(endpoint);
};

/**
 * Get single appointment
 */
export const getAppointment = async (id) => {
    return await api.get(`/appointments/${id}`);
};

/**
 * Create appointment (for both guests and logged-in users)
 */
export const createAppointment = async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
};

/**
 * Update appointment status
 */
export const updateAppointment = async (id, updateData) => {
    return await api.put(`/appointments/${id}`, updateData);
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (id) => {
    return await api.delete(`/appointments/${id}`);
};

/**
 * Get appointments by doctor (Admin only)
 */
export const getAppointmentsByDoctor = async (doctorId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
        ? `/appointments/doctor/${doctorId}?${queryString}`
        : `/appointments/doctor/${doctorId}`;
    return await api.get(endpoint);
};

/**
 * Get revenue statistics (Admin only)
 */
export const getRevenueStats = async () => {
    return await api.get('/appointments/stats/revenue');
};
