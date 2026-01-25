import api from './api';

export const createPrescription = async (data) => {
    try {
        return await api.post('/prescriptions', data);
    } catch (error) {
        throw error;
    }
};

export const getPatientPrescriptions = async (patientId) => {
    try {
        return await api.get(`/prescriptions/patient/${patientId}`);
    } catch (error) {
        throw error;
    }
};

export const getPrescriptionByAppointment = async (appointmentId) => {
    try {
        return await api.get(`/prescriptions/appointment/${appointmentId}`);
    } catch (error) {
        throw error;
    }
};

export const getPrescriptionDetails = async (id) => {
    try {
        return await api.get(`/prescriptions/${id}`);
    } catch (error) {
        throw error;
    }
};
