'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getRefundRequests, approveRefund, rejectRefund } from '../../../services/refundService';
import { formatDate } from '../../../utils/helpers';

export default function AdminRefundsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending');
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(null);
  const [lastApprovalResult, setLastApprovalResult] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRefundRequests();
    }
  }, [user, filter]);

  const fetchRefundRequests = async () => {
    try {
      setLoading(true);
      const data = await getRefundRequests(filter);
      // API returns { success: true, count: X, data: [...] }
      setRefundRequests(data.data || data.refundRequests || []);
    } catch (err) {
      setError('Failed to fetch refund requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Are you sure you want to approve this refund request? 50% of the payment will be refunded.')) {
      return;
    }
    
    try {
      setProcessingId(id);
      const result = await approveRefund(id, 'Refund approved by admin');
      await fetchRefundRequests();
      
      if (result.requiresManualProcessing && result.paymentInfo) {
        setLastApprovalResult(result);
        alert(`Refund approved! Manual processing required.\n\nRefund Amount: ৳${result.data?.refundAmount || 'N/A'}\n\nPayment Details:\n- Customer: ${result.paymentInfo.customerName}\n- Email: ${result.paymentInfo.customerEmail}\n- Phone: ${result.paymentInfo.customerPhone || 'N/A'}\n- Payment Method: ${result.paymentInfo.paymentMethod}\n- Transaction ID: ${result.paymentInfo.originalTransactionId}\n\nPlease process the refund via your payment gateway dashboard or bank transfer.`);
      } else {
        alert('Refund processed successfully! The patient will receive 50% of the payment amount.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve refund');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setProcessingId(rejectingId);
      await rejectRefund(rejectingId, rejectReason);
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason('');
      await fetchRefundRequests();
      alert('Refund request rejected');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject refund');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
        <p className="text-gray-600 mt-1">Manage patient refund requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {['pending', 'approved', 'rejected', 'processed', ''].map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : refundRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No refund requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter ? `No ${filter} refund requests found.` : 'No refund requests found.'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {refundRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.patient?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.patient?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Dr. {request.appointment?.doctor?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.appointment?.date ? formatDate(request.appointment.date) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Original: ৳{request.originalAmount}
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Refund: ৳{request.refundAmount} ({request.refundPercentage}%)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs">
                      <div className="text-gray-900 font-medium">
                        {request.paymentMethod || request.paymentDetails?.cardType || 'Online Payment'}
                      </div>
                      {request.paymentDetails?.cardNumber && (
                        <div className="text-gray-500">Card: ****{request.paymentDetails.cardNumber}</div>
                      )}
                      {request.transactionId && (
                        <div className="text-gray-500 font-mono text-xs">TXN: {request.transactionId}</div>
                      )}
                      {request.paymentDetails?.customerEmail && (
                        <div className="text-gray-500">{request.paymentDetails.customerEmail}</div>
                      )}
                      {request.paymentDetails?.customerPhone && (
                        <div className="text-gray-500">{request.paymentDetails.customerPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          disabled={processingId === request._id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          {processingId === request._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => openRejectModal(request._id)}
                          disabled={processingId === request._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && request.adminNote && (
                      <span className="text-gray-500 text-xs" title={request.adminNote}>
                        Note: {request.adminNote.substring(0, 20)}...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Refund Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this refund request. This will be visible to the patient.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingId ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
