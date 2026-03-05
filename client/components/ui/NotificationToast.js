'use client';

import { useNotification } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';

export default function NotificationToast() {
    const { notifications, removeNotification } = useNotification();
    const router = useRouter();

    if (notifications.length === 0) return null;

    const handleClick = (notification) => {
        if (notification.type === 'prescription') {
            router.push('/history');
        }
        removeNotification(notification.id);
    };

    return (
        <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-in-right"
                    style={{
                        animation: 'slideInRight 0.3s ease-out forwards',
                    }}
                >
                    {/* Header */}
                    <div className={`px-4 py-2 flex items-center gap-2 ${
                        notification.type === 'prescription' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                        {notification.type === 'prescription' ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        )}
                        <span className="text-white font-semibold text-sm flex-1">{notification.title}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                            }}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleClick(notification)}
                    >
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {notification.message}
                        </p>
                        
                        {notification.type === 'prescription' && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 text-xs font-semibold">
                                <span>Click to view prescription</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Progress bar for auto-dismiss */}
                    {!notification.persistent && (
                        <div className="h-1 bg-gray-100">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                style={{
                                    animation: 'shrink 10s linear forwards',
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}

            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes shrink {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </div>
    );
}
