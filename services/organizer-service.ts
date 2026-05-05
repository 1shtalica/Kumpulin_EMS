import type {
  OrganizerProfileData,
  OrganizerProfileResponse,
} from "@/types/organizer";
import type {
  Community,
  CommunityResponse,
  UpdateCommunityPayload,
} from "@/types/community";
import axiosClient from "@/lib/axios-client";

// ─── Feature flag ────────────────────────────────────────────────────────────
// Set to `true` to use the local Next.js mock routes for getting own profile.
// The public profile fetching is already using the real API!
type OrganizerMutationResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const OrganizerService = {
  /**
   * GET /organizer/profile  (real — own profile, requires auth)
   * GET /api/organizer/profile  (mock)
   */
  async getProfile(): Promise<OrganizerProfileData> {
    const response = await axiosClient.get<OrganizerProfileResponse>("/organizer/profile");
    return response.data.data;
  },

  /**
   * PATCH /organizer/profile
   * Updates the organizer's profile name and description
   */
  async updateProfile(payload: {
    name: string;
    description: string;
  }): Promise<OrganizerMutationResponse> {
    try {
      const response = await axiosClient.patch<OrganizerMutationResponse>(
        "/auth/profile",
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update organizer profile", error);
      throw error;
    }
  },

  /**
   * PATCH /organizer/profile/image
   * Updates the organizer's profile avatar
   */
  async updateProfileImage(file: File): Promise<OrganizerMutationResponse> {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axiosClient.patch<OrganizerMutationResponse>(
        "/organizer/profile/image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update profile image", error);
      throw error;
    }
  },

  /**
   * PATCH /organizer/profile/banner
   * Updates the organizer's banner image
   */
  async updateBannerImage(file: File): Promise<OrganizerMutationResponse> {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axiosClient.patch<OrganizerMutationResponse>(
        "/organizer/profile/banner",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update banner image", error);
      throw error;
    }
  },

  /**
   * GET /organizers/profile/:slug  (real — public profile by organizer slug)
   * This maps the backend's Event response into the expected OrganizerProfileData shape
   */
  async getProfileBySlug(slug: string): Promise<OrganizerProfileData> {
    try {
      const response = await axiosClient.get(`organizers/profile/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch organizer profile for ${slug}`, error);
      throw error;
    }
  },

  /**
   * GET /communities/:community_id
   * Fetches a community by ID for organizer community management screens.
   */
  async getCommunityById(communityId: string): Promise<Community> {
    try {
      const response = await axiosClient.get<CommunityResponse>(
        `/communities/${communityId}`,
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch community ${communityId}`, error);
      throw error;
    }
  },

  /**
   * PATCH /communities/:community_id
   * Updates community profile fields using multipart/form-data.
   */
  async updateCommunity(
    communityId: string,
    payload: UpdateCommunityPayload,
  ): Promise<Community> {
    try {
      const formData = new FormData();

      if (payload.name !== undefined) formData.append("name", payload.name);
      if (payload.slug !== undefined) formData.append("slug", payload.slug);
      if (payload.description !== undefined) {
        formData.append("description", payload.description);
      }
      if (payload.rules !== undefined) formData.append("rules", payload.rules);

      if (payload.logo) {
        formData.append("logo", payload.logo);
      }

      if (payload.banner) {
        formData.append("banner", payload.banner);
      }

      const response = await axiosClient.patch<CommunityResponse>(
        `/communities/${communityId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data.data;
    } catch (error) {
      console.error(`Failed to update community ${communityId}`, error);
      throw error;
    }
  },
};

