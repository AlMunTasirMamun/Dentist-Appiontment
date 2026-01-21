import api from './api';

/**
 * Send a contact message
 * @param {Object} messageData { name, email, message }
 */
export const createContactMessage = async (messageData) => {
    return await api.post('/contact', messageData);
};

/**
 * Get all contact messages (Admin)
 */
export const getAllContactMessages = async () => {
    return await api.get('/contact');
};

/**
 * Update message status (Admin)
 * @param {String} id
 * @param {Object} statusData { status }
 */
export const updateContactMessageStatus = async (id, statusData) => {
    return await api.put(`/contact/${id}`, statusData);
};

/**
 * Delete a contact message (Admin)
 * @param {String} id
 */
export const deleteContactMessage = async (id) => {
    return await api.delete(`/contact/${id}`);
};
