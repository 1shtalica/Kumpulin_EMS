import axiosClient from "@/lib/axios-client";

// Define Types for Auth
export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    // If your backend still returns tokens in the body, you can keep these types,
    // but we won't be using them on the client side for storage.
    accessToken?: string;
    refreshToken?: string;
    user: any; // Replace with your user type
}

export const AuthService = {
    // Login
    async login(payload: LoginPayload): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/login", payload);
            // We assume the server sets the HttpOnly cookies for accessToken and refreshToken here.
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Register
    async register(payload: any): Promise<AuthResponse> {
        try {
            const response = await axiosClient.post("/auth/register", payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            // Call backend to clear the HttpOnly cookies
            await axiosClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            // Optional: Redirect to login or perform client-side cleanup
            if (typeof window !== "undefined") {
                // window.location.href = "/login"; 
            }
        }
    },

    // Get Current User (if needed)
    async me() {
        return axiosClient.get("/auth/me");
    },
};

