'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }) {
    const router = useRouter();
    const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

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
                            <Link href="/admin" className="hover:text-blue-100">Dashboard</Link>
                            <Link href="/admin/doctors" className="hover:text-blue-100">Doctors</Link>
                            <Link href="/admin/appointments" className="hover:text-blue-100">Appointments</Link>
                            <Link href="/admin/users" className="hover:text-blue-100">Users</Link>
                            <Link href="/admin/messages" className="hover:text-blue-100">Messages</Link>
                            <span className="text-blue-200">|</span>
                            <Link href="/" className="hover:text-blue-100 flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hover:text-blue-100 flex items-center space-x-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
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
