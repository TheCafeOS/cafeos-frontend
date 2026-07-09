import api from "@/services/api";
import type {
  DashboardSummary,
  DashboardSummaryResponse,
} from "@/types/dashboard";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummaryResponse>(
    "/api/v1/dashboard/summary",
  );

  return response.data.data;
}
