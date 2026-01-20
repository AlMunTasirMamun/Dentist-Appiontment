'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getDoctorMe } from '@/services/doctorService';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function DoctorProfilePage() {
    const { user } = useAuth();
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDoctorInfo();
        }
    }, [user]);

    const fetchDoctorInfo = async () => {
        try {
            setLoading(true);
            const response = await getDoctorMe();
            if (response.success) {
                setDoctorInfo(response.data);
            }
        } catch (error) {
            console.error('Error fetching doctor info:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
                <div className="h-48 bg-gray-100 rounded-2xl mb-8" />
                <div className="h-96 bg-gray-50 rounded-2xl" />
            </div>
        );
    }

    if (!doctorInfo) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                <h3 className="text-xl font-semibold text-gray-900">Profile Not Found</h3>
                <p className="text-gray-500 mt-2">We couldn&apos;t load your profile information.</p>
            </div>
        );
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Header / Profile Info */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-cyan-500" />
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end gap-6">
                            {doctorInfo.image ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${doctorInfo.image}`}
                                    alt={doctorInfo.name}
                                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                                />
                            ) : (
                                <div className="w-32 h-32 bg-blue-100 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-blue-600 text-4xl font-bold">
                                    {doctorInfo.name?.charAt(0)}
                                </div>
                            )}
                            <div className="pb-2">
                                <h1 className="text-3xl font-bold text-gray-900">Dr. {doctorInfo.name}</h1>
                                <p className="text-blue-600 font-medium">{doctorInfo.specialty}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/doctor/dashboard">
                                <Button variant="secondary">Back to Dashboard</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Professional Bio</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {doctorInfo.bio || 'No bio provided.'}
                            </p>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{doctorInfo.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 004.516 4.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>{doctorInfo.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold text-gray-900">৳{doctorInfo.price} / consultation</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Practice Availability</h3>
                            <div className="space-y-3">
                                {days.map((day) => {
                                    const avail = doctorInfo.availability?.find(a => a.day === day);
                                    return (
                                        <div key={day} className="flex items-center justify-between p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                                            <span className="capitalize font-medium text-gray-700">{day}</span>
                                            {avail ? (
                                                <div className="text-sm text-blue-600 font-semibold">
                                                    {avail.startTime} - {avail.endTime}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Off Duty</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-blue-700 flex items-start gap-4">
                <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 className="font-bold">Profile Management Notice</h4>
                    <p className="text-sm mt-1">
                        Please note that your profile information is managed by the administrator.
                        If you need to update your availability, specialty, or bio, please contact the clinic administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
