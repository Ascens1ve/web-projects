import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import { NotificationProvider } from './store/notificationContext';

createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </Provider>
    </StrictMode>
);
