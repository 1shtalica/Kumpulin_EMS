import type {
  OrganizerProfileData,
  OrganizerProfileResponse,
} from "@/types/organizer";
import axiosClient from "@/lib/axios-client";

// ─── Feature flag ────────────────────────────────────────────────────────────
// Set to `true` to use the local Next.js mock routes for getting own profile.
// The public profile fetching is already using the real API!
const USE_MOCK = true;

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
  async updateProfile(payload: { name: string; description: string }): Promise<any> {
    try {
      const response = await axiosClient.patch("/auth/profile", payload);
      return response.data;
    } catch (error: any) {
      console.error("Failed to update organizer profile", error);
      throw error;
    }
  },

  /**
   * PATCH /organizer/profile/image
   * Updates the organizer's profile avatar
   */
  async updateProfileImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axiosClient.patch("/organizer/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to update profile image", error);
      throw error;
    }
  },

  /**
   * PATCH /organizer/profile/banner
   * Updates the organizer's banner image
   */
  async updateBannerImage(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axiosClient.patch("/organizer/profile/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
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
};

