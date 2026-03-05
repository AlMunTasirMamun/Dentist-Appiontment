'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMyAppointments, cancelAppointment } from '@/services/appointmentService';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import ViewPrescriptionModal from '@/components/doctor/ViewPrescriptionModal';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function AppointmentsPage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAppointments();
        }
    }, [isAuthenticated, filter]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }
            const response = await getMyAppointments(params);
            if (response.success) {
                setAppointments(response.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await cancelAppointment(id);
            fetchAppointments();
        } catch (err) {
            alert(err.message || 'Failed to cancel appointment');
        }
    };

    const handleViewPrescription = (appointmentId) => {
        const apt = appointments.find(a => a._id === appointmentId);
        setSelectedAppointment(apt);
        setIsViewModalOpen(true);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
                        <p className="text-gray-600">View and manage your dental appointments</p>
                    </div>
                    <Link href="/doctors" className="mt-4 md:mt-0">
                        <Button>Book New Appointment</Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
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
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                    <div className="flex flex-wrap items-center gap-6 text-xs">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Appt. Status:</span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">Confirmed</span>
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Completed</span>
                            </div>
                        </div>
                        <div className="h-4 w-px bg-gray-200 hidden md:block" />
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Payment:</span>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700">Pending</span>
                                <span className="px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">Paid</span>
                                <span className="px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700">Failed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                                <div className="flex justify-between mb-4">
                                    <div className="h-6 bg-gray-200 rounded w-24" />
                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                </div>
                                <div className="h-16 bg-gray-200 rounded mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? "You haven't booked any appointments yet."
                                : `No ${filter} appointments found.`}
                        </p>
                        <Link href="/doctors">
                            <Button>Book Your First Appointment</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {appointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                onCancel={handleCancel}
                                onViewPrescription={handleViewPrescription}
                            />
                        ))}
                    </div>
                )}

                {isViewModalOpen && selectedAppointment && (
                    <ViewPrescriptionModal
                        appointmentId={selectedAppointment._id}
                        patientName={selectedAppointment.patient?.name || user?.name}
                        onClose={() => setIsViewModalOpen(false)}
                    />
                )}
            </div>
        </div>
    );
}
