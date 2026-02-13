import { cookies } from "next/headers";
import { User } from "@/types/user";

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        console.log("getServerUser: Fetching with cookies:", cookieHeader);

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
            console.log("getServerUser: Success:", data.username);
            return {
                user_id: String(data.user_id),
                email: data.email,
                username: data.username,
                role: data.role,
                avatar: data.profile_url,
                // phone_number not available from /auth/me
            };
        } else {
            console.error("getServerUser: Auth Check Failed", res.status, await res.text());
        }

        return null;
    } catch (error) {
        console.error("Error fetching server user:", error);
        return null;
    }
}
