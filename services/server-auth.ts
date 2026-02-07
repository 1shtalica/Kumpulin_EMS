import { cookies } from "next/headers";
import { User } from "@/types/user";

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (res.ok) {
            const data = await res.json();
            // Backend /auth/me returns: { success: true, user_id, email, role, username, profile_url }
            // Note: phone_number is NOT included in /auth/me (only JWT claims)
            return {
                user_id: String(data.user_id),
                email: data.email,
                username: data.username,
                role: data.role,
                avatar: data.profile_url,
                // phone_number not available from /auth/me
            };
        }

        return null;
    } catch (error) {
        console.error("Error fetching server user:", error);
        return null;
    }
}
