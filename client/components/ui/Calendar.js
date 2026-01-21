'use client';

import { useState } from 'react';
import { generateCalendarDates, formatDateForAPI, getDayName, isPastDate } from '@/utils/helpers';

const Calendar = ({
    selectedDate,
    onDateSelect,
    availableDays = [], // Array of day names like ['monday', 'tuesday']
    minDate = new Date(),
    daysToShow = 14,
}) => {
    const [startDate, setStartDate] = useState(new Date());
    const dates = generateCalendarDates(startDate, daysToShow);

    const isDateAvailable = (date) => {
        if (isPastDate(date)) return false;
        const dayName = getDayName(date);
        return availableDays.length === 0 || availableDays.includes(dayName);
    };

    const isSelected = (date) => {
        if (!selectedDate) return false;
        return formatDateForAPI(date) === formatDateForAPI(selectedDate);
    };

    const handlePrevious = () => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() - 7);
        if (newStart >= minDate) {
            setStartDate(newStart);
        }
    };

    const handleNext = () => {
        const newStart = new Date(startDate);
        newStart.setDate(newStart.getDate() + 7);
        setStartDate(newStart);
    };

    const formatMonth = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    const formatDay = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={handlePrevious}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                    {dates[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                    type="button"
                    onClick={handleNext}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {dates.map((date, index) => {
                    const available = isDateAvailable(date);
                    const selected = isSelected(date);

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => available && onDateSelect(date)}
                            disabled={!available}
                            className={`
                flex flex-col items-center p-2 rounded-lg transition-all duration-200
                ${selected
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                    : available
                                        ? 'bg-gray-50 hover:bg-blue-50 text-gray-900 hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }
              `}
                        >
                            <span className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatDay(date)}
                            </span>
                            <span className="text-lg font-semibold">
                                {date.getDate()}
                            </span>
                            <span className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatMonth(date)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
