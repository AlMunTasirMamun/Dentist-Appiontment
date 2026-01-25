'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyAppointments } from '@/services/appointmentService';
import { getPatientPrescriptions } from '@/services/prescriptionService';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { formatDate } from '@/utils/helpers';

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const [aptRes, presRes] = await Promise.all([
                getMyAppointments(),
                getPatientPrescriptions(user._id)
            ]);

            if (aptRes.success) setAppointments(aptRes.data);
            if (presRes.success) setPrescriptions(presRes.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user, fetchHistory]);

    if (authLoading || (loading && appointments.length === 0)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="bg-white border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="max-w-xl">
                            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                                Patient <span className="text-blue-600">History</span>
                            </h1>
                            <p className="text-gray-500 mt-4 text-xl font-medium leading-relaxed">
                                Access your medical records, review past consultations, and track your dental health journey in one place.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Appointments</p>
                                <p className="text-2xl font-black text-blue-700">{appointments.length}</p>
                            </div>
                            <div className="bg-teal-50 px-6 py-3 rounded-2xl border border-teal-100">
                                <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Prescriptions</p>
                                <p className="text-2xl font-black text-teal-700">{prescriptions.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Appointments List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Appointments</h2>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No History Found</h3>
                                <p className="text-gray-500 mt-1">You haven&apos;t booked any appointments yet.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {appointments.map((apt) => (
                                    <AppointmentCard key={apt._id} appointment={apt} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prescriptions Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
                        <div className="space-y-4">
                            {prescriptions.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-gray-400 shadow-sm border border-white">
                                    <p className="text-sm">No prescriptions shared yet.</p>
                                </div>
                            ) : (
                                prescriptions.map((pres) => (
                                    <div
                                        key={pres._id}
                                        onClick={() => setSelectedPrescription(pres)}
                                        className="group bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                {formatDate(pres.createdAt)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{pres.diagnosis}</p>
                                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                                                Dr. {pres.doctor?.name}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-1.5">
                                            {pres.medicines.slice(0, 3).map((m, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[9px] font-bold uppercase rounded-md">
                                                    {m.name}
                                                </span>
                                            ))}
                                            {pres.medicines.length > 3 && (
                                                <span className="text-[9px] font-bold text-gray-300 uppercase">+{pres.medicines.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Prescription Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Prescription Details</h3>
                                <p className="text-sm text-gray-500">Date: {formatDate(selectedPrescription.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedPrescription(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-xl">
                                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Diagnosis</p>
                                <p className="text-gray-900 font-medium">{selectedPrescription.diagnosis}</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Medicines</p>
                                <div className="space-y-3">
                                    {selectedPrescription.medicines.map((med, i) => (
                                        <div key={i} className="flex justify-between p-3 border rounded-xl">
                                            <div>
                                                <p className="font-bold text-gray-900">{med.name}</p>
                                                <p className="text-xs text-gray-500">{med.instructions}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-blue-600">{med.dosage}</p>
                                                <p className="text-xs text-gray-400">{med.duration}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedPrescription.advice && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Advice</p>
                                    <p className="text-gray-700 text-sm italic">&quot;{selectedPrescription.advice}&quot;</p>
                                </div>
                            )}

                            <div className="pt-6 border-t flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-gray-500 font-bold">{selectedPrescription.doctor?.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Dr. {selectedPrescription.doctor?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedPrescription.doctor?.specialty}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
