'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDoctors } from '@/services/doctorService';
import { getAppointments } from '@/services/appointmentService';
import api from '@/services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalAppointments: 0,
        totalUsers: 0,
        pendingAppointments: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch doctors
            const doctorsRes = await getDoctors({ status: 'all' });

            // Fetch appointments
            const appointmentsRes = await getAppointments();
            const pendingRes = await getAppointments({ status: 'pending' });

            // Fetch users
            const usersRes = await api.get('/users');

            setStats({
                totalDoctors: doctorsRes.data?.length || 0,
                totalAppointments: appointmentsRes.data?.length || 0,
                totalUsers: usersRes.data?.length || 0,
                pendingAppointments: pendingRes.data?.length || 0,
            });

            setRecentAppointments(appointmentsRes.data?.slice(0, 5) || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color, link }) => (
        <Link href={link} className="block">
            <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 ${color}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">
                            {loading ? '...' : value}
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
                        {icon}
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Doctors"
                    value={stats.totalDoctors}
                    color="border-blue-500"
                    link="/admin/doctors"
                    icon={
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Appointments"
                    value={stats.totalAppointments}
                    color="border-green-500"
                    link="/admin/appointments"
                    icon={
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Pending Appointments"
                    value={stats.pendingAppointments}
                    color="border-yellow-500"
                    link="/admin/appointments"
                    icon={
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    color="border-purple-500"
                    link="/admin/users"
                    icon={
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/doctors?action=create" className="flex items-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <span className="font-medium text-gray-900">Add New Doctor</span>
                        </Link>
                        <Link href="/admin/appointments" className="flex items-center p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <span className="font-medium text-gray-900">Manage Appointments</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Appointments</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentAppointments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No appointments yet</p>
                    ) : (
                        <div className="space-y-3">
                            {recentAppointments.map((apt) => (
                                <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {apt.patient?.name || apt.guestInfo?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {apt.doctor?.name} • {new Date(apt.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                        }`}>
                                        {apt.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
