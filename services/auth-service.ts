import axiosClient from "@/lib/axios-client";
import { RegisterOrganizerPayload, RegisterPayload } from "@/types/auth";

// Define Types for Auth
export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    phone_number: string;
    provider: string;
    profile_url?: string;
}

export const AuthService = {
    async login(payload: LoginPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/login", payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
    async registerUser(payload: RegisterPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/register", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async registerOrganizer(payload: RegisterOrganizerPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/register?role=organizer", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async logout() {
        await axiosClient.post("/auth/logout");
    },
    async me() {
        return axiosClient.get("/auth/me");
    },
    async googleAuth(payload: { code: string }) {
        try {
            const response = await axiosClient.post("/auth/google", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async updateProfile(payload: { phone_number?: string; role?: string }) {
        try {
            const response = await axiosClient.patch(`/auth/profile?role=${payload.role}`, payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async createOrganizer(payload: { name: string; slug: string }) {
        try {
            const response = await axiosClient.post("/auth/register-organizer", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async forgotPassword(email: string) {
        try {
            const response = await axiosClient.post("/auth/send-code", {
                email,
                type: "forgot-password",
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    async resetPassword(payload: { token: string; newPassword: string }) {
        try {
            const response = await axiosClient.post("/auth/forgot-password", {
                token: payload.token,
                new_password: payload.newPassword,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

