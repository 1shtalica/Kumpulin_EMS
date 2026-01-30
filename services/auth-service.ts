import axiosClient from "@/lib/axios-client";
import { RegisterOrganizerPayload, RegisterPayload } from "@/types/auth";

// Define Types for Auth
export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    user_id: string;
    email: string;
    username: string;
    role: string;
    avatar: string;
}

export const AuthService = {
    async login(payload: LoginPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/login", payload);
            return response.data;
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
    async googleAuth(payload: { Code: string }) {
        try {
            const response = await axiosClient.post("/auth/google", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

