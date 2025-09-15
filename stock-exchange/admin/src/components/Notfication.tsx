import { useEffect } from "react";
import './Notification.css';

export type NotificationType = 'success' | 'error' | 'warn';

interface NotificationProps {
    message: string;
    type: NotificationType;
    open: boolean;
    onClose: () => void;
    autoCloseDuration?: number;
}

export const Notification = ({ message, type, open, onClose, autoCloseDuration = 3000 }: NotificationProps) => {
    useEffect(() => {
        if (open && autoCloseDuration > 0) {
            const timer = setTimeout(onClose, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [open, autoCloseDuration, onClose]);
    return (
        <div className={`notification notification_${type} ${open ? 'notification_open' : ''}`}>
            <span className="notification__text">{message}</span>
            <button className="notification__button" onClick={onClose}>×</button>
        </div>
    );
};
