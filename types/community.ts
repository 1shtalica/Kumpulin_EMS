export interface Community {
  id: string;
  organizer_id: string;
  name: string;
  slug: string;
  description: string;
  rules: string;
  logo_url: string | null;
  banner_url: string | null;
  visibility: string;
  member_count: number;
  event_count?: number;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityResponse {
  success: boolean;
  message: string;
  data: Community;
}

export interface CreateCommunityPayload {
  name: string;
  slug: string;
  description?: string;
  rules?: string;
  logo?: File | null;
  banner?: File | null;
}

export type UpdateCommunityPayload = CreateCommunityPayload;
