import axiosClient from "@/lib/axios-client";
import type {
    ApiResponse,
    Comment,
    Community,
    CommunityResponse,
    CreateCommentPayload,
    CreateCommunityPayload,
    CreatePostPayload,
    Membership,
    NewestPostsResponse,
    NewestPostsResult,
    PaginatedApiResponse,
    PaginatedResult,
    Post,
    UpdateCommentPayload,
    UpdateCommunityPayload,
    UpdatePostPayload,
} from "@/types/community";

const MAX_POST_IMAGES = 5;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const hasCommunityFiles = (
    payload: Pick<CreateCommunityPayload, "logo" | "banner">,
) => Boolean(payload.logo || payload.banner);

const hasPostFiles = (payload: Pick<CreatePostPayload, "images">) =>
    Boolean(payload.images?.length);

const normalizePostType = (postType?: CreatePostPayload["post_type"]) =>
    postType ?? "text";

const normalizePagination = <T>(
    payload: PaginatedApiResponse<T>,
    fallbackPage: number,
    fallbackLimit: number,
): PaginatedResult<T> => {
    const page = payload.pagination?.page ?? payload.page ?? fallbackPage;
    const limit = payload.pagination?.limit ?? payload.limit ?? fallbackLimit;
    const total = payload.pagination?.total ?? payload.total;
    const totalPages = payload.pagination?.total_pages;
    const hasNext =
        payload.pagination?.has_next ??
        payload.pagination?.has_more ??
        (typeof totalPages === "number" ? page < totalPages : false);

    return {
        data: payload.data ?? [],
        page,
        limit,
        total,
        totalPages,
        hasNext,
    };
};

const validateImages = (images: File[], options: { min?: number } = {}) => {
    if (options.min && images.length < options.min) {
        throw new Error("Pilih minimal satu gambar.");
    }

    if (images.length > MAX_POST_IMAGES) {
        throw new Error("Maksimal 5 gambar per postingan.");
    }

    const oversizedImage = images.find(
        (image) => image.size > MAX_IMAGE_SIZE_BYTES,
    );

    if (oversizedImage) {
        throw new Error(`Ukuran ${oversizedImage.name} melebihi 5 MB.`);
    }
};

const buildCommunityFormData = (
    payload: CreateCommunityPayload | UpdateCommunityPayload,
) => {
    const formData = new FormData();

    if (payload.name !== undefined) formData.append("name", payload.name);
    if (payload.slug !== undefined) formData.append("slug", payload.slug);
    if (payload.description !== undefined) {
        formData.append("description", payload.description);
    }
    if (payload.rules !== undefined) formData.append("rules", payload.rules);
    if (payload.logo) formData.append("logo", payload.logo);
    if (payload.banner) formData.append("banner", payload.banner);

    return formData;
};

const buildCommunityJson = (
    payload: CreateCommunityPayload | UpdateCommunityPayload,
) => ({
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.slug !== undefined ? { slug: payload.slug } : {}),
    ...(payload.description !== undefined
        ? { description: payload.description }
        : {}),
    ...(payload.rules !== undefined ? { rules: payload.rules } : {}),
});

const buildPostFormData = (payload: CreatePostPayload) => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("body", payload.body);
    formData.append("post_type", normalizePostType(payload.post_type));
    payload.images?.forEach((image) => formData.append("images", image));
    return formData;
};

export const CommunityService = {
    async getNewestPosts({
        limit = 20,
        cursor,
    }: {
        limit?: number;
        cursor?: string | null;
    } = {}): Promise<NewestPostsResult> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const response = await axiosClient.get<NewestPostsResponse>(
            "/posts/newest",
            {
                params: {
                    limit: safeLimit,
                    ...(cursor ? { cursor } : {}),
                },
                skipAuthFailureRedirect: true,
            },
        );

        return {
            items: response.data.data?.items ?? [],
            next_cursor: response.data.data?.next_cursor ?? null,
        };
    },

    async getFollowedPosts({
        limit = 20,
        cursor,
    }: {
        limit?: number;
        cursor?: string | null;
    } = {}): Promise<NewestPostsResult> {
        const safeLimit = Math.min(Math.max(limit, 1), 100);
        const response = await axiosClient.get<NewestPostsResponse>(
            "/posts/followed",
            {
                params: {
                    limit: safeLimit,
                    ...(cursor ? { cursor } : {}),
                },
                skipAuthFailureRedirect: true,
            },
        );

        return {
            items: response.data.data?.items ?? [],
            next_cursor: response.data.data?.next_cursor ?? null,
        };
    },

    async createCommunity(payload: CreateCommunityPayload): Promise<Community> {
        if (hasCommunityFiles(payload)) {
            const response = await axiosClient.post<CommunityResponse>(
                "/communities",
                buildCommunityFormData(payload),
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return response.data.data;
        }

        const response = await axiosClient.post<CommunityResponse>(
            "/communities",
            buildCommunityJson(payload),
        );
        return response.data.data;
    },

    async createOrganizerCommunity(
        payload: CreateCommunityPayload,
    ): Promise<Community> {
        if (hasCommunityFiles(payload)) {
            const response = await axiosClient.post<CommunityResponse>(
                "/organizer/community",
                buildCommunityFormData(payload),
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return response.data.data;
        }

        const response = await axiosClient.post<CommunityResponse>(
            "/organizer/community",
            buildCommunityJson(payload),
        );
        return response.data.data;
    },

    async getCommunityById(communityId: string): Promise<Community> {
        const response = await axiosClient.get<CommunityResponse>(
            `/communities/${communityId}`,
        );
        return response.data.data;
    },

    async getCommunityBySlug(slug: string): Promise<Community> {
        const response = await axiosClient.get<CommunityResponse>(
            `/communities/slug/${slug}`,
        );
        return response.data.data;
    },

    async getCommunityByOrganizer(): Promise<Community> {
        const response = await axiosClient.get<CommunityResponse>(
            "/organizer/community",
        );
        return response.data.data;
    },

    async updateCommunity(
        communityId: string,
        payload: UpdateCommunityPayload,
    ): Promise<Community> {
        if (hasCommunityFiles(payload)) {
            const response = await axiosClient.patch<CommunityResponse>(
                `/communities/${communityId}`,
                buildCommunityFormData(payload),
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return response.data.data;
        }

        const response = await axiosClient.patch<CommunityResponse>(
            `/communities/${communityId}`,
            buildCommunityJson(payload),
        );
        return response.data.data;
    },

    async updateOrganizerCommunity(
        payload: UpdateCommunityPayload,
    ): Promise<Community> {
        if (hasCommunityFiles(payload)) {
            const response = await axiosClient.patch<CommunityResponse>(
                "/organizer/community",
                buildCommunityFormData(payload),
                { headers: { "Content-Type": "multipart/form-data" } },
            );
            return response.data.data;
        }

        const response = await axiosClient.patch<CommunityResponse>(
            "/organizer/community",
            buildCommunityJson(payload),
        );
        return response.data.data;
    },

    async deleteCommunity(communityId: string): Promise<void> {
        await axiosClient.delete(`/communities/${communityId}`);
    },

    async deleteOrganizerCommunity(): Promise<void> {
        await axiosClient.delete("/organizer/community");
    },

    async joinCommunity(communityId: string): Promise<Membership> {
        const response = await axiosClient.post<ApiResponse<Membership>>(
            `/communities/${communityId}/join`,
        );
        return response.data.data;
    },

    async leaveCommunity(communityId: string): Promise<void> {
        await axiosClient.delete(`/communities/${communityId}/members/me`);
    },

    async setMemberRole(
        communityId: string,
        userId: string | number,
        role: "moderator" | "member",
    ): Promise<Membership> {
        const response = await axiosClient.patch<ApiResponse<Membership>>(
            `/communities/${communityId}/members/${userId}/role`,
            { role },
        );
        return response.data.data;
    },

    async listPosts(
        communityId: string,
        page = 1,
        limit = 20,
    ): Promise<PaginatedResult<Post>> {
        const response = await axiosClient.get<PaginatedApiResponse<Post>>(
            `/communities/${communityId}/posts`,
            { params: { page, limit } },
        );
        return normalizePagination(response.data, page, limit);
    },

    async getCommunityPostById(
        communityId: string,
        postId: string,
    ): Promise<Post> {
        const response = await axiosClient.get<ApiResponse<Post>>(
            `/communities/${communityId}/posts/${postId}`,
            { skipAuthFailureRedirect: true },
        );
        return response.data.data;
    },

    async createPost(
        communityId: string,
        payload: CreatePostPayload,
    ): Promise<Post> {
        const images = payload.images ?? [];
        validateImages(images);

        if (hasPostFiles(payload)) {
            const response = await axiosClient.post<ApiResponse<Post>>(
                `/communities/${communityId}/posts`,
                buildPostFormData(payload),
            );
            return response.data.data;
        }

        const response = await axiosClient.post<ApiResponse<Post>>(
            `/communities/${communityId}/posts`,
            {
                title: payload.title,
                body: payload.body,
                post_type: normalizePostType(payload.post_type),
            },
        );
        return response.data.data;
    },

    async updatePost(
        communityId: string,
        postId: string,
        payload: UpdatePostPayload,
    ): Promise<Post> {
        const response = await axiosClient.patch<ApiResponse<Post>>(
            `/communities/${communityId}/posts/${postId}`,
            payload,
        );
        return response.data.data;
    },

    async replacePostImages(
        communityId: string,
        postId: string,
        images: File[],
    ): Promise<Post> {
        validateImages(images, { min: 1 });
        const formData = new FormData();
        images.forEach((image) => formData.append("images", image));

        const response = await axiosClient.patch<ApiResponse<Post>>(
            `/communities/${communityId}/posts/${postId}/images`,
            formData,
        );
        return response.data.data;
    },

    async deletePost(communityId: string, postId: string): Promise<void> {
        await axiosClient.delete(`/communities/${communityId}/posts/${postId}`);
    },

    async listComments(
        communityId: string,
        postId: string,
        page = 1,
        limit = 20,
    ): Promise<PaginatedResult<Comment>> {
        const response = await axiosClient.get<PaginatedApiResponse<Comment>>(
            `/communities/${communityId}/posts/${postId}/comments`,
            { params: { page, limit } },
        );
        return normalizePagination(response.data, page, limit);
    },

    async createComment(
        communityId: string,
        postId: string,
        payload: CreateCommentPayload,
    ): Promise<Comment> {
        const response = await axiosClient.post<ApiResponse<Comment>>(
            `/communities/${communityId}/posts/${postId}/comments`,
            payload,
        );
        return response.data.data;
    },

    async updateComment(
        communityId: string,
        postId: string,
        commentId: string,
        payload: UpdateCommentPayload,
    ): Promise<Comment> {
        const response = await axiosClient.patch<ApiResponse<Comment>>(
            `/communities/${communityId}/posts/${postId}/comments/${commentId}`,
            payload,
        );
        return response.data.data;
    },

    async deleteComment(
        communityId: string,
        postId: string,
        commentId: string,
    ): Promise<void> {
        await axiosClient.delete(
            `/communities/${communityId}/posts/${postId}/comments/${commentId}`,
        );
    },
};
