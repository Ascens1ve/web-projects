import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { NotificationType } from "../interfaces";

export interface INotification {
    id: string;
    message: string;
    type: NotificationType;
    open: boolean;
}

export interface NotificationState {
    notifications: INotification[];
}

const initialState: NotificationState = {
    notifications: [],
};

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        show(state: NotificationState, action: PayloadAction<Omit<INotification, 'open' | 'id'>>) {
            state.notifications.splice(0, 0, {
                id: nanoid(),
                message: action.payload.message,
                type: action.payload.type,
                open: true,
            });
        },
        close: (state, action: PayloadAction<{ id: string }>) => {
            const item = state.notifications.find(n => n.id === action.payload.id);
            if (item) item.open = false;
        },
        remove: (state, action: PayloadAction<{ id: string }>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload.id);
        },
        hide(state: NotificationState) {
            if (state.notifications.length > 0) state.notifications.shift();
        }
    }
});

export const notificationReducer = notificationSlice.reducer;
export const { show, hide, close, remove } = notificationSlice.actions;