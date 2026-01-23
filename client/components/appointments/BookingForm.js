'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDoctorAvailability } from '@/services/doctorService';
import { createAppointment } from '@/services/appointmentService';
import { initiatePayment } from '@/services/paymentService';
import { formatDateForAPI, formatDate } from '@/utils/helpers';
import Calendar from '../ui/Calendar';
import TimeSlotPicker from './TimeSlotPicker';
import Input from '../ui/Input';
import Button from '../ui/Button';

const BookingForm = ({ doctor, onSuccess }) => {
    const { user, isAuthenticated } = useAuth();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payLaterLoading, setPayLaterLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Guest info
    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [reason, setReason] = useState('');

    // Get available days from doctor
    const availableDays = doctor?.availability?.map(a => a.day) || [];

    const fetchAvailableSlots = useCallback(async () => {
        try {
            setSlotsLoading(true);
            setSelectedSlot(null);
            const dateStr = formatDateForAPI(selectedDate);
            const response = await getDoctorAvailability(doctor._id, dateStr);
            if (response.success) {
                setAvailableSlots(response.data.availableSlots || []);
            }
        } catch (err) {
            console.error('Failed to fetch slots:', err);
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [selectedDate, doctor?._id]);

    // Fetch slots when date changes
    useEffect(() => {
        if (selectedDate && doctor?._id) {
            fetchAvailableSlots();
        }
    }, [selectedDate, doctor?._id, fetchAvailableSlots]);

    const validateForm = () => {
        if (!selectedDate) {
            setError('Please select a date');
            return false;
        }
        if (!selectedSlot) {
            setError('Please select a time slot');
            return false;
        }
        if (!isAuthenticated && (!guestInfo.name || !guestInfo.email)) {
            setError('Please provide your name and email');
            return false;
        }
        return true;
    };

    const getAppointmentData = () => {
        const appointmentData = {
            doctorId: doctor._id,
            date: formatDateForAPI(selectedDate),
            timeSlot: selectedSlot,
            reason,
        };

        if (!isAuthenticated) {
            appointmentData.guestInfo = guestInfo;
        }

        return appointmentData;
    };

    const handlePayNow = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        try {
            setLoading(true);
            const appointmentData = getAppointmentData();
            const response = await initiatePayment(appointmentData);

            if (response.success && response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                setError('Failed to initiate payment. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    const handlePayLater = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        try {
            setPayLaterLoading(true);
            const appointmentData = getAppointmentData();
            const response = await createAppointment(appointmentData);

            if (response.success) {
                setSuccess(true);
                setSuccessMessage(
                    `Your appointment request with Dr. ${doctor.name} on ${formatDate(selectedDate)} at ${selectedSlot.start} is pending admin review.`
                );
                if (onSuccess) onSuccess(response.data);
            } else {
                setError(response.message || 'Failed to book appointment');
            }
        } catch (err) {
            setError(err.message || 'Failed to book appointment');
        } finally {
            setPayLaterLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Request Submitted!</h3>
                <p className="text-gray-600 mb-4">
                    {successMessage}
                </p>
                <p className="text-sm text-gray-500">
                    {isAuthenticated
                        ? 'You can view your appointments in your dashboard. An admin will review your request shortly.'
                        : 'A confirmation email will be sent once your request is approved.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Step 1: Select Date */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    1. Select a Date
                </h3>
                <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    availableDays={availableDays}
                />
            </div>

            {/* Step 2: Select Time */}
            {selectedDate && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        2. Select a Time Slot
                    </h3>
                    <TimeSlotPicker
                        slots={availableSlots}
                        selectedSlot={selectedSlot}
                        onSlotSelect={setSelectedSlot}
                        loading={slotsLoading}
                    />
                </div>
            )}

            {/* Step 3: Guest Info (if not authenticated) */}
            {selectedSlot && !isAuthenticated && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        3. Your Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            name="name"
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone (Optional)"
                            type="tel"
                            name="phone"
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        />
                    </div>
                </div>
            )}

            {/* Reason for visit */}
            {selectedSlot && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {isAuthenticated ? '3' : '4'}. Reason for Visit (Optional)
                    </h3>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe your dental concern..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                    />
                </div>
            )}

            {/* Summary & Submit */}
            {selectedSlot && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Doctor:</span> Dr. {doctor.name}</p>
                        <p><span className="font-medium">Specialty:</span> {doctor.specialty}</p>
                        <p><span className="font-medium">Price:</span> {doctor.price} BDT</p>
                        <p><span className="font-medium">Date:</span> {formatDate(selectedDate)}</p>
                        <p><span className="font-medium">Time:</span> {selectedSlot.start} - {selectedSlot.end}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={handlePayNow}
                    className="flex-1"
                    size="lg"
                    disabled={!selectedDate || !selectedSlot || loading || payLaterLoading}
                    loading={loading}
                >
                    Pay Now
                </Button>
                <Button
                    onClick={handlePayLater}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    disabled={!selectedDate || !selectedSlot || loading || payLaterLoading}
                    loading={payLaterLoading}
                >
                    Pay Later
                </Button>
            </div>
        </div>
    );
};

export default BookingForm;
