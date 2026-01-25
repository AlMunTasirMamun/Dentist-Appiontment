/**
 * Format date to display string
 */
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Format date to YYYY-MM-DD for API
 */
export const formatDateForAPI = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

/**
 * Format time slot to display string
 */
export const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return '';
    return `${timeSlot.start} - ${timeSlot.end}`;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        consulted: 'bg-indigo-100 text-indigo-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        paid: 'bg-green-100 text-green-800 border-green-200',
        failed: 'bg-red-100 text-red-800 border-red-200',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        refunded: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get day name from date
 */
export const getDayName = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date(date).getDay()];
};

/**
 * Check if date is in the past
 */
export const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(date) < today;
};

/**
 * Generate array of dates for calendar
 */
export const generateCalendarDates = (startDate, days = 14) => {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        dates.push(date);
    }

    return dates;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
