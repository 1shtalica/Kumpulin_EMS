import type {
  OrganizerProfileData,
  OrganizerProfileResponse,
} from "@/types/organizer";

// ─── Feature flag ────────────────────────────────────────────────────────────
// Set to `true` to use the local Next.js mock routes.
// Set to `false` (and restore axiosClient imports) once the real BE is ready.
const USE_MOCK = true;

export const OrganizerService = {
  /**
   * GET /organizer/profile  (real — own profile, requires auth)
   * GET /api/organizer/profile  (mock)
   */
  async getProfile(): Promise<OrganizerProfileData> {
    if (USE_MOCK) {
      const res = await fetch("/api/organizer/profile");
      if (!res.ok) throw new Error("Failed to fetch mock organizer profile");
      const json: OrganizerProfileResponse = await res.json();
      return json.data;
    }

    // 🚀 REAL: restore when BE is ready
    // const { default: axiosClient } = await import("@/lib/axios-client");
    // const response = await axiosClient.get<OrganizerProfileResponse>("/organizer/profile");
    // return response.data.data;
    throw new Error("Real API not configured");
  },

  /**
   * GET /organizer/:id/profile  (real — public profile by organizer ID)
   * GET /api/organizer/:id/profile  (mock)
   *
   * Used by the public-facing organizer profile page /organizer/[id].
   */
  async getProfileById(id: string): Promise<OrganizerProfileData> {
    if (USE_MOCK) {
      // 🔧 MOCK: hits /api/organizer/[id]/profile
      // ✅ Swap to: axiosClient.get(`/organizer/${id}/profile`) when BE is ready
      const res = await fetch(`/api/organizer/${id}/profile`);
      if (!res.ok) throw new Error(`Failed to fetch organizer profile: ${id}`);
      const json: OrganizerProfileResponse = await res.json();
      return json.data;
    }

    // 🚀 REAL: restore when BE is ready
    // const { default: axiosClient } = await import("@/lib/axios-client");
    // const response = await axiosClient.get<OrganizerProfileResponse>(`/organizer/${id}/profile`);
    // return response.data.data;
    throw new Error("Real API not configured");
  },
};

