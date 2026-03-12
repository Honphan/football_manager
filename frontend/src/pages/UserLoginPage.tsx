import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
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
            toast.error('Số điện thoại phải có đúng 10 chữ số', { duration: 1000 });
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.login(phone, password);
            console.log(response);
            setAuth(response.username, response.role, response.accessToken);
            toast.success('Đăng nhập thành công!', { duration: 1000 });
            navigate('/');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Số điện thoại hoặc mật khẩu không chính xác';
            toast.error(message, { duration: 1000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Chào mừng trở lại"
            subtitle="Đăng nhập để đặt sân và theo dõi trận đấu của bạn"
        >
            <Card className="border-border bg-card shadow-md rounded-lg">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl text-card-foreground">Đăng nhập</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                        Sử dụng số điện thoại của bạn để truy cập tài khoản
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium text-foreground">
                                Số điện thoại
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="09xx xxx xxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-md"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Mật khẩu
                                </label>
                                <a href="#" className="text-xs text-brand hover:text-brand/80 transition-colors">
                                    Quên mật khẩu?
                                </a>
                            </div>
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
                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold py-5 rounded-md shadow-sm transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Chưa có tài khoản?{' '}
                            <Link to="/signup" className="text-brand hover:text-brand/80 font-medium transition-colors">
                                Đăng ký ngay
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </AuthLayout>
    );
};

export default LoginPage;
