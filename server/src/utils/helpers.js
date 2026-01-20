/**
 * Generate time slots based on start time, end time, and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @param {number} duration - Slot duration in minutes
 * @returns {Array} Array of time slot objects
 */
const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMin = currentMinutes % 60;
        const slotEndMinutes = currentMinutes + duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        slots.push({
            start: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`,
            end: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`,
        });

        currentMinutes += duration;
    }

    return slots;
};

/**
 * Get day name from date
 * @param {Date} date - Date object
 * @returns {string} Day name in lowercase
 */
const getDayName = (date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

/**
 * Check if two time slots overlap
 * @param {Object} slot1 - First time slot { start, end }
 * @param {Object} slot2 - Second time slot { start, end }
 * @returns {boolean} True if slots overlap
 */
const doTimeSlotsOverlap = (slot1, slot2) => {
    const toMinutes = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const start1 = toMinutes(slot1.start);
    const end1 = toMinutes(slot1.end);
    const start2 = toMinutes(slot2.start);
    const end2 = toMinutes(slot2.end);

    return start1 < end2 && start2 < end1;
};

module.exports = {
    generateTimeSlots,
    getDayName,
    formatDate,
    doTimeSlotsOverlap,
};
