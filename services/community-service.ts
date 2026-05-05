import axiosClient from "@/lib/axios-client";
import type {
    Community,
    CommunityResponse,
    CreateCommunityPayload,
} from "@/types/community";

export const CommunityService = {
    /**
     * POST /communities
     *
     * Creates a community using multipart/form-data because the backend accepts
     * optional image files for `logo` and `banner`.
     *
     * Use this from the organizer create-community form. Scalar fields are sent
     * as form fields, while image files are appended only when selected.
     */
    async createCommunity(payload: CreateCommunityPayload): Promise<Community> {
        try {
            const formData = new FormData();

            formData.append("name", payload.name);
            formData.append("slug", payload.slug);
            formData.append("description", payload.description ?? "");
            formData.append("rules", payload.rules ?? "");

            if (payload.logo) {
                formData.append("logo", payload.logo);
            }

            if (payload.banner) {
                formData.append("banner", payload.banner);
            }

            const response = await axiosClient.post<CommunityResponse>(
                "/communities",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            return response.data.data;
        } catch (error) {
            console.error("Failed to create community:", error);
            throw error;
        }
    },

    /**
     * GET /communities/:community_id
     *
     * Fetches one community by its explicit community ID.
     *
     * Use this when a route or component already has the target community ID,
     * for example a detail page, direct link, or post-create redirect flow.
     */
    async getCommunityById(communityId: string): Promise<Community> {
        try {
            const response = await axiosClient.get<CommunityResponse>(
                `/communities/${communityId}`,
            );

            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch community ${communityId}:`, error);
            throw error;
        }
    },

    /**
     * GET /organizer/community
     *
     * Fetches the community owned by the currently authenticated organizer.
     *
     * Use this for organizer dashboard pages where the user should only see
     * their own managed community. Auth is handled by `axiosClient` on the
     * client side; server-side pages that need a Bearer token should use a
     * server fetch with cookies instead.
     */
    async getCommunityByOrganizer(): Promise<Community> {
        try {
            const response = await axiosClient.get<CommunityResponse>(
                "/organizer/community",
            );

            return response.data.data;
        } catch (error) {
            console.error(`Failed to fetch community:`, error);
            throw error;
        }
    },

    async deleteCommunity(communityId: string): Promise<void> {
        try {
            await axiosClient.delete(`/communities/${communityId}`);
        } catch (error) {
            console.error(`Failed to delete community ${communityId}:`, error);
            throw error;
        }
    },
};
