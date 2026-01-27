import { create } from 'zustand';
import { AuthService, LoginPayload } from '@/services/auth-service';
import { User } from '@/types/user';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    setUser: (user) => set({ user }),

    login: async (payload: LoginPayload) => {
        set({ isLoading: true });
        try {
            const response = await AuthService.login(payload);
            set({
                user: {
                    username: response.username,
                    email: response.email,
                    user_id: response.user_id,
                    role: response.role,
                    avatar: response.avatar,
                }
            });
        } catch (error) {
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await AuthService.logout();
            set({ user: null });
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout failed", error);
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = (await AuthService.me()).data;
            set({
                user: {
                    username: response.username,
                    email: response.email,
                    user_id: response.user_id,
                    role: response.role,
                    avatar: response.avatar,
                }
            });
        } catch (error) {
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },
}));
