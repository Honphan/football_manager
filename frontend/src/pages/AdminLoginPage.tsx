import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

const AdminLoginPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !password) {
            toast.error('Vui lòng nhập số điện thoại và mật khẩu', { duration: 1000 });
            return;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            toast.error('Số điện thoại Admin phải có đúng 10 chữ số', { duration: 1000 });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.adminLogin(phone, password);

            console.log(response);

            if (response.role !== 'ROLE_ADMIN') {
                toast.error('Bạn không có quyền truy cập vào khu vực này', { duration: 1000 });
                return;
            }

            setAuth(response.username, response.role, response.accessToken);
            const accessToken1 = useAuthStore.getState().accessToken;
            console.log(accessToken1);
            toast.success('Đăng nhập Admin thành công!', { duration: 1000 });
            navigate('/admin/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Thông tin đăng nhập không hợp lệ';
            toast.error(message, { duration: 1000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Admin Dashboard"
            subtitle="Khu vực dành riêng cho người quản lý hệ thống"
        >
            <Card className="border-border bg-card shadow-md rounded-lg ring-1 ring-brand/10">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl text-card-foreground flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                        Admin Login
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                        Cung cấp thông tin quản trị viên của bạn
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-foreground">
                                Số điện thoại Admin
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Admin Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-md"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground">
                                Mật khẩu Bảo mật
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-md"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-bold py-5 rounded-md shadow-sm transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xác thực...' : 'Vào Dashboard'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
            <div className="mt-5 text-center">
                <button
                    onClick={() => navigate('/login')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    Quay lại trang người dùng
                </button>
            </div>
        </AuthLayout>
    );
};

export default AdminLoginPage;
