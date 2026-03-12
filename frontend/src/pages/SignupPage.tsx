import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

const SignupPage: React.FC = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !password || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin', { duration: 1000 });
            return;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            toast.error('Số điện thoại phải có đúng 10 chữ số', { duration: 1000 });
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp', { duration: 1000 });
            return;
        }

        if (password.length < 1) {
            toast.error('Mật khẩu phải có ít nhất 1 ký tự', { duration: 1000 });
            return;
        }

        setIsLoading(true);
        try {
            await authApi.signup(phone, password);
            const loginResponse = await authApi.login(phone, password);
            setAuth(loginResponse.username, loginResponse.role, loginResponse.accessToken);
            toast.success('Đăng ký tài khoản thành công!', { duration: 1000 });
            navigate('/');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
            toast.error(message, { duration: 1000 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Tạo tài khoản"
            subtitle="Bắt đầu đặt sân bóng chỉ trong vài bước đơn giản"
        >
            <Card className="border-border bg-card shadow-md rounded-lg">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-xl text-card-foreground">Đăng ký</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                        Nhập thông tin của bạn để tạo tài khoản mới
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    Mật khẩu
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
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                                    Xác nhận
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring rounded-md"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold py-5 rounded-md shadow-sm transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="text-brand hover:text-brand/80 font-medium transition-colors">
                                Đăng nhập
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </AuthLayout>
    );
};

export default SignupPage;
