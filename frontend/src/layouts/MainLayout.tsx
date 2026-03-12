import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { authApi } from '../api/auth';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const MainLayout: React.FC = () => {
    const { username, role, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = role === 'ROLE_ADMIN';

    const handleLogout = async () => {
        try {
            await authApi.logout();
            clearAuth();
            toast.success('Đã đăng xuất', { duration: 1000 });
            navigate(isAdmin ? '/admin/login' : '/login');
        } catch (error) {
            clearAuth();
            navigate(isAdmin ? '/admin/login' : '/login');
        }
    };

    // Navigation items cho Admin
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Trang chủ' },
        { path: '/admin/fields', label: 'Quản lý sân' },
        { path: '/admin/bookings', label: 'Quản lý đặt sân' },
    ];

    // Navigation items cho User
    const userNavItems = [
        { path: '/', label: 'Trang chủ' },
        { path: '/fields', label: 'Danh sách sân' },
        { path: '/my-bookings', label: 'Lịch sử đặt sân' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;
    const homePath = isAdmin ? '/admin/dashboard' : '/';

    const isActive = (path: string) => {
        if (path === '/' || path === '/admin/dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            {/* Header */}
            <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate(homePath)}
                        >
                            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-sm">
                                <svg className="w-5 h-5 text-brand-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="font-bold text-foreground hidden sm:block">Football Manager</span>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={cn(
                                        'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                        isActive(item.path)
                                            ? 'text-brand bg-brand/10'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-foreground">{username}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {role?.replace('ROLE_', '').toLowerCase()}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="border-border hover:bg-secondary text-foreground rounded-md"
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-4 text-center text-muted-foreground text-xs">
                <p>&copy; {new Date().getFullYear()} Football Manager Pro. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;

