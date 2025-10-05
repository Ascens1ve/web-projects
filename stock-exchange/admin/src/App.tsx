import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home';
import { RegistrationPage } from './pages/RegistrationPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { StocksPage } from './pages/StocksPage';
import { ImitationPage } from './pages/ImitationPage';
import { ErrorWatcher } from './components/ErrorsWatcher';

export const App = () => (
    <BrowserRouter>
        <ErrorWatcher />
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
