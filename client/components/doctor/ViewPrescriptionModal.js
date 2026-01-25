'use client';

import { useState, useEffect } from 'react';
import { getPrescriptionByAppointment } from '@/services/prescriptionService';
import { formatDate } from '@/utils/helpers';

export default function ViewPrescriptionModal({ appointmentId, patientName, onClose }) {
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                setLoading(true);
                const response = await getPrescriptionByAppointment(appointmentId);
                if (response.success) {
                    setPrescription(response.data);
                }
            } catch (err) {
                setError(err.message || 'Failed to load prescription');
            } finally {
                setLoading(false);
            }
        };

        if (appointmentId) {
            fetchPrescription();
        }
    }, [appointmentId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Prescription Details</h3>
                        <p className="text-sm text-gray-500">Patient: {patientName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {loading ? (
                    <div className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </div>
                ) : error ? (
                    <div className="py-8 text-center text-red-600">
                        {error}
                    </div>
                ) : !prescription ? (
                    <div className="py-8 text-center text-gray-500">
                        No prescription found for this appointment.
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Diagnosis</p>
                            <p className="text-gray-900 font-medium">{prescription.diagnosis}</p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Medicines</p>
                            <div className="space-y-3">
                                {prescription.medicines.map((med, i) => (
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

                        {prescription.advice && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Advice</p>
                                <p className="text-gray-700 text-sm italic">&quot;{prescription.advice}&quot;</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
