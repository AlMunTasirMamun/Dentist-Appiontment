'use client';

import { useState, useEffect } from 'react';
import { getPrescriptionByAppointment, downloadPrescription, downloadPrescriptionPDF } from '@/services/prescriptionService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/helpers';
import EditPrescriptionModal from './EditPrescriptionModal';

export default function ViewPrescriptionModal({ appointmentId, patientName, onClose, onPrescriptionUpdated }) {
    const { isDoctor } = useAuth();
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    const handleDownload = async () => {
        if (!prescription?._id) return;
        
        try {
            setDownloading(true);
            await downloadPrescription(prescription._id, `prescription_${patientName}`);
        } catch (err) {
            setError(err.message || 'Failed to download prescription');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!prescription?._id) return;
        
        try {
            setDownloadingPDF(true);
            await downloadPrescriptionPDF(prescription._id, `prescription_${patientName}`);
        } catch (err) {
            setError(err.message || 'Failed to download prescription PDF');
        } finally {
            setDownloadingPDF(false);
        }
    };

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    const handlePrescriptionUpdated = async () => {
        // Refresh the prescription data
        try {
            const response = await getPrescriptionByAppointment(appointmentId);
            if (response.success) {
                setPrescription(response.data);
            }
        } catch (err) {
            console.error('Error refreshing prescription:', err);
        }
        setIsEditModalOpen(false);
        if (onPrescriptionUpdated) {
            onPrescriptionUpdated();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Prescription Details</h3>
                        <p className="text-sm text-gray-500">Patient: {patientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Edit Button for Doctors */}
                        {isDoctor && prescription && (
                            <button 
                                onClick={handleEditClick}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Prescription"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
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

                        {prescription.prescriptionFile && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Report File</p>
                                <div className="border rounded-xl overflow-hidden">
                                    {prescription.prescriptionFile.toLowerCase().endsWith('.pdf') ? (
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${prescription.prescriptionFile}`}
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
                                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${prescription.prescriptionFile}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'}${prescription.prescriptionFile}`}
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
                                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
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
                    </div>
                )}

                <div className="mt-8 pt-6 border-t flex justify-between items-center">
                    {/* Edit Button for Doctors - shown at bottom too */}
                    {isDoctor && prescription && (
                        <button
                            onClick={handleEditClick}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Prescription
                        </button>
                    )}
                    {!isDoctor && <div></div>}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Edit Prescription Modal */}
            {isEditModalOpen && prescription && (
                <EditPrescriptionModal
                    prescription={prescription}
                    onClose={() => setIsEditModalOpen(false)}
                    onPrescriptionUpdated={handlePrescriptionUpdated}
                />
            )}
        </div>
    );
}
