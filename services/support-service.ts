import axiosClient from "@/lib/axios-client";
import type { Community } from "@/types/community";
import type { Event, OrganizerEventCard } from "@/types/event";
import type {
  OrganizerTeamMember,
  OrganizerTeamMemberPayload,
  SupportAccessState,
  SupportCommunityResult,
  SupportEventsResult,
} from "@/types/support";

type ApiListResponse<T> = {
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
  };
};

type ApiDataResponse<T> = {
  data?: T;
  message?: string;
};

type SupportCommunityResponse =
  | ApiDataResponse<SupportCommunityResult>
  | ApiDataResponse<Community>
  | (SupportCommunityResult & { message?: string });

const normalizeTeamMembers = (payload: unknown): OrganizerTeamMember[] => {
  const data = (payload as { data?: unknown }).data ?? payload;
  if (Array.isArray(data)) return data as OrganizerTeamMember[];
  const members = (data as { members?: unknown })?.members;
  return Array.isArray(members) ? (members as OrganizerTeamMember[]) : [];
};

export const SupportService = {
  async getSupportEvents({
    q = "",
    status = "",
    offset = 0,
    limit = 10,
  }: {
    q?: string;
    status?: string;
    offset?: number;
    limit?: number;
  } = {}): Promise<SupportEventsResult> {
    const response = await axiosClient.get<ApiListResponse<OrganizerEventCard>>(
      "/organizer/support/events",
      {
        params: {
          ...(q ? { q } : {}),
          ...(status && status !== "all" ? { status } : {}),
          offset,
          limit,
        },
      },
    );

    return {
      data: response.data.data ?? [],
      total: response.data.pagination?.total ?? response.data.total ?? 0,
      page: response.data.pagination?.page ?? response.data.page ?? Math.floor(offset / limit) + 1,
      limit: response.data.pagination?.limit ?? response.data.limit ?? limit,
    };
  },

  async getSupportEventDetail(eventID: string): Promise<Event> {
    const response = await axiosClient.get<ApiDataResponse<Event>>(
      `/organizer/support/events/${eventID}`,
    );
    if (!response.data.data) {
      throw new Error("Event not found.");
    }
    return response.data.data;
  },
  async getSupportCommunity(): Promise<SupportCommunityResult> {
    const response = await axiosClient.get<SupportCommunityResponse>(
      "/organizer/support/community",
    );
    const payload = response.data;
    const data = "data" in payload ? payload.data : payload;

    if (data && "community" in data) {
      return {
        community: data.community,
        posts: data.posts ?? [],
      };
    }

    return {
      community: data as Community,
      posts: [],
    };
  },

  async getSupportAccess(): Promise<SupportAccessState> {
    const [eventsResult, communityResult] = await Promise.allSettled([
      this.getSupportEvents({ limit: 1 }),
      this.getSupportCommunity(),
    ]);

    return {
      events: eventsResult.status === "fulfilled",
      community: communityResult.status === "fulfilled",
    };
  },
};

export const OrganizerTeamService = {
  async listMembers(): Promise<OrganizerTeamMember[]> {
    const response = await axiosClient.get("/organizer/team");
    return normalizeTeamMembers(response.data);
  },

  async addSupportMember(
    payload: OrganizerTeamMemberPayload,
  ): Promise<OrganizerTeamMember | null> {
    const body = {
      ...payload,
      role: "support",
    };

    const response = await axiosClient.post<ApiDataResponse<OrganizerTeamMember>>(
      "/organizer/team",
      body,
    );
    return response.data.data ?? null;
  },

  async updateMember(
    memberId: string,
    payload: Partial<Pick<OrganizerTeamMember, "role" | "status">>,
  ): Promise<OrganizerTeamMember | null> {
    const response = await axiosClient.patch<ApiDataResponse<OrganizerTeamMember>>(
      `/organizer/team/${memberId}`,
      payload,
    );
    return response.data.data ?? null;
  },

  async revokeMember(memberId: string): Promise<void> {
    await this.updateMember(memberId, { status: "revoked" });
  },

  async removeMember(memberId: string): Promise<void> {
    await axiosClient.delete(`/organizer/team/${memberId}`);
  },
};

