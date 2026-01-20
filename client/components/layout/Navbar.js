'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '../ui/Button';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, isDoctor, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            DentCare
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/doctors" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                            Our Doctors
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link href="/appointments" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                    My Appointments
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                        Admin Dashboard
                                    </Link>
                                )}
                                {isDoctor && (
                                    <Link href="/doctor/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                                        Doctor Dashboard
                                    </Link>
                                )}
                                <div className="flex items-center space-x-4">
                                    <Link href={isDoctor ? "/doctor/profile" : "/profile"} className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="font-medium">{user?.name}</span>
                                    </Link>
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-3">
                            <Link href="/" className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href="/doctors" className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                Our Doctors
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link href="/appointments" className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                        My Appointments
                                    </Link>
                                    {isAdmin && (
                                        <Link href="/admin" className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {isDoctor && (
                                        <Link href="/doctor/dashboard" className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                            Doctor Dashboard
                                        </Link>
                                    )}
                                    <Link href={isDoctor ? "/doctor/profile" : "/profile"} className="text-gray-600 hover:text-blue-600 px-2 py-2" onClick={() => setMobileMenuOpen(false)}>
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                        className="text-left text-red-600 px-2 py-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 pt-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">Login</Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">Sign Up</Button>
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
