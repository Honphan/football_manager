import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            {/* Soft gradient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand/5 blur-[100px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent/30 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 bg-brand rounded-xl flex items-center justify-center shadow-md mb-4 transition-transform hover:scale-105">
                        <svg
                            className="w-8 h-8 text-brand-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
                    {subtitle && <p className="text-muted-foreground mt-1 text-center text-sm">{subtitle}</p>}
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>

                <p className="mt-6 text-center text-muted-foreground text-xs">
                    &copy; {new Date().getFullYear()} Football Manager Pro
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
