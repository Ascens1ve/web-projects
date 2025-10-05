import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { Provider } from 'react-redux';
import store from './store/store';
import { Notification } from './components/Notification';

createRoot(root).render(
    <StrictMode>
        <Provider store={store}>
            <Notification />
            <App />
        </Provider>
    </StrictMode>
);
