import React from 'react';
import { useAuthStore } from '../stores/authStore';

const AdminDashboardPage: React.FC = () => {
    const { username } = useAuthStore();

    return (
        <div className="space-y-6">
            <div className="bg-accent border border-brand/20 rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-accent-foreground mb-1">Admin Dashboard 🛡️</h1>
                <p className="text-muted-foreground text-sm">
                    Chào sếp {username}. Đây là khu vực quản trị toàn diện hệ thống.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Tổng doanh thu', 'Số ca đặt', 'Khách hàng mới', 'Tỷ lệ lấp đầy'].map((stat) => (
                    <div key={stat} className="p-5 bg-card border border-border rounded-lg shadow-sm">
                        <p className="text-muted-foreground text-xs font-medium">{stat}</p>
                        <p className="text-xl font-bold text-foreground mt-1">--</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboardPage;
