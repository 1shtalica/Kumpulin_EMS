import type { AxiosError } from "axios";
import axiosClient from "@/lib/axios-client";
import type {
  GetMyTicketsParams,
  MyTicketDetail,
  MyTicketDetailResponse,
  MyTicketsListData,
  MyTicketsListResponse,
  TicketApiError,
} from "@/types/ticket";

const normalizePage = (page?: number) =>
  Number.isFinite(page) && (page ?? 0) > 0 ? Math.floor(page as number) : 1;

const normalizeLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) return 10;
  const normalized = Math.floor(limit as number);
  if (normalized < 1) return 1;
  if (normalized > 100) return 100;
  return normalized;
};

export const getTicketApiErrorMessage = (
  error: unknown,
  fallback: string,
) => {
  const axiosError = error as AxiosError<TicketApiError>;
  return (
    axiosError.response?.data?.message ||
    (error instanceof Error ? error.message : fallback)
  );
};

export const getTicketApiErrorCode = (error: unknown) => {
  const axiosError = error as AxiosError<TicketApiError>;
  return axiosError.response?.data?.error_code ?? "";
};

export const TicketService = {
  async getMyTickets(params: GetMyTicketsParams = {}): Promise<MyTicketsListData> {
    const page = normalizePage(params.page);
    const limit = normalizeLimit(params.limit);

    const response = await axiosClient.get<MyTicketsListResponse>(
      "/my-tickets",
      {
        params: {
          page,
          limit,
          ...(params.status ? { status: params.status } : {}),
          ...(params.event_id ? { event_id: params.event_id } : {}),
        },
      },
    );

    return response.data.data;
  },

  async getMyTicketDetail(ticketId: string): Promise<MyTicketDetail> {
    const response = await axiosClient.get<MyTicketDetailResponse>(
      `/my-tickets/${ticketId}`,
    );

    return response.data.data;
  },
};
