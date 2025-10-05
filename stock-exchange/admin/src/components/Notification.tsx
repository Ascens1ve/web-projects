import { useEffect, useRef } from "react";
import './Notification.css';
import { RootState, useDispatch, useSelector } from "../store/store";
import { close, INotification, remove } from "../store/notificationSlice";

interface NotificationProps {
    autoCloseDuration?: number;
}

export const Notification = ({ autoCloseDuration = 3000 }: NotificationProps) => {
    const dispatch = useDispatch();
    const notification: INotification = useSelector((s: RootState) => s.notification.notifications[0] || null);

    const idRef = useRef<string | null>(null);
    idRef.current = notification?.id ?? null;

    const handleClose = () => dispatch(close({ id: notification.id }));

    useEffect(() => {
        if (!notification) return;
        if (autoCloseDuration > 0) {
            const timer = setTimeout(() => handleClose(), autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [notification, notification?.id, autoCloseDuration, handleClose]);

    useEffect(() => {
        if (!notification) return;
        if (notification.open) return;
        const timer = setTimeout(() => {
            const id = idRef.current;
            if (id) dispatch(remove({ id }));
        }, 350);

        return () => clearTimeout(timer);
    }, [notification?.open, notification?.id, dispatch]);

    return (
        <div
            className={`
                notification
                notification_${notification?.type}
                ${notification?.open ? 'notification_open' : ''}
            `}
        >
            <span className="notification__text">{notification?.message}</span>
            <button className="notification__button" onClick={handleClose}>×</button>
        </div>
    );
};
