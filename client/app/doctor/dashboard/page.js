'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDoctorAppointments } from '@/services/doctorService';
import { formatDate, formatTimeSlot, getStatusColor, capitalize } from '@/utils/helpers';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import PrescriptionModal from '@/components/doctor/PrescriptionModal';
import ViewPrescriptionModal from '@/components/doctor/ViewPrescriptionModal';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getDoctorAppointments({ status: filter });
            if (response.success) {
                setAppointments(response.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user, fetchAppointments]);

    const handlePrescribe = (appointment) => {
        setSelectedAppointment(appointment);
        setIsCreateModalOpen(true);
    };

    const handleViewPrescription = (appointmentId) => {
        const apt = appointments.find(a => a._id === appointmentId);
        setSelectedAppointment(apt);
        setIsViewModalOpen(true);
    };

    const statusFilters = [
        { id: 'all', label: 'All' },
        { id: 'pending', label: 'Pending' },
        { id: 'confirmed', label: 'Confirmed' },
        { id: 'consulted', label: 'Consulted' },
        { id: 'completed', label: 'Completed' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                        <p className="text-gray-600 mt-1">
                            Welcome back, <span className="font-semibold text-blue-600">Dr. {user?.name}</span>
                        </p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
                        {statusFilters.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setFilter(s.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === s.id
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-xl" />
                    ))}
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No Appointments Found</h3>
                    <p className="text-gray-500 mt-2">You don&apos;t have any {filter !== 'all' ? filter : ''} appointments scheduled.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                        <AppointmentCard
                            key={appointment._id}
                            appointment={appointment}
                            showDoctor={false}
                            onPrescribe={handlePrescribe}
                            onViewPrescription={handleViewPrescription}
                        />
                    ))}
                </div>
            )}

            {isCreateModalOpen && selectedAppointment && (
                <PrescriptionModal
                    appointment={selectedAppointment}
                    onClose={() => setIsCreateModalOpen(false)}
                    onPrescriptionCreated={fetchAppointments}
                />
            )}

            {isViewModalOpen && selectedAppointment && (
                <ViewPrescriptionModal
                    appointmentId={selectedAppointment._id}
                    patientName={selectedAppointment.patient?.name || selectedAppointment.guestInfo?.name}
                    onClose={() => setIsViewModalOpen(false)}
                    onPrescriptionUpdated={fetchAppointments}
                />
            )}
        </div>
    );
}
