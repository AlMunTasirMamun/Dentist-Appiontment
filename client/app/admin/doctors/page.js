'use client';

import { useState, useEffect } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '@/services/doctorService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function AdminDoctorsPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        bio: '',
        availability: [],
        price: 0,
        password: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await getDoctors({ status: 'all' });
            console.log('Doctors response:', response);
            console.log('response.success:', response.success);
            console.log('response.data:', response.data);
            if (response.success && response.data) {
                console.log('Setting doctors:', response.data);
                setDoctors(response.data);
            }
        } catch (err) {
            console.error('Error fetching doctors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setEditingDoctor(doctor);
            setFormData({
                name: doctor.name || '',
                email: doctor.email || '',
                phone: doctor.phone || '',
                specialty: doctor.specialty || '',
                bio: doctor.bio || '',
                status: doctor.status || 'active',
                availability: doctor.availability || [],
                price: doctor.price || 0,
            });
            // Set existing image preview
            if (doctor.image) {
                setImagePreview(`${API_URL.replace('/api', '')}${doctor.image}`);
            } else {
                setImagePreview(null);
            }
        } else {
            setEditingDoctor(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                specialty: '',
                bio: '',
                status: 'active',
                availability: [
                    { day: 'monday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                    { day: 'tuesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                    { day: 'wednesday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                    { day: 'thursday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                    { day: 'friday', startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                ],
                price: 0,
                password: '',
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDoctor(null);
        setImageFile(null);
        setImagePreview(null);
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvailabilityChange = (index, field, value) => {
        const newAvailability = [...formData.availability];
        newAvailability[index] = {
            ...newAvailability[index],
            [field]: field === 'slotDuration' ? parseInt(value) : value,
        };
        setFormData({ ...formData, availability: newAvailability });
    };

    const toggleDay = (day) => {
        const exists = formData.availability.find(a => a.day === day);
        if (exists) {
            setFormData({
                ...formData,
                availability: formData.availability.filter(a => a.day !== day),
            });
        } else {
            setFormData({
                ...formData,
                availability: [
                    ...formData.availability,
                    { day, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
                ],
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingDoctor) {
                await updateDoctor(editingDoctor._id, formData, imageFile);
            } else {
                await createDoctor(formData, imageFile);
            }
            handleCloseModal();
            fetchDoctors();
        } catch (err) {
            setError(err.message || 'Failed to save doctor');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this doctor?')) return;

        try {
            await deleteDoctor(id);
            fetchDoctors();
        } catch (err) {
            alert(err.message || 'Failed to delete doctor');
        }
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
                    <p className="text-gray-600 mt-1">Add, edit, and manage doctor profiles</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    Add New Doctor
                </Button>
            </div>

            {/* Doctors Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500">No doctors found</p>
                        <Button onClick={() => handleOpenModal()} className="mt-4">Add First Doctor</Button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Specialty</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Available Days</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {doctors.map((doctor) => (
                                <tr key={doctor._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {doctor.image ? (
                                                <img
                                                    src={`${API_URL.replace('/api', '')}${doctor.image}`}
                                                    alt={doctor.name}
                                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-white font-medium">{doctor.name?.charAt(0)}</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{doctor.name}</p>
                                                <p className="text-sm text-gray-500">{doctor.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{doctor.specialty}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {doctor.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                        ৳{doctor.price || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            {doctor.availability?.map((a) => (
                                                <span key={a.day} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs capitalize">
                                                    {a.day.slice(0, 3)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(doctor)}
                                            className="text-blue-600 hover:text-blue-800 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(doctor._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={handleCloseModal}
                title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                size="lg"
            >
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        <Input
                            label="Specialty"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Consultation Price (BDT)"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                        {!editingDoctor && (
                            <Input
                                label="Initial Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                        <div className="flex items-center gap-4">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {days.map((day) => {
                                const isSelected = formData.availability.some(a => a.day === day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${isSelected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                                    </button>
                                );
                            })}
                        </div>

                        {formData.availability.length > 0 && (
                            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                                {formData.availability.map((avail, index) => (
                                    <div key={avail.day} className="flex items-center gap-4">
                                        <span className="w-24 text-sm font-medium capitalize">{avail.day}</span>
                                        <input
                                            type="time"
                                            value={avail.startTime}
                                            onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                                            className="px-2 py-1 border rounded"
                                        />
                                        <span>to</span>
                                        <input
                                            type="time"
                                            value={avail.endTime}
                                            onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                                            className="px-2 py-1 border rounded"
                                        />
                                        <select
                                            value={avail.slotDuration}
                                            onChange={(e) => handleAvailabilityChange(index, 'slotDuration', e.target.value)}
                                            className="px-2 py-1 border rounded"
                                        >
                                            <option value={15}>15 min</option>
                                            <option value={30}>30 min</option>
                                            <option value={45}>45 min</option>
                                            <option value={60}>60 min</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={submitting}>
                            {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
