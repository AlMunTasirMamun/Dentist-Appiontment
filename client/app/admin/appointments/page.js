'use client';

import { useState, useEffect } from 'react';
import { getAppointments, updateAppointment, cancelAppointment } from '@/services/appointmentService';
import { formatDate, formatTimeSlot, getStatusColor, capitalize } from '@/utils/helpers';
import Button from '@/components/ui/Button';

export default function AdminAppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAppointments();
    }, [filter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await getAppointments(params);
            if (response.success) {
                setAppointments(response.data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateAppointment(id, { status: newStatus });
            fetchAppointments();
        } catch (err) {
            alert(err.message || 'Failed to update status');
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await cancelAppointment(id);
            fetchAppointments();
        } catch (err) {
            alert(err.message || 'Failed to cancel appointment');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
                <p className="text-gray-600 mt-1">View and manage all patient appointments</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {capitalize(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No appointments found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Doctor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {appointments.map((apt) => {
                                    const patientInfo = apt.patient || apt.guestInfo;
                                    return (
                                        <tr key={apt._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{patientInfo?.name}</p>
                                                    <p className="text-sm text-gray-500">{patientInfo?.email}</p>
                                                    {!apt.patient && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Guest</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">Dr. {apt.doctor?.name}</p>
                                                <p className="text-sm text-gray-500">{apt.doctor?.specialty}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-900">{formatDate(apt.date)}</p>
                                                <p className="text-sm text-gray-500">{formatTimeSlot(apt.timeSlot)}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                                                    {capitalize(apt.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {apt.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                                                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(apt._id, 'completed')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    {['pending', 'confirmed'].includes(apt.status) && (
                                                        <button
                                                            onClick={() => handleCancel(apt._id)}
                                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
