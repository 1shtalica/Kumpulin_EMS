import type { AxiosError } from "axios";
import axiosClient from "@/lib/axios-client";
import type {
  GetMyTicketsParams,
  MyTicketDetail,
  MyTicketDetailResponse,
  MyTicketListItem,
  MyTicketsListData,
  MyTicketsListResponse,
  TicketPagination,
  TicketStatus,
  TicketApiError,
} from "@/types/ticket";

type UnknownRecord = Record<string, unknown>;

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

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const readString = (record: UnknownRecord, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }

  return fallback;
};

const normalizeStatus = (value: unknown): TicketStatus => {
  const status = String(value ?? "").toLowerCase();
  if (
    status === "issued" ||
    status === "checked_in" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "invalidated"
  ) {
    return status;
  }

  return "invalidated";
};

const normalizePagination = (
  source: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): TicketPagination => {
  const pagination = asRecord(source);
  const page = Number(pagination.page ?? fallbackPage);
  const limit = Number(pagination.limit ?? fallbackLimit);
  const totalItems = Number(
    pagination.total_items ?? pagination.total ?? pagination.totalItems ?? 0,
  );
  const totalPages = Number(
    pagination.total_pages ?? pagination.totalPages ?? 1,
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    limit: Number.isFinite(limit) && limit > 0 ? limit : fallbackLimit,
    total_items: Number.isFinite(totalItems) && totalItems >= 0 ? totalItems : 0,
    total_pages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
};

const normalizeTicketListItem = (value: unknown): MyTicketListItem => {
  const ticket = asRecord(value);
  const event = asRecord(ticket.event);
  const category = asRecord(ticket.category ?? ticket.ticket_category);
  const participant = asRecord(ticket.participant);

  return {
    id: readString(ticket, ["id", "ticket_id"]),
    ticket_number: readString(ticket, ["ticket_number", "manual_code"]),
    status: normalizeStatus(ticket.status ?? ticket.ticket_status),
    event_id: readString(ticket, ["event_id"], readString(event, ["id"])),
    event_title: readString(
      ticket,
      ["event_title", "title"],
      readString(event, ["title", "name"]),
    ),
    ticket_category_id: readString(
      ticket,
      ["ticket_category_id", "category_id"],
      readString(category, ["id"]),
    ),
    ticket_category_name: readString(
      ticket,
      ["ticket_category_name", "category_name"],
      readString(category, ["name"]),
    ),
    participant_name: readString(
      ticket,
      ["participant_name"],
      readString(participant, ["full_name", "name"]),
    ),
    qr_code: readString(ticket, ["qr_code", "qr_token", "manual_code"]),
    issued_at: readString(ticket, ["issued_at", "created_at"]),
  };
};

const normalizeTicketDetail = (value: unknown): MyTicketDetail => {
  const ticket = asRecord(value);
  const event = asRecord(ticket.event);
  const category = asRecord(ticket.category ?? ticket.ticket_category);
  const participant = asRecord(ticket.participant);

  return {
    id: readString(ticket, ["id", "ticket_id"]),
    ticket_number: readString(ticket, ["ticket_number", "manual_code"]),
    status: normalizeStatus(ticket.status ?? ticket.ticket_status),
    event: {
      id: readString(ticket, ["event_id"], readString(event, ["id"])),
      title: readString(event, ["title", "name"]),
      start_time: readString(event, ["start_time", "start_date"]),
      end_time: readString(event, ["end_time", "end_date"]),
    },
    category: {
      id: readString(
        ticket,
        ["ticket_category_id", "category_id"],
        readString(category, ["id"]),
      ),
      name: readString(
        ticket,
        ["ticket_category_name", "category_name"],
        readString(category, ["name"]),
      ),
    },
    participant: {
      full_name: readString(
        ticket,
        ["participant_name"],
        readString(participant, ["full_name", "name"]),
      ),
      email: readString(
        ticket,
        ["participant_email"],
        readString(participant, ["email"]),
      ),
      phone: readString(
        ticket,
        ["participant_phone"],
        readString(participant, ["phone"]),
      ),
    },
    qr_code: readString(ticket, ["qr_code", "qr_token", "manual_code"]),
    checked_in_at:
      readString(ticket, ["checked_in_at"]) ||
      (ticket.checked_in_at === null ? null : ""),
    issued_at: readString(ticket, ["issued_at", "created_at"]),
  };
};

const normalizeTicketsData = (
  response: MyTicketsListResponse,
  fallbackPage: number,
  fallbackLimit: number,
): MyTicketsListData => {
  const root = asRecord(response);
  const data = asRecord(root.data);
  const dataValue = root.data;
  const rawItems = Array.isArray(dataValue)
    ? dataValue
    : Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.tickets)
        ? data.tickets
        : [];

  return {
    items: rawItems.map(normalizeTicketListItem),
    pagination: normalizePagination(
      data.pagination ?? root.pagination,
      fallbackPage,
      fallbackLimit,
    ),
  };
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

    return normalizeTicketsData(response.data, page, limit);
  },

  async getMyTicketDetail(ticketId: string): Promise<MyTicketDetail> {
    const response = await axiosClient.get<MyTicketDetailResponse>(
      `/my-tickets/${ticketId}`,
    );

    return normalizeTicketDetail(response.data.data);
  },
};
