// ============================================================
// Organizer Profile Types — aligned with GET /organizer/profile API contract
// ============================================================

export interface OrganizerProfileEvent {
  id: string;
  title: string;
  slug: string;
  event_mode: "offline" | "online" | "hybrid";
  status: string;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  attendee_count: number;
  primary_image?: string;
}

export interface OrganizerProfileReview {
  id: string;
  reviewer_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string; // ISO 8601
}

export interface OrganizerProfileStats {
  followers: number;
  total_events: number;
  total_event_attendees: number;
  upcoming_events_count: number;
  past_events_count: number;
  reviews_count: number;
  average_rating: number;
}

export interface OrganizerProfileInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  joined_at: string; // ISO 8601
  profile_image_url?: string;
  banner_image_url?: string;
}

export interface OrganizerProfileData {
  organizer: OrganizerProfileInfo;
  stats: OrganizerProfileStats;
  events: {
    upcoming: OrganizerProfileEvent[];
    past: OrganizerProfileEvent[];
  };
  reviews: OrganizerProfileReview[];
}

export interface OrganizerProfileResponse {
  success: boolean;
  message: string;
  data: OrganizerProfileData;
}
