import { cookies } from "next/headers";
import { User } from "@/types/user";

type ServerPayload = Record<string, unknown>;

const asRecord = (value: unknown): ServerPayload | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    return value as ServerPayload;
};

const getApiBaseUrl = () =>
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api/v1";

const normalizeUser = (payload: unknown): User | null => {
    const root = asRecord(payload);
    if (!root) {
        return null;
    }

    const data = asRecord(root.data) ?? root;
    const idRaw = data.user_id ?? data.id;

    if (idRaw === undefined || idRaw === null) {
        return null;
    }

    return {
        id: String(idRaw),
        email: typeof data.email === "string" ? data.email : "",
        username: typeof data.username === "string" ? data.username : "",
        role: typeof data.role === "string" ? data.role : "",
        profile_url: typeof data.profile_url === "string" ? data.profile_url : undefined,
        phone_number: typeof data.phone_number === "string" ? data.phone_number : undefined,
        first_name: typeof data.first_name === "string" ? data.first_name : undefined,
        last_name: typeof data.last_name === "string" ? data.last_name : undefined,
    };
};

export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token");

    if (!refreshToken) {
        return null;
    }

    const accessToken = cookieStore.get("access_token");
    const cookieParts: string[] = [];

    if (accessToken?.value) {
        cookieParts.push(`access_token=${accessToken.value}`);
    }
    cookieParts.push(`refresh_token=${refreshToken.value}`);

    try {
        const apiUrl = getApiBaseUrl();
        const cookieHeader = cookieParts.join("; ");

        const res = await fetch(`${apiUrl}/auth/me`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status !== 401) {
                console.error(`getServerUser: Auth check failed with status ${res.status}`);
            }
            return null;
        }

        const data = await res.json();
        return normalizeUser(data);
    } catch (error) {
        console.error("getServerUser: Request failed", error);
        return null;
    }
}
