import { formatDate, formatTimeSlot, getStatusColor, getPaymentStatusColor, capitalize } from '@/utils/helpers';

const AppointmentCard = ({ appointment, onCancel, showDoctor = true }) => {
    const statusColor = getStatusColor(appointment.status);
    const patientInfo = appointment.patient || appointment.guestInfo;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        Status: {capitalize(appointment.status)}
                    </span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                        Payment: {capitalize(appointment.paymentStatus || 'pending')}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Appointment ID</p>
                    <p className="font-mono text-xs text-gray-400">
                        {appointment._id?.slice(-8).toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                {/* Doctor Info */}
                {showDoctor && appointment.doctor && (
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                                {appointment.doctor.name?.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">
                                Dr. {appointment.doctor.name}
                            </p>
                            <p className="text-sm text-blue-600">
                                {appointment.doctor.specialty}
                            </p>
                        </div>
                    </div>
                )}

                {/* Patient Info (for admin view) */}
                {!showDoctor && patientInfo && (
                    <div>
                        <p className="text-sm text-gray-500">Patient</p>
                        <p className="font-medium text-gray-900">{patientInfo.name}</p>
                        <p className="text-sm text-gray-600">{patientInfo.email}</p>
                    </div>
                )}

                {/* Date & Time */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{formatTimeSlot(appointment.timeSlot)}</span>
                    </div>
                </div>

                {/* Reason */}
                {appointment.reason && (
                    <div>
                        <p className="text-sm text-gray-500">Reason</p>
                        <p className="text-sm text-gray-700">{appointment.reason}</p>
                    </div>
                )}

                {/* Notes */}
                {appointment.notes && (
                    <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            {onCancel && ['pending', 'confirmed'].includes(appointment.status) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => onCancel(appointment._id)}
                        className="text-red-600 text-sm font-medium hover:text-red-700"
                    >
                        Cancel Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;
