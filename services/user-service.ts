import axiosClient from "@/lib/axios-client";
import type { User } from "@/types/user";

export type UserProfile = Omit<Partial<User>, "profile_url"> & {
    id?: string | number;
    user_id?: string | number;
    profile_url?: string | null;
};

export interface UpdateUserProfilePayload {
    username?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    profile_url?: string | null;
}

export interface FollowedOrganizerItem {
    id: string;
    organizer_id: string;
    organizer_name: string;
    organizer_slug: string;
    organizer_description: string;
    followers: number;
    total_events: number;
    active_events: number;
    latest_event_title: string;
    latest_event_start_date: string;
    followed_at: string;
}

export interface WishlistedEventItem {
    event_id: string;
    slug?: string;
    title: string;
    poster_url: string | null;
    event_start_at: string;
    event_end_at: string;
    location_label: string;
    price_from: number;
    currency: string;
    event_status: string;
    type?: string;
    category?: string;
    is_registration_open: boolean;
    is_wishlisted: boolean;
    wishlisted_at: string;
}

export interface WishlistMeta {
    page: number;
    limit: number;
    total: number;
}

export interface WishlistParams {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    type?: string;
    status?: string;
}

export interface WishlistMutationData {
    event_id: string;
    is_wishlisted: boolean;
    wishlisted_at: string;
}

interface FollowedOrganizersResponse {
    success: boolean;
    message: string;
    data: FollowedOrganizerItem[];
}

interface WishlistedEventsResponse {
    message?: string;
    data: WishlistedEventItem[];
    meta: WishlistMeta;
}

interface WishlistMutationResponse {
    message: string;
    data: WishlistMutationData;
}

const extractData = <T>(payload: unknown): T => {
    if (payload && typeof payload === "object" && "data" in payload) {
        return (payload as { data: T }).data;
    }

    return payload as T;
};

export const UserService = {
    async followOrganizer(organizerId: string) {
        const response = await axiosClient.post(`/organizers/${organizerId}/follow`);
        return response.data;
    },
    async unfollowOrganizer(organizerId: string) {
        const response = await axiosClient.delete(`/organizers/${organizerId}/follow`);
        return response.data;
    },
    async getFollowStatus(organizerId: string) {
        const response = await axiosClient.get(`/organizers/${organizerId}/follow-status`);
        return response.data;
    },
    async getFollowedOrganizers(): Promise<FollowedOrganizerItem[]> {
        const response = await axiosClient.get<FollowedOrganizersResponse>("/organizers/followed");
        return response.data.data ?? [];
    },
    async getWishlistedEvents(params: WishlistParams = {}): Promise<WishlistedEventsResponse> {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.q) searchParams.set("q", params.q);
        if (params.category) searchParams.set("category", params.category);
        if (params.type) searchParams.set("type", params.type);
        if (params.status) searchParams.set("status", params.status);

        const query = searchParams.toString();
        const response = await axiosClient.get<WishlistedEventsResponse>(
            query ? `/me/wishlist/events?${query}` : "/me/wishlist/events",
        );

        return {
            data: response.data.data ?? [],
            meta: {
                page: response.data.meta?.page ?? params.page ?? 1,
                limit: response.data.meta?.limit ?? params.limit ?? 20,
                total: response.data.meta?.total ?? 0,
            },
        };
    },
    async wishlistEvent(eventId: string): Promise<WishlistMutationData> {
        const response = await axiosClient.post<WishlistMutationResponse>(
            `/me/wishlist/events/${eventId}`,
        );
        return response.data.data;
    },
    async unwishlistEvent(eventId: string): Promise<void> {
        await axiosClient.delete(`/me/wishlist/events/${eventId}`);
    },
    async getProfile(): Promise<UserProfile> {
        const response = await axiosClient.get("/me/profile");
        return extractData<UserProfile>(response.data);
    },
    async updateProfile(payload: UpdateUserProfilePayload): Promise<UserProfile> {
        const response = await axiosClient.patch("/me/profile", payload);
        return extractData<UserProfile>(response.data);
    },
    async uploadProfilePhoto(photo: File): Promise<UserProfile> {
        const formData = new FormData();
        formData.append("photo", photo);

        const response = await axiosClient.post("/me/profile/photo", formData);
        return extractData<UserProfile>(response.data);
    }
}
