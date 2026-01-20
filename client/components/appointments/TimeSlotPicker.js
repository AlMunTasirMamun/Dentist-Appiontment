'use client';

const TimeSlotPicker = ({
    slots = [],
    selectedSlot,
    onSlotSelect,
    loading = false
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No available slots for this date</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {slots.map((slot, index) => {
                const isSelected = selectedSlot?.start === slot.start;

                return (
                    <button
                        key={index}
                        onClick={() => onSlotSelect(slot)}
                        className={`
              py-3 px-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg scale-105'
                                : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }
            `}
                    >
                        {slot.start}
                    </button>
                );
            })}
        </div>
    );
};

export default TimeSlotPicker;
