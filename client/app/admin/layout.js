'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isAdmin) {
                router.push('/');
            }
        }
    }, [loading, isAuthenticated, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <a href="/admin" className="hover:text-blue-100">Dashboard</a>
                            <a href="/admin/doctors" className="hover:text-blue-100">Doctors</a>
                            <a href="/admin/appointments" className="hover:text-blue-100">Appointments</a>
                            <a href="/admin/users" className="hover:text-blue-100">Users</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="py-8">
                {children}
            </div>
        </div>
    );
}
