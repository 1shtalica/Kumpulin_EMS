import axiosClient from "@/lib/axios-client";
import type {
  CreateWithdrawalRequest,
  OrganizerBalance,
  OrganizerFinanceApiResponse,
  OrganizerFinancePaginatedData,
  OrganizerLedgerEntry,
  OrganizerLedgerParams,
  OrganizerWithdrawal,
  OrganizerWithdrawalListParams,
} from "@/types/organizer-finance";

const defaultPage = 1;
const defaultLimit = 10;

function paginationParams<T extends { page?: number; limit?: number }>(params: T) {
  return {
    ...params,
    page: params.page ?? defaultPage,
    limit: params.limit ?? defaultLimit,
  };
}

export const OrganizerFinanceService = {
  async getBalance(): Promise<OrganizerBalance> {
    const response = await axiosClient.get<OrganizerFinanceApiResponse<OrganizerBalance>>(
      "/organizer/balance",
    );
    return response.data.data;
  },

  async getLedger(
    params: OrganizerLedgerParams = {},
  ): Promise<OrganizerFinancePaginatedData<OrganizerLedgerEntry>> {
    const response = await axiosClient.get<
      OrganizerFinanceApiResponse<OrganizerFinancePaginatedData<OrganizerLedgerEntry>>
    >("/organizer/ledger", {
      params: paginationParams(params),
    });
    return response.data.data;
  },

  async createWithdrawal(
    payload: CreateWithdrawalRequest,
  ): Promise<OrganizerWithdrawal> {
    const response = await axiosClient.post<
      OrganizerFinanceApiResponse<OrganizerWithdrawal>
    >("/organizer/withdrawals", payload);
    return response.data.data;
  },

  async getWithdrawals(
    params: OrganizerWithdrawalListParams = {},
  ): Promise<OrganizerFinancePaginatedData<OrganizerWithdrawal>> {
    const response = await axiosClient.get<
      OrganizerFinanceApiResponse<OrganizerFinancePaginatedData<OrganizerWithdrawal>>
    >("/organizer/withdrawals", {
      params: paginationParams(params),
    });
    return response.data.data;
  },

  async getWithdrawalDetail(withdrawalId: string): Promise<OrganizerWithdrawal> {
    const response = await axiosClient.get<
      OrganizerFinanceApiResponse<OrganizerWithdrawal>
    >(`/organizer/withdrawals/${withdrawalId}`);
    return response.data.data;
  },
};
