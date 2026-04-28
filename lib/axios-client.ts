import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

interface QueueItem {
    resolve: () => void;
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
  "/auth/forgot-password",
  "/auth/register-organizer",
];

<<<<<<< HEAD
const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
=======
const shouldBypassAutoRefresh = (url?: string) =>
  noAutoRefreshEndpoints.some((endpoint) => url?.includes(endpoint));

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
>>>>>>> 53916d826f72fdd9209ad3cc76956ef318033965

    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    },
);

axiosClient.interceptors.response.use(
<<<<<<< HEAD
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Public auth endpoints that should NOT trigger auto-logout on 401
        const publicAuthEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/google",
            "/auth/send-code",
            "/auth/forgot-password",
            "/auth/refresh",
            "/auth/logout",
        ];

        const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) =>
            originalRequest.url?.includes(endpoint),
        );

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublicAuthEndpoint
        ) {
            if (isRefreshing) {
                return new Promise<void>(function (resolve, reject) {
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
                // Use dedicated client so refresh endpoint never re-enters this interceptor.
                await refreshClient.post("/auth/refresh");

                processQueue(null);
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                // Do not trigger hard redirect here to avoid reload loops on public/auth pages.
                useAuthStore.setState({ user: null, isLoading: false });
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
=======
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

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
      processQueue(refreshError, null);
      await useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
>>>>>>> 53916d826f72fdd9209ad3cc76956ef318033965
);

export default axiosClient;
