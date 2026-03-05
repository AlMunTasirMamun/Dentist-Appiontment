'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import Button from '../ui/Button';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, isDoctor, logout } = useAuth();
    const { notifications } = useNotification();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const unreadCount = notifications.length;

    // Hide navbar on admin routes
    if (pathname?.startsWith('/admin')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <nav className="bg-slate-900 text-white sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-400 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">
                            Dental<span className="text-teal-400">Portal</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/doctors" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                            Doctors
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link href="/appointments" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                                    Appointments
                                </Link>
                                {!isDoctor && !isAdmin && (
                                    <Link href="/history" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                                        History
                                    </Link>
                                )}
                                {!isDoctor && !isAdmin && (
                                    <Link href="/refunds" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                                        My Refunds
                                    </Link>
                                )}
                                {isAdmin && (
                                    <Link href="/admin" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                                        Admin
                                    </Link>
                                )}
                                {isDoctor && (
                                    <Link href="/doctor/dashboard" className="text-gray-300 hover:text-teal-400 transition-colors font-medium">
                                        Dashboard
                                    </Link>
                                )}
                                <div className="flex items-center space-x-4">
                                    {/* Notification Bell for Patients */}
                                    {!isDoctor && !isAdmin && (
                                        <Link href="/history" className="relative p-2 text-gray-300 hover:text-teal-400 transition-colors">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                    <Link href={isDoctor ? "/doctor/profile" : "/profile"} className="flex items-center space-x-2 text-gray-300 hover:text-teal-400">
                                        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-medium">Dashboard</span>
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-300 hover:text-white hover:bg-slate-800">
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-slate-800">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white border-none">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-slate-800"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-700">
                        <div className="flex flex-col space-y-3">
                            <Link href="/" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href="/doctors" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                Doctors
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link href="/appointments" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                        Appointments
                                    </Link>
                                    {!isDoctor && !isAdmin && (
                                        <Link href="/history" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            History
                                        </Link>
                                    )}
                                    {!isDoctor && !isAdmin && (
                                        <Link href="/refunds" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            My Refunds
                                        </Link>
                                    )}
                                    {isAdmin && (
                                        <Link href="/admin" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            Admin
                                        </Link>
                                    )}
                                    {isDoctor && (
                                        <Link href="/doctor/dashboard" className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                    )}
                                    <Link href={isDoctor ? "/doctor/profile" : "/profile"} className="text-gray-300 hover:text-teal-400 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="text-left text-red-400 px-2 py-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 pt-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-slate-600 text-gray-300 hover:bg-slate-800">Login</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full bg-teal-500 hover:bg-teal-600 border-none">Sign Up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
