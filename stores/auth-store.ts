import { create } from "zustand";
import { AuthService, LoginPayload } from "@/services/auth-service";
import { User } from "@/types/user";

type AuthPayloadRecord = Record<string, unknown>;

const asAuthPayloadRecord = (value: unknown): AuthPayloadRecord | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as AuthPayloadRecord;
};

const readBoolean = (
  payload: AuthPayloadRecord,
  keys: string[],
): boolean | undefined => {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }

  return undefined;
};

// Only keep whitelisted profile fields in client store.
// This prevents accidental persistence of token-like fields from API responses.
const sanitizeUserPayload = (value: unknown): User | null => {
  const root = asAuthPayloadRecord(value);
  if (!root) return null;

  const payload = asAuthPayloadRecord(root.data) ?? root;
  const idRaw = payload.id ?? payload.user_id;

  if (idRaw === undefined || idRaw === null) {
    return null;
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const username = typeof payload.username === "string" ? payload.username : "";
  const role = typeof payload.role === "string" ? payload.role : "";
  const emailVerified = readBoolean(payload, [
    "email_verified",
    "is_email_verified",
  ]);

  return {
    id: String(idRaw),
    email,
    username,
    role,
    profile_url:
      typeof payload.profile_url === "string" ? payload.profile_url : undefined,
    phone_number:
      typeof payload.phone_number === "string" ? payload.phone_number : undefined,
    email_verified: emailVerified ?? false,
    first_name:
      typeof payload.first_name === "string" ? payload.first_name : undefined,
    last_name:
      typeof payload.last_name === "string" ? payload.last_name : undefined,
  };
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  loginWithEmail: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user: sanitizeUserPayload(user) }),
  loginWithGoogle: async (code: string) => {
    set({ isLoading: true });
    try {
      const response = await AuthService.googleAuth({ code });
      set({
        user: sanitizeUserPayload(response),
      });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  loginWithEmail: async (payload: LoginPayload) => {
    set({ isLoading: true });
    try {
      const response = await AuthService.login(payload);
      set({
        user: sanitizeUserPayload(response),
      });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
      set({ user: null });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed", error);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = (await AuthService.me()).data;
      set({
        user: sanitizeUserPayload(response),
      });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
