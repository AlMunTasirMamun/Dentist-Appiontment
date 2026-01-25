'use client';

import { useState } from 'react';
import { createPrescription } from '@/services/prescriptionService';
import { updateAppointment } from '@/services/appointmentService';

export default function PrescriptionModal({ appointment, onClose, onPrescriptionCreated }) {
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
    };

    const removeMedicine = (index) => {
        const newMedicines = medicines.filter((_, i) => i !== index);
        setMedicines(newMedicines);
    };

    const handleMedicineChange = (index, field, value) => {
        const newMedicines = [...medicines];
        newMedicines[index][field] = value;
        setMedicines(newMedicines);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Create Prescription
            await createPrescription({
                appointmentId: appointment._id,
                medicines: medicines.filter(m => m.name),
                diagnosis,
                advice,
            });

            // 2. Update Appointment Status to 'consulted'
            await updateAppointment(appointment._id, { status: 'consulted' });

            onPrescriptionCreated();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Create Prescription</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Patient: {appointment.patient?.name || appointment.guestInfo?.name}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                        <textarea
                            required
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Enter diagnosis..."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Medicines</label>
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                + Add Medicine
                            </button>
                        </div>
                        <div className="space-y-4">
                            {medicines.map((med, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-xl relative">
                                    {medicines.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedicine(index)}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Medicine Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={med.name}
                                                onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                                                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Dosage (e.g. 1-0-1)</label>
                                            <input
                                                required
                                                type="text"
                                                value={med.dosage}
                                                onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Duration (e.g. 7 days)</label>
                                            <input
                                                required
                                                type="text"
                                                value={med.duration}
                                                onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                                                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Instructions (Optional)</label>
                                            <input
                                                type="text"
                                                value={med.instructions}
                                                onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                                                className="w-full px-3 py-1.5 border rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Advice (Optional)</label>
                        <textarea
                            value={advice}
                            onChange={(e) => setAdvice(e.target.value)}
                            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                            placeholder="General health advice..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Save & Send Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
