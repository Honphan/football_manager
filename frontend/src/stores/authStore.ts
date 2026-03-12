import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthState, UserRole } from '../types/type';

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            username: null,
            role: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (username: string, role: UserRole, accessToken: string) =>
                set({
                    username,
                    role,
                    accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            clearAuth: () =>
                set({
                    username: null,
                    role: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),

            setLoading: (isLoading: boolean) => set({ isLoading }),
        }),

        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                username: state.username,
                role: state.role,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
