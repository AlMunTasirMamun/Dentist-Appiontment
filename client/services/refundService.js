import api from './api';

// Create a refund request (for patients)
export const createRefundRequest = async (appointmentId, reason) => {
  const response = await api.post('/refunds/request', { appointmentId, reason });
  return response;
};

// Get my refund requests (for patients)
export const getMyRefundRequests = async () => {
  const response = await api.get('/refunds/my-requests');
  return response;
};

// Get all refund requests (for admin)
export const getRefundRequests = async (status = '') => {
  const response = await api.get(`/refunds${status ? `?status=${status}` : ''}`);
  return response;
};

// Get pending refund count (for admin notifications)
export const getPendingRefundCount = async () => {
  const response = await api.get('/refunds/pending-count');
  return response;
};

// Get a single refund request
export const getRefundRequest = async (id) => {
  const response = await api.get(`/refunds/${id}`);
  return response;
};

// Approve a refund request (for admin)
export const approveRefund = async (id, adminNote = '') => {
  const response = await api.put(`/refunds/${id}/approve`, { adminNote });
  return response;
};

// Reject a refund request (for admin)
export const rejectRefund = async (id, adminNote) => {
  const response = await api.put(`/refunds/${id}/reject`, { adminNote });
  return response;
};
