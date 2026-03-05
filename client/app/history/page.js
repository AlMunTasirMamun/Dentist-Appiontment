'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getMyAppointments, cancelAppointment } from '@/services/appointmentService';
import { getPatientPrescriptions, downloadPrescription, downloadPrescriptionPDF } from '@/services/prescriptionService';
import { createRefundRequest, getMyRefundRequests } from '@/services/refundService';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import { formatDate } from '@/utils/helpers';

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    
    // Refund request state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedAppointmentForRefund, setSelectedAppointmentForRefund] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [submittingRefund, setSubmittingRefund] = useState(false);
    const [myRefundRequests, setMyRefundRequests] = useState([]);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const [aptRes, presRes, refundRes] = await Promise.all([
                getMyAppointments(),
                getPatientPrescriptions(user._id),
                getMyRefundRequests().catch(() => ({ data: [] }))
            ]);

            if (aptRes.success) setAppointments(aptRes.data);
            if (presRes.success) setPrescriptions(presRes.data);
            // API returns { success: true, count: X, data: [...] }
            setMyRefundRequests(refundRes.data || refundRes.refundRequests || []);
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

    const handleDownload = async () => {
        if (!selectedPrescription?._id) return;
        
        try {
            setDownloading(true);
            await downloadPrescription(selectedPrescription._id, `prescription_${user?.name || 'patient'}`);
        } catch (err) {
            console.error('Failed to download prescription:', err);
            alert(err.message || 'Failed to download prescription');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedPrescription?._id) return;
        
        try {
            setDownloadingPDF(true);
            await downloadPrescriptionPDF(selectedPrescription._id, `prescription_${user?.name || 'patient'}`);
        } catch (err) {
            console.error('Failed to download prescription PDF:', err);
            alert(err.message || 'Failed to download prescription PDF');
        } finally {
            setDownloadingPDF(false);
        }
    };

    // Refund request handlers
    const handleRequestRefund = (appointment) => {
        setSelectedAppointmentForRefund(appointment);
        setRefundReason('');
        setShowRefundModal(true);
    };

    // Cancel appointment - actually cancel via API and auto-create refund request
    const handleCancelAppointment = async (appointmentId) => {
        const appointment = appointments.find(apt => apt._id === appointmentId);
        
        let confirmMessage = 'Are you sure you want to cancel this appointment?';
        if (appointment?.paymentStatus === 'paid') {
            confirmMessage += '\n\nSince this appointment is paid, a refund request will be automatically created for 50% of the payment amount.';
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            await cancelAppointment(appointmentId);
            
            if (appointment?.paymentStatus === 'paid') {
                alert('Appointment cancelled successfully!\n\nA refund request has been automatically submitted. You will receive 50% of the payment amount once approved by admin.');
            } else {
                alert('Appointment cancelled successfully!');
            }
            
            // Refresh the appointments list
            fetchHistory();
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            alert(err.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    const handleSubmitRefundRequest = async () => {
        if (!refundReason.trim()) {
            alert('Please provide a reason for your refund request');
            return;
        }

        try {
            setSubmittingRefund(true);
            await createRefundRequest(selectedAppointmentForRefund._id, refundReason);
            alert('Refund request submitted successfully! You will receive 50% of the payment amount once approved by admin.');
            setShowRefundModal(false);
            setSelectedAppointmentForRefund(null);
            setRefundReason('');
            // Refresh appointments to show updated refund status
            fetchHistory();
        } catch (err) {
            console.error('Failed to submit refund request:', err);
            alert(err.response?.data?.message || 'Failed to submit refund request');
        } finally {
            setSubmittingRefund(false);
        }
    };

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
                                    <AppointmentCard 
                                        key={apt._id} 
                                        appointment={apt} 
                                        onCancel={handleCancelAppointment}
                                        onRequestRefund={handleRequestRefund}
                                    />
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
                                        {pres.prescriptionFile && (
                                            <div className="mt-2 flex items-center gap-1 text-[9px] text-teal-600 font-medium">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                File attached
                                            </div>
                                        )}
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

                            {/* Download as PDF Button - Always available */}
                            <div className="pt-4 border-t">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={downloadingPDF}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed font-medium"
                                >
                                    {downloadingPDF ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Generating PDF...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Download as PDF</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {selectedPrescription.prescriptionFile && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Report File</p>
                                    <div className="border rounded-xl overflow-hidden">
                                        {selectedPrescription.prescriptionFile.toLowerCase().endsWith('.pdf') ? (
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${selectedPrescription.prescriptionFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 transition-colors"
                                            >
                                                <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.92,12.31 10.92,12.31Z" />
                                                </svg>
                                                <div>
                                                    <p className="font-medium text-gray-900">View PDF Document</p>
                                                    <p className="text-xs text-gray-500">Click to open in new tab</p>
                                                </div>
                                            </a>
                                        ) : (
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${selectedPrescription.prescriptionFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <img
                                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${selectedPrescription.prescriptionFile}`}
                                                    alt="Prescription"
                                                    className="w-full h-auto max-h-64 object-contain bg-gray-50"
                                                />
                                                <p className="text-xs text-center text-gray-500 py-2">Click to view full image</p>
                                            </a>
                                        )}
                                    </div>
                                    {/* Download Button */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading}
                                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                                    >
                                        {downloading ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Downloading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>Download Report</span>
                                            </>
                                        )}
                                    </button>
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

            {/* Refund Request Modal */}
            {showRefundModal && selectedAppointmentForRefund && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Request Refund</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    You will receive 50% of the payment amount
                                </p>
                            </div>
                            <button 
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setSelectedAppointmentForRefund(null);
                                    setRefundReason('');
                                }} 
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Appointment Info */}
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Appointment</span>
                                    <span className="text-xs font-mono text-gray-400">
                                        #{selectedAppointmentForRefund._id?.slice(-8).toUpperCase()}
                                    </span>
                                </div>
                                <p className="font-medium text-gray-900">
                                    Dr. {selectedAppointmentForRefund.doctor?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {formatDate(selectedAppointmentForRefund.date)}
                                </p>
                            </div>

                            {/* Refund Amount Info */}
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-green-700">Original Amount</span>
                                    <span className="font-medium text-green-800">
                                        ৳{selectedAppointmentForRefund.amount || selectedAppointmentForRefund.doctor?.consultationFee || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                                    <span className="text-sm font-medium text-green-700">Refund Amount (50%)</span>
                                    <span className="font-bold text-green-800">
                                        ৳{Math.round((selectedAppointmentForRefund.amount || selectedAppointmentForRefund.doctor?.consultationFee || 0) * 0.5)}
                                    </span>
                                </div>
                            </div>

                            {/* Reason Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Refund Request *
                                </label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Please explain why you are requesting a refund..."
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={4}
                                />
                            </div>

                            {/* Note */}
                            <p className="text-xs text-gray-500">
                                <span className="font-medium">Note:</span> Your refund request will be reviewed by our admin team. 
                                Once approved, the refund will be processed to your original payment method.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setShowRefundModal(false);
                                        setSelectedAppointmentForRefund(null);
                                        setRefundReason('');
                                    }}
                                    className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitRefundRequest}
                                    disabled={submittingRefund || !refundReason.trim()}
                                    className="flex-1 px-4 py-2.5 text-white bg-purple-600 rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                                >
                                    {submittingRefund ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
