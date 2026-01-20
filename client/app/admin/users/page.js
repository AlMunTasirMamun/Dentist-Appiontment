'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
    const { user: currentUser, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'client'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            if (response.success) {
                setUsers(response.data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        // Prevent demoting the last admin
        if (newRole === 'client') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            const userToUpdate = users.find(u => u._id === userId);
            if (adminCount <= 1 && userToUpdate?.role === 'admin') {
                alert('At least one administrator must remain in the system.');
                return;
            }
        }

        try {
            await api.put(`/users/${userId}`, { role: newRole });

            // If the user demoted themselves, logout and redirect
            if (userId === currentUser?._id && newRole !== 'admin') {
                alert('Your role has been changed. You will be redirected to the homepage.');
                logout();
                router.push('/');
                return;
            }

            fetchUsers();
        } catch (err) {
            alert(err.message || 'Failed to update role');
        }
    };

    const handleDelete = async (userId) => {
        const userToDelete = users.find(u => u._id === userId);

        // Prevent deleting the last admin
        if (userToDelete?.role === 'admin') {
            const adminCount = users.filter(u => u.role === 'admin').length;
            if (adminCount <= 1) {
                alert('At least one administrator must remain in the system. You cannot delete the last admin.');
                return;
            }
        }

        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${userId}`);

            // If the user deleted themselves, logout and redirect
            if (userId === currentUser?._id) {
                alert('Your account has been deleted.');
                logout();
                router.push('/');
                return;
            }

            fetchUsers();
        } catch (err) {
            alert(err.message || 'Failed to delete user');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        try {
            const response = await api.post('/users', formData);
            if (response.success) {
                fetchUsers();
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', phone: '', role: 'client' });
            }
        } catch (err) {
            alert(err.message || 'Failed to create user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">
                        Total {users.length} registered users
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name, email or phone..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add New User
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                        <p className="mt-4 text-gray-500">Loading users...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or add a new user.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Role</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Join Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/80">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white shadow-sm ring-2 ring-white">
                                                    <span className="font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-semibold text-gray-900 leading-tight">{user.name}</p>
                                                    <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.phone ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {user.phone}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Not provided</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className={`px-2 py-1 rounded-lg border-none text-xs font-bold uppercase tracking-wider ring-1 transition-all ${user.role === 'admin'
                                                        ? 'bg-purple-50 text-purple-700 ring-purple-200 focus:ring-purple-500'
                                                        : 'bg-blue-50 text-blue-700 ring-blue-200 focus:ring-blue-500'
                                                        }`}
                                                >
                                                    <option value="client">Client</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
                            <h2 className="text-2xl font-bold">Add New User</h2>
                            <p className="text-blue-100">Create a new client or admin account</p>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="client">Client</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
