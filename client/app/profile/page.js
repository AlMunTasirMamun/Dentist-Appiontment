'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, isAuthenticated, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.put(`/users/${user._id}`, formData);
            if (response.success) {
                updateUser(response.data);
                setSuccess('Profile updated successfully!');
            }
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your account information</p>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <Input
                            label="Phone Number"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 234 567 890"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Account Role
                            </label>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {user?.role === 'admin' ? 'Administrator' : 'Client'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={loading}
                            >
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Account Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold gradient-text mb-1">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'}
                        </div>
                        <div className="text-gray-600 text-sm">Member Since</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                        <div className="text-3xl font-bold gradient-text mb-1">Active</div>
                        <div className="text-gray-600 text-sm">Account Status</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
