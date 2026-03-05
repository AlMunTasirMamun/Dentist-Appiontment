'use client';

import { NotificationProvider } from '@/context/NotificationContext';
import NotificationToast from '@/components/ui/NotificationToast';

export default function NotificationWrapper({ children }) {
    return (
        <NotificationProvider>
            {children}
            <NotificationToast />
        </NotificationProvider>
    );
}
