// ============================================================
// Organizer Profile Types - aligned with GET /organizer/profile API contract
// ============================================================

export interface OrganizerProfileEvent {
  id: string;
  title: string;
  slug: string;
  event_mode: "offline" | "online" | "hybrid";
  status: string;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
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
  events?: {
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

export interface OrganizerDashboardOverview {
  total_events: number;
  upcoming_events: number;
  past_events: number;
  draft_events: number;
  published_events: number;
  total_tickets_sold: number;
  total_capacity: number;
  overall_occupancy_rate: number;
  total_revenue: number;
  currency: string;
  followers: number;
  community_members: number;
  community_posts: number;
  available_balance: number;
  pending_balance: number;
  requested_withdrawal_amount: number;
}

export interface OrganizerEventPerformance {
  event_id: string;
  title: string;
  status: string;
  event_start_date: string;
  event_end_date: string;
  tickets_sold: number;
  capacity: number;
  occupancy_rate: number;
  revenue: number;
  wishlist_count: number;
  issued_tickets: number;
  checked_in_tickets: number;
  checkin_rate: number;
}

export interface OrganizerSalesByTicketCategory {
  ticket_category_id: string;
  event_id: string;
  event_title: string;
  name: string;
  quantity_sold: number;
  revenue: number;
}

export interface OrganizerDashboardSales {
  paid_orders: number;
  pending_orders: number;
  expired_orders: number;
  cancelled_orders: number;
  total_orders: number;
  total_revenue: number;
  order_conversion_rate: number;
  sales_by_ticket_category: OrganizerSalesByTicketCategory[];
}

export interface OrganizerDashboardFinance {
  available_amount: number;
  pending_amount: number;
  requested_withdrawal_amount: number;
  currency: string;
}

export interface OrganizerDashboardCommunity {
  followers: number;
  members: number;
  posts: number;
  comments: number;
}

export interface OrganizerDashboardData {
  overview: OrganizerDashboardOverview;
  event_performance: OrganizerEventPerformance[];
  sales: OrganizerDashboardSales;
  finance: OrganizerDashboardFinance;
  community: OrganizerDashboardCommunity;
}

export interface OrganizerDashboardResponse {
  success: boolean;
  message: string;
  data: OrganizerDashboardData;
}
