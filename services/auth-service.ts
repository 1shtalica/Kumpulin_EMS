import axiosClient from "@/lib/axios-client";
import { RegisterOrganizerPayload, RegisterPayload } from "@/types/auth";

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
    email_verified?: boolean;
    provider: string;
    profile_url?: string;
}

export interface MeResponse {
    user_id: number;
    email: string;
    username: string;
    role: string;
    profile_url?: string;
    phone_number?: string;
    email_verified?: boolean;
    first_name?: string;
    last_name?: string;
}

export interface GoogleAuthResponse {
    message: string;
    data: AuthResponse;
    success?: boolean;
}

export const AuthService = {
    /**
     * Authenticates a user with email and password.
     * The backend sets auth cookies, while the response carries the user data.
     */
    async login(payload: LoginPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/login", payload);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Registers a standard user account.
     * Returns the backend registration payload for store hydration.
     */
    async registerUser(payload: RegisterPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/register", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Registers a new organizer account through the shared register endpoint.
     * The role is passed as a query parameter because that is the backend contract.
     */
    async registerOrganizer(
        payload: RegisterOrganizerPayload,
    ): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post(
                "/auth/register?role=organizer",
                payload,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Invalidates the current backend session and clears auth cookies server-side.
     */
    async logout() {
        await axiosClient.post("/auth/logout");
    },
    /**
     * Fetches the current user from the auth cookies.
     * This is a passive auth check, so refresh failure must not redirect public pages.
     */
    async me() {
        return axiosClient.get<MeResponse>("/auth/me", {
            skipAuthFailureRedirect: true,
        });
    },
    /**
     * Exchanges a Google OAuth authorization code for an application session.
     */
    async googleAuth(payload: { code: string }): Promise<GoogleAuthResponse> {
        try {
            const response = await axiosClient.post("/auth/google", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Updates the authenticated user's profile fields for the active role.
     */
    async updateProfile(payload: { phone_number?: string; role?: string }) {
        try {
            const response = await axiosClient.patch(
                `/auth/profile?role=${payload.role}`,
                payload,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Creates an organizer profile for the currently authenticated user.
     */
    async createOrganizer(payload: { name: string; slug: string }) {
        try {
            const response = await axiosClient.post(
                "/auth/register-organizer",
                payload,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Sends an email verification code for the authenticated user's email.
     */
    async sendEmailVerificationCode(email: string) {
        await axiosClient.post("/auth/send-verification-code", {
            email,
            type: "email_verification",
        });
    },

    /**
     * Verifies the email code sent to the authenticated user's email address.
     */
    async verifyEmailCode(payload: { email: string; code: string }) {
        await axiosClient.post("/auth/verify-otp", {
            email: payload.email,
            code: payload.code,
        });
    },

    /**
     * Requests a password reset token for the supplied email address.
     */
    async forgotPassword(email: string) {
        try {
            const response = await axiosClient.post("/auth/send-code", {
                email,
                type: "password_reset",
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Completes password reset using the verification token from email.
     */
    async resetPassword(payload: { token: string; new_password: string }) {
        try {
            const response = await axiosClient.post("/auth/forgot-password", {
                token: payload.token,
                new_password: payload.new_password,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
