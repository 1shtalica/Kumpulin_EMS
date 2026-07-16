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
  is_member?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error_code?: string;
  errors?: unknown[];
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    has_next?: boolean;
    has_more?: boolean;
  };
  total?: number;
  page?: number;
  limit?: number;
}

export type CommunityResponse = ApiResponse<Community>;

export interface RelatedEvent {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  event_start_date: string;
  starting_price: number;
}

export interface Post {
  id: string;
  community_id: string;
  community_slug?: string | null;
  community_name?: string | null;
  community_logo_url?: string | null;
  author_user_id: number;
  author_name?: string | null;
  author_username?: string | null;
  username?: string | null;
  organizer_name?: string | null;
  title: string;
  body: string;
  image_urls: string[];
  post_type: "text" | "announcement" | string;
  related_event_id: string | null;
  related_event: RelatedEvent | null;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export type CommunityPost = Post;

export interface Comment {
  id: string;
  community_id: string;
  post_id: string;
  parent_comment_id: string | null;
  author_user_id: number;
  author_name?: string | null;
  author_profile_url?: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  community_id: string;
  user_id: number;
  role: "owner" | "moderator" | "member";
  status: "active" | "left" | "removed";
  joined_at: string;
  updated_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasNext: boolean;
}

export interface NewestPostsResult {
  items: Post[];
  next_cursor: string | null;
}

export interface NewestPostsResponse {
  success: boolean;
  message: string;
  data: NewestPostsResult;
  error_code?: string;
  errors?: unknown[];
}

export interface CreateCommunityPayload {
  name: string;
  slug: string;
  description?: string;
  rules?: string;
  logo?: File | null;
  banner?: File | null;
}

export interface UpdateCommunityPayload {
  name?: string;
  slug?: string;
  description?: string;
  rules?: string;
  logo?: File | null;
  banner?: File | null;
}

export interface CreatePostPayload {
  title: string;
  body: string;
  post_type?: "text" | "announcement";
  images?: File[];
  related_event_id?: string | null;
}

export interface UpdatePostPayload {
  title?: string;
  body?: string;
  related_event_id?: string | null;
}

export interface CreateCommentPayload {
  body: string;
  parent_comment_id?: string;
}

export interface UpdateCommentPayload {
  body: string;
}
