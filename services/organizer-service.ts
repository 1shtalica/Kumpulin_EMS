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

