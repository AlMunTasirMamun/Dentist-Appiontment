import api from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const createPrescription = async (data, file = null) => {
    try {
        if (file) {
            const formData = new FormData();
            formData.append('appointmentId', data.appointmentId);
            formData.append('diagnosis', data.diagnosis);
            formData.append('advice', data.advice || '');
            formData.append('medicines', JSON.stringify(data.medicines));
            formData.append('prescriptionFile', file);
            return await api.postFormData('/prescriptions', formData);
        }
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

export const downloadPrescription = async (prescriptionId, filename = 'prescription') => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const response = await fetch(`${API_URL}/prescriptions/${prescriptionId}/download`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download prescription');
        }

        // Get the filename from content-disposition header if available
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = filename;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch) {
                downloadFilename = filenameMatch[1];
            }
        }

        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const downloadPrescriptionPDF = async (prescriptionId, filename = 'prescription') => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        const response = await fetch(`${API_URL}/prescriptions/${prescriptionId}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to download prescription PDF');
        }

        // Get the filename from content-disposition header if available
        const contentDisposition = response.headers.get('content-disposition');
        let downloadFilename = `${filename}.pdf`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch) {
                downloadFilename = filenameMatch[1];
            }
        }

        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const updatePrescription = async (prescriptionId, data, file = null) => {
    try {
        if (file) {
            const formData = new FormData();
            formData.append('diagnosis', data.diagnosis);
            formData.append('advice', data.advice || '');
            formData.append('medicines', JSON.stringify(data.medicines));
            formData.append('prescriptionFile', file);
            return await api.putFormData(`/prescriptions/${prescriptionId}`, formData);
        }
        return await api.put(`/prescriptions/${prescriptionId}`, data);
    } catch (error) {
        throw error;
    }
};
