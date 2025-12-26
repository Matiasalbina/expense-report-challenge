import { apiFetch } from "./api";
import type { ValidateExpensesResponse } from "../types";

export const expensesApi = {
  validate: async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    // Importante: NO setear Content-Type manualmente, el browser agrega boundary
    return apiFetch<ValidateExpensesResponse>("/expenses/validate", {
      method: "POST",
      body: form,
    });
  },
};
