import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Pages
import SignupPage from './pages/SignupPage';
import AdminLoginPage from './pages/AdminLoginPage';
import HomePage from './pages/HomePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import FieldsPage from './pages/FieldsPage';
import FieldDetailPage from './pages/FieldDetailPage';
import PaymentResultPage from './pages/PaymentResultPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminFieldsPage from './pages/AdminFieldsPage';
import AdminFieldDetailPage from './pages/AdminFieldDetailPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

// Layouts & Protection
import MainLayout from './layouts/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import UserLoginPage from './pages/UserLoginPage';

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" richColors theme="dark" />
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<UserLoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected User Routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/fields" element={<FieldsPage />} />
                        <Route path="/fields/:id" element={<FieldDetailPage />} />
                        <Route path="/my-bookings" element={<MyBookingsPage />} />
                        <Route path="/payment-result" element={<PaymentResultPage />} />
                    </Route>
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/fields" element={<AdminFieldsPage />} />
                        <Route path="/admin/fields/:id" element={<AdminFieldDetailPage />} />
                        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                    </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
