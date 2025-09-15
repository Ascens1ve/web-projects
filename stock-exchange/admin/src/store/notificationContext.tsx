import React, { createContext, useContext, useState } from 'react';
import { Notification, NotificationType } from '../components/Notfication';

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

interface NotificationProviderProps {
    children: React.ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [type, setType] = useState<NotificationType>('warn');

    const showNotification = (msg: string, type: NotificationType) => {
        setMessage(msg);
        setType(type);
        setIsOpen(true);
    }

    const handleClose = () => setIsOpen(false);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            <Notification
                message={message}
                type={type}
                open={isOpen}
                onClose={handleClose}
                autoCloseDuration={3000}
            />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};
