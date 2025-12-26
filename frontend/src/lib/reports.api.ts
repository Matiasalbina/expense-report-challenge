import { apiFetch } from "./api";
import type {
  ReportSummary,
  ReportDetail,
  ReportSubmitRequest,
} from "../types";

export const reportsApi = {
  list: () => apiFetch<ReportSummary[]>("/reports"),

  getById: (id: string) => apiFetch<ReportDetail>(`/reports/${id}`),

  submit: (payload: ReportSubmitRequest) =>
    apiFetch<ReportDetail>("/reports/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
