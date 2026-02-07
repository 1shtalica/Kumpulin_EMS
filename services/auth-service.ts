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
            // Backend returns: { success: true, message: ..., data: { user object } }
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
        try {
            await axiosClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
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
    }
};

