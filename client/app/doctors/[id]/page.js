'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getDoctor } from '@/services/doctorService';
import BookingForm from '@/components/appointments/BookingForm';
import Button from '@/components/ui/Button';

export default function DoctorDetailPage({ params }) {
    const resolvedParams = use(params);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDoctor();
    }, [resolvedParams.id]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const response = await getDoctor(resolvedParams.id);
            if (response.success) {
                setDoctor(response.data);
            }
        } catch (err) {
            setError(err.message || 'Failed to load doctor details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl p-6">
                                    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4" />
                                    <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl p-6 h-96" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !doctor) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-2xl shadow-lg p-12">
                        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
                        <p className="text-gray-600 mb-6">{error || 'The doctor you are looking for does not exist.'}</p>
                        <Link href="/doctors">
                            <Button>Back to Doctors</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Doctors
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Doctor Info Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            {/* Avatar */}
                            <div className="text-center mb-6">
                                <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-4xl font-bold text-white">
                                        {doctor.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h1>
                                <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${doctor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {doctor.status === 'active' ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            {/* Bio */}
                            {doctor.bio && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">About</h3>
                                    <p className="text-gray-600 text-sm">{doctor.bio}</p>
                                </div>
                            )}

                            {/* Contact */}
                            <div className="space-y-3">
                                {doctor.email && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {doctor.email}
                                    </div>
                                )}
                                {doctor.phone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {doctor.phone}
                                    </div>
                                )}
                            </div>

                            {/* Availability Schedule */}
                            {doctor.availability && doctor.availability.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Working Hours</h3>
                                    <div className="space-y-2">
                                        {doctor.availability.map((avail, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-gray-600 capitalize">{avail.day}</span>
                                                <span className="text-gray-900 font-medium">
                                                    {avail.startTime} - {avail.endTime}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

                            {doctor.status === 'active' ? (
                                <BookingForm doctor={doctor} />
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500">This doctor is currently unavailable for appointments.</p>
                                    <Link href="/doctors" className="mt-4 inline-block">
                                        <Button>Find Another Doctor</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
