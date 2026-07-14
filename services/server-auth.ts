import { cookies } from "next/headers";
import { User } from "@/types/user";
import { normalizePhoneNumber } from "@/lib/phone";

const getApiBaseUrl = () =>
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

const readBoolean = (
    data: Record<string, unknown>,
    keys: string[],
): boolean | undefined => {
    for (const key of keys) {
        const value = data[key];
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            if (value.toLowerCase() === "true") return true;
            if (value.toLowerCase() === "false") return false;
        }
    }

    return undefined;
};

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token");

    // If there is no refresh token, user is not logged in.
    if (!refreshToken) {
        return null;
    }

    const apiUrl = getApiBaseUrl();
    if (!apiUrl) {
        console.error("getServerUser: API URL is not configured");
        return null;
    }

    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');

    try {
        const res = await fetch(`${apiUrl}/auth/me`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (res.ok) {
            const payload = await res.json();
            const data = payload?.data ?? payload;
            const emailVerified = readBoolean(data, [
                "email_verified",
                "is_email_verified",
            ]);

            return {
                id: String(data.user_id ?? data.id ?? ""),
                email: data.email ?? "",
                username: data.username ?? "",
                role: data.role ?? "",
                profile_url: data.profile_url ?? undefined,
                phone_number: normalizePhoneNumber(data.phone_number),
                email_verified: emailVerified ?? false,
                first_name: data.first_name ?? undefined,
                last_name: data.last_name ?? undefined,
            } as User;
        }

        if (res.status !== 401) {
            console.error("getServerUser: Auth check failed", res.status);
        }
        return null;
    } catch {
        console.error("getServerUser: Auth check request failed");
        return null;
    }
}
