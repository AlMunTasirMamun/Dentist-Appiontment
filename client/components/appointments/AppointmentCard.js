import { formatDate, formatTimeSlot, getStatusColor, getPaymentStatusColor, capitalize } from '@/utils/helpers';

const AppointmentCard = ({ appointment, onCancel, onPrescribe, onViewPrescription, onComplete, onRequestRefund, showDoctor = true }) => {
    const statusColor = getStatusColor(appointment.status);
    const patientInfo = appointment.patient || appointment.guestInfo;
    
    // Check if refund can be requested: paid appointments that are cancelled and no refund requested yet
    const canRequestRefund = appointment.paymentStatus === 'paid' && 
        appointment.status === 'cancelled' && 
        (!appointment.refundStatus || appointment.refundStatus === 'none');

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                            {appointment.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                            {appointment.paymentStatus || 'pending'}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Appointment ID</p>
                    <p className="font-mono text-xs text-gray-400">
                        {appointment._id?.slice(-8).toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Doctor Info */}
                {showDoctor && appointment.doctor && (
                    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">
                                {appointment.doctor.name?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 leading-tight">
                                Dr. {appointment.doctor.name}
                            </p>
                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mt-0.5">
                                {appointment.doctor.specialty}
                            </p>
                        </div>
                    </div>
                )}

                {/* Patient Info (for admin view) */}
                {!showDoctor && patientInfo && (
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Patient</p>
                        <p className="font-bold text-gray-900 leading-tight">{patientInfo.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{patientInfo.email}</p>
                    </div>
                )}

                {/* Date & Time */}
                <div className="flex items-center justify-between p-3 bg-blue-50/30 rounded-2xl">
                    <div className="flex items-center space-x-2.5 text-blue-700">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-gray-600">
                        <div className="p-1.5 bg-white rounded-lg shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-bold">{formatTimeSlot(appointment.timeSlot)}</span>
                    </div>
                </div>

                {/* Reason */}
                {appointment.reason && (
                    <div className="px-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{appointment.reason}</p>
                    </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                    <div className="px-1 pt-2 border-t border-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Doctor Notes</p>
                        <p className="text-sm text-gray-500 italic leading-relaxed">&quot;{appointment.notes}&quot;</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
                {onCancel && ['pending', 'confirmed'].includes(appointment.status) && (
                    <button
                        onClick={() => onCancel(appointment._id)}
                        className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                        Cancel Appointment
                    </button>
                )}

                {['pending', 'confirmed'].includes(appointment.status) && appointment.doctor && onPrescribe && (
                    <button
                        onClick={() => onPrescribe(appointment)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                        Write Prescription
                    </button>
                )}

                {['consulted', 'completed'].includes(appointment.status) && onViewPrescription && (
                    <button
                        onClick={() => onViewPrescription(appointment._id)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                    >
                        View Prescription
                    </button>
                )}

                {appointment.status === 'consulted' && onComplete && (
                    <button
                        onClick={() => onComplete(appointment._id)}
                        className="text-green-600 text-sm font-medium hover:text-green-700"
                    >
                        Mark as Completed (Admin)
                    </button>
                )}

                {/* Refund Request Button */}
                {canRequestRefund && onRequestRefund && (
                    <button
                        onClick={() => onRequestRefund(appointment)}
                        className="text-purple-600 text-sm font-medium hover:text-purple-700 flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Request Refund
                    </button>
                )}

                {/* Refund Status */}
                {appointment.refundStatus && appointment.refundStatus !== 'none' && (
                    <div className={`w-full mt-2 p-2 rounded text-xs ${
                        appointment.refundStatus === 'requested' ? 'bg-yellow-50 text-yellow-700' :
                        appointment.refundStatus === 'approved' || appointment.refundStatus === 'processed' ? 'bg-green-50 text-green-700' :
                        appointment.refundStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-purple-50 text-purple-700'
                    }`}>
                        <span className="font-medium">Refund Status:</span> {appointment.refundStatus.charAt(0).toUpperCase() + appointment.refundStatus.slice(1)}
                        {appointment.refundAmount > 0 && appointment.refundStatus === 'processed' && (
                            <span> - BDT {appointment.refundAmount}</span>
                        )}
                    </div>
                )}

                {appointment.refundAmount > 0 && !appointment.refundStatus && (
                    <div className="w-full mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                        Refund of BDT {appointment.refundAmount} ({appointment.refundStatus})
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
