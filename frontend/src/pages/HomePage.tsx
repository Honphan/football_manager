import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const HomePage: React.FC = () => {
    const { username } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <Card className="bg-linear-to-br from-brand/10 to-brand/5 border-brand/20">
                <CardContent className="p-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Xin chào, {username}! 👋
                    </h1>
                    <p className="text-muted-foreground mb-6 max-w-2xl">
                        Chào mừng bạn đến với Football Manager. Tìm và đặt sân bóng yêu thích của bạn chỉ với vài cú click.
                    </p>
                    <Button
                        onClick={() => navigate('/fields')}
                        className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-md"
                        size="lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Xem danh sách sân bóng
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: '⚽', label: 'Sân đã đặt', value: '0', color: 'text-brand' },
                    { icon: '📅', label: 'Đặt tuần này', value: '0', color: 'text-green' },
                    { icon: '⏳', label: 'Chờ xác nhận', value: '0', color: 'text-amber-500' },
                    { icon: '✅', label: 'Hoàn thành', value: '0', color: 'text-muted-foreground' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-card border-border">
                        <CardContent className="p-4 flex items-center gap-4">
                            <span className="text-3xl">{stat.icon}</span>
                            <div>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-muted-foreground text-sm">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card
                        className="bg-card border-border hover:border-brand/50 cursor-pointer transition-all group"
                        onClick={() => navigate('/fields')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground group-hover:text-brand transition-colors">
                                    Tìm sân bóng
                                </h3>
                                <p className="text-muted-foreground text-sm">Xem và chọn sân nhanh chóng</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border opacity-60 cursor-not-allowed">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Lịch sử đặt sân</h3>
                                <p className="text-muted-foreground text-sm">Sắp ra mắt</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border opacity-60 cursor-not-allowed">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Thông tin cá nhân</h3>
                                <p className="text-muted-foreground text-sm">Sắp ra mắt</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HomePage;

