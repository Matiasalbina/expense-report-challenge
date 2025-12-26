export type OptionItem = { id: number; name: string };

export type ExpenseRow = {
  date: string;
  amount: number;
  currency: "USD" | string;
  department: string;
  category: string;
  description: string;
};

export type RowIssue = { code: string; message: string };

export type RowValidationResult = {
  row: number;
  data?: ExpenseRow | null;
  errors: RowIssue[];
  warnings: RowIssue[];
};

export type ValidateExpensesResponse = {
  valid: RowValidationResult[];
  invalid: RowValidationResult[];
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
};

export type LoginResponse = { token: string };

export type ReportSubmitRequest = { expenses: ExpenseRow[] };

export type ReportResponse = {
  id: string;
  created_at: string;
  total_amount: number;
  currency: "USD";
  items_count: number;
  expenses: ExpenseRow[];
};

export type ReportSummary = {
  id: string;
  created_at: string;
  total_amount: number;
  currency: "USD" | string;
  items_count: number;
};

export type ReportDetail = ReportSummary & {
  expenses: ExpenseRow[];
};
