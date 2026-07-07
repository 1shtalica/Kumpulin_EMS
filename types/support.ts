import type { Community, Post } from "@/types/community";
import type { OrganizerEventCard } from "@/types/event";

export type SupportAccessState = {
  events: boolean;
  community: boolean;
};

export type SupportEventsResult = {
  data: OrganizerEventCard[];
  total: number;
  page: number;
  limit: number;
};

export type SupportCommunityResult = {
  community: Community;
  posts: Post[];
};

export type OrganizerTeamMemberStatus = "active" | "revoked" | "pending" | string;

export type OrganizerTeamMember = {
  id: string;
  user_id?: string | number | null;
  email?: string | null;
  user_email?: string | null;
  name?: string | null;
  role: "owner" | "support" | string;
  status: OrganizerTeamMemberStatus;
  created_at?: string;
  updated_at?: string;
};

export type OrganizerTeamMemberPayload = {
  email?: string;
  user_id?: string | number;
};
