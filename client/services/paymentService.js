import api from './api';

/**
 * Initiate aamarpay payment
 * @param {Object} paymentData - Appointment details
 * @returns {Promise<Object>} - Response containing payment_url
 */
export const initiatePayment = async (paymentData) => {
    const response = await api.post('/payment/initiate', paymentData);
    return response;
};
