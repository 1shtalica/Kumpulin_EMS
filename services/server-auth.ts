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
            return data;
        }

        return null;
    } catch (error) {
        console.error("Error fetching server user:", error);
        return null;
    }
}
