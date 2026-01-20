const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Get auth token from localStorage
 */
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

/**
 * Get all doctors
 */
export const getDoctors = async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/doctors?${queryString}` : '/doctors';
    const response = await fetch(`${API_URL}${endpoint}`);

    if (!response.ok) {
        throw new Error('Failed to fetch doctors');
    }

    console.log(response);
    return await response.json();
};

/**
 * Get single doctor by ID
 */
export const getDoctor = async (id) => {
    const response = await fetch(`${API_URL}/doctors/${id}`);
    return await response.json();
};

/**
 * Get doctor's available time slots for a date
 */
export const getDoctorAvailability = async (id, date) => {
    const response = await fetch(`${API_URL}/doctors/${id}/availability?date=${date}`);
    return await response.json();
};

/**
 * Create doctor with image upload (Admin only)
 */
export const createDoctor = async (doctorData, imageFile) => {
    const token = getToken();
    const formData = new FormData();

    // Add all fields to FormData
    Object.keys(doctorData).forEach(key => {
        if (key === 'availability') {
            formData.append(key, JSON.stringify(doctorData[key]));
        } else {
            formData.append(key, doctorData[key]);
        }
    });

    // Add image if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch(`${API_URL}/doctors`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create doctor');
    }
    return data;
};

/**
 * Update doctor with image upload (Admin only)
 */
export const updateDoctor = async (id, doctorData, imageFile) => {
    const token = getToken();
    const formData = new FormData();

    // Add all fields to FormData
    Object.keys(doctorData).forEach(key => {
        if (key === 'availability') {
            formData.append(key, JSON.stringify(doctorData[key]));
        } else {
            formData.append(key, doctorData[key]);
        }
    });

    // Add image if provided
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch(`${API_URL}/doctors/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to update doctor');
    }
    return data;
};

/**
 * Delete doctor (Admin only)
 */
export const deleteDoctor = async (id) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/doctors/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

};

/**
 * Get logged in doctor profile
 */
export const getDoctorMe = async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/doctors/me/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    return await response.json();
};

/**
 * Get appointments for logged in doctor
 */
export const getDoctorAppointments = async (params = {}) => {
    const token = getToken();
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/doctors/me/appointments?${queryString}` : '/doctors/me/appointments';

    const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    return await response.json();
};

