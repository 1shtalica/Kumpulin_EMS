import axiosClient from "@/lib/axios-client";

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
    }
}