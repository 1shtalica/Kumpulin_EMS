import { cookies } from "next/headers";
import { User } from "@/types/user";

// Next.js Best Practice: Optimistically decode JWT locally
function decodeJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    // 1. Optimistic Auth Check
    if (accessToken?.value) {
        const payload = decodeJwt(accessToken.value);
        if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
            // Return decoded JWT directly, avoid fetching
            return {
                user_id: payload.user_id ? String(payload.user_id) : "",
                email: payload.email || "",
                username: payload.username || "",
                role: payload.role || "",
                avatar: payload.profile_url || undefined,
            } as User;
        }
    }

    // 2. Token missing or expired, attempt to fetch from backend 
    const refreshToken = cookieStore.get("refresh_token");

    // If there is no refresh token, we know 100% the user is not logged in.
    if (!refreshToken) {
        return null;
    }

    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

        const res = await fetch(`${apiUrl}/auth/me`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (res.ok) {
            const data = await res.json();
            return {
                user_id: String(data.user_id),
                email: data.email,
                username: data.username,
                role: data.role,
                avatar: data.profile_url,
            } as User;
        } else {
            console.error("getServerUser: Auth Check Failed", res.status, await res.text());
        }

        return null;
    } catch (error) {
        console.error("Error fetching server user:", error);
        return null;
    }
}
