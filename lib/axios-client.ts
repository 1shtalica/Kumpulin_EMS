import axios, {
    AxiosError,
    AxiosHeaders,
    InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/auth-store";

declare module "axios" {
    export interface AxiosRequestConfig {
        /**
         * Prevents a failed refresh attempt from forcing a browser redirect.
         * Use this for passive auth checks such as /auth/me on public pages.
         */
        skipAuthFailureRedirect?: boolean;
    }

    export interface InternalAxiosRequestConfig {
        /**
         * Internal copy of the public request option used by the response
         * interceptor after Axios normalizes the request config.
         */
        skipAuthFailureRedirect?: boolean;
    }
}

interface QueueItem {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];
const noAutoRefreshEndpoints = [
    "/auth/login",
    "/auth/register",
    "/auth/google",
    "/auth/refresh",
    "/auth/logout",
    "/auth/send-code",
    "/auth/send-verification-code",
    "/auth/verify-otp",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/register-organizer",
];

/**
 * Identifies endpoints where a 401 is an expected auth result and should not
 * start the automatic refresh-and-retry flow.
 */
const shouldBypassAutoRefresh = (url?: string) =>
    noAutoRefreshEndpoints.some((endpoint) => url?.includes(endpoint));

const isFormDataPayload = (data: unknown): data is FormData =>
    typeof FormData !== "undefined" && data instanceof FormData;

/**
 * Resolves or rejects every request that waited while a token refresh was in
 * progress, then clears the queue for the next refresh cycle.
 */
const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

axiosClient.interceptors.request.use(
    /**
     * Lets the browser set multipart/form-data boundaries for FormData bodies.
     * Cookies are sent by the Axios instance through withCredentials.
     */
    (config: InternalAxiosRequestConfig) => {
        if (isFormDataPayload(config.data)) {
            const headers = AxiosHeaders.from(config.headers);
            headers.delete("Content-Type");
            config.headers = headers;
        }

        return config;
    },
    /**
     * Propagates request setup errors to the caller.
     */
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

axiosClient.interceptors.response.use(
    /**
     * Returns successful responses without extra processing.
     */
    (response) => {
        return response;
    },
    /**
     * Handles 401 responses by refreshing the auth session once, retrying the
     * original request, and coordinating concurrent 401s through a shared queue.
     */
    async (error: AxiosError) => {
        const originalRequest = error.config as
            | (InternalAxiosRequestConfig & {
                  _retry?: boolean;
              })
            | undefined;

        if (
            !originalRequest ||
            error.response?.status !== 401 ||
            originalRequest._retry ||
            shouldBypassAutoRefresh(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    return axiosClient(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await refreshClient.post("/auth/refresh");

            processQueue(null);
            return axiosClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);
            if (originalRequest.skipAuthFailureRedirect) {
                useAuthStore.setState({ user: null, isLoading: false });
            } else {
                await useAuthStore.getState().logout();
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default axiosClient;
