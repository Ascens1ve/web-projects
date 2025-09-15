import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StocksPage } from './pages/StocksPage';
import { ImitationPage } from './pages/ImitationPage';
import { useNotification } from './store/notificationContext';
import { useSelector, useDispatch } from './store/store';
import { useEffect } from 'react';
import { clearError as clearErrorUser } from './store/userSlice';
import { clearError as clearErrorStocks } from './store/stocksSlice';

export default function App() {
    const notificationContext = useNotification();
    const dispatch = useDispatch();
    const stocksError = useSelector((state) => state.stocks.error);
    const userError = useSelector((state) => state.user.error);

    useEffect(() => {
        if (stocksError) {
            notificationContext.showNotification(stocksError, 'error');
            dispatch(clearErrorStocks());
        } else if (userError) {
            notificationContext.showNotification(userError, 'error');
            dispatch(clearErrorUser());
        }
    }, [stocksError, userError, dispatch]);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute onlyAuth>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <ProtectedRoute onlyUnAuth>
                            <LoginPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/registration"
                    element={
                        <ProtectedRoute onlyUnAuth>
                            <RegistrationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/stocks"
                    element={
                        <ProtectedRoute onlyAuth>
                            <StocksPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/imitation"
                    element={
                        <ProtectedRoute onlyAuth>
                            <ImitationPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
