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
