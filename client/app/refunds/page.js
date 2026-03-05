'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getMyRefundRequests } from '@/services/refundService';
import { formatDate } from '@/utils/helpers';

export default function MyRefundsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [refundRequests, setRefundRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchMyRefunds();
        }
    }, [user]);

    const fetchMyRefunds = async () => {
        try {
            setLoading(true);
            const data = await getMyRefundRequests();
            // API returns { success: true, count: X, data: [...] }
            setRefundRequests(data.data || data.refundRequests || []);
        } catch (err) {
            setError('Failed to fetch refund requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            approved: 'bg-blue-100 text-blue-800 border-blue-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            processed: 'bg-green-100 text-green-800 border-green-200'
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pending',
            approved: 'Processing',
            rejected: 'Rejected',
            processed: 'Refunded'
        };
        return labels[status] || status;
    };

    const getStatusMessage = (status) => {
        const messages = {
            pending: 'Your refund request is being reviewed by admin',
            approved: 'Refund approved! Processing payment...',
            rejected: 'Your refund request was rejected',
            processed: 'Your refund has been completed successfully!'
        };
        return messages[status] || '';
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="bg-white border-b relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-purple-50/50 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -z-0"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <div className="max-w-xl">
                        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                            My <span className="text-purple-600">Refunds</span>
                        </h1>
                        <p className="text-gray-500 mt-4 text-xl font-medium leading-relaxed">
                            Track the status of your refund requests and view refund history.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
                    </div>
                ) : refundRequests.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Refund Requests</h3>
                        <p className="text-gray-500 mt-1">You haven&apos;t made any refund requests yet.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            You can request a refund from cancelled paid appointments in your History page.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {refundRequests.map((request) => (
                            <div key={request._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                        <div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(request.status)}`}>
                                                {getStatusLabel(request.status)}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {getStatusMessage(request.status)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Request ID</p>
                                            <p className="font-mono text-sm text-gray-600">{request._id?.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Appointment Details */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Appointment Details</h4>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="font-medium text-gray-900">
                                                    Dr. {request.appointment?.doctor?.name || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {request.appointment?.date ? formatDate(request.appointment.date) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount Details */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Refund Amount</h4>
                                            <div className="bg-purple-50 rounded-xl p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Original Amount:</span>
                                                    <span className="font-medium text-gray-900">৳{request.originalAmount}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-100">
                                                    <span className="text-sm font-medium text-purple-700">Refund ({request.refundPercentage}%):</span>
                                                    <span className="font-bold text-purple-700 text-lg">৳{request.refundAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Reason</h4>
                                        <p className="text-gray-700 bg-gray-50 rounded-xl p-4 text-sm">{request.reason}</p>
                                    </div>

                                    {/* Admin Note (if rejected) */}
                                    {request.status === 'rejected' && request.adminNote && (
                                        <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Admin Response</h4>
                                            <p className="text-red-700 text-sm">{request.adminNote}</p>
                                        </div>
                                    )}

                                    {/* Processed Info */}
                                    {request.status === 'processed' && (
                                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="font-medium">৳{request.refundAmount} has been refunded to your account</span>
                                            </div>
                                            {request.processedAt && (
                                                <p className="text-sm text-green-600 mt-1">
                                                    Refunded on {formatDate(request.processedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                                        <span>Requested: {formatDate(request.createdAt)}</span>
                                        {request.updatedAt !== request.createdAt && (
                                            <span>Updated: {formatDate(request.updatedAt)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
