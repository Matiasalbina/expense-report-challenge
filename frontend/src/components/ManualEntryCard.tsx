import { useEffect, useMemo, useState } from "react";
import type { ExpenseRow } from "../types";
import { apiFetch } from "../lib/api";
import { reportsApi } from "../lib/reports.api";
import { getMinExpenseDate, getMaxExpenseDate } from "../lib/format";

type Props = {
  onCreated: () => void;
};

type OptionItem = {
  id: number;
  name: string;
};

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

// ISO YYYY-MM-DD se puede comparar lexicográficamente
function isISODateInRange(value: string, minISO: string, maxISO: string) {
  return value >= minISO && value <= maxISO;
}

export default function ManualEntryCard({ onCreated }: Props) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const minDate = useMemo(() => getMinExpenseDate(), []);
  const maxDate = useMemo(() => getMaxExpenseDate(), []);

  const [form, setForm] = useState<ExpenseRow>({
    date: todayISO(),
    amount: 0,
    currency: "USD",
    department: "",
    category: "",
    description: "",
  });

  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Mensajes “de servidor”
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Para mostrar errores visuales solo después de intentar enviar
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  async function loadMeta() {
    setServerError(null);
    setLoadingMeta(true);
    try {
      const deps = await apiFetch<OptionItem[]>("/meta/departments");
      const cats = await apiFetch<OptionItem[]>("/meta/categories");

      setDepartments(deps.map((d) => d.name));
      setCategories(cats.map((c) => c.name));
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to load departments/categories");
    } finally {
      setLoadingMeta(false);
    }
  }

  useEffect(() => {
    loadMeta();
  }, []);

  // ✅ ÚNICA fuente de verdad de validación
  function getValidationMessage(f: ExpenseRow): string | null {
    if (!f.date) return "Please select a date.";
    if (!isISODateInRange(f.date, minDate, maxDate))
      return `Date must be between ${minDate} and ${maxDate}.`;

    if (!Number.isFinite(f.amount) || f.amount <= 0)
      return "Please enter an amount greater than 0.";

    if (!f.department) return "Please select a department.";
    if (!f.category) return "Please select a category.";

    if (!f.description || f.description.trim().length < 3)
      return "Please enter a description (at least 3 characters).";

    return null;
  }

  const validationMsg = useMemo(
    () => getValidationMessage(form),
    [form, minDate, maxDate]
  );

  const canSubmit = useMemo(() => validationMsg === null, [validationMsg]);

  // helpers para borde rojo (solo cuando el user intentó enviar)
  const showFieldErrors = touchedSubmit && !!validationMsg;

  const dateInvalid =
    showFieldErrors &&
    (!!getValidationMessage({
      ...form,
      amount: 1,
      department: "x",
      category: "x",
      description: "xxx",
    }) ||
      !form.date ||
      !isISODateInRange(form.date, minDate, maxDate));

  const amountInvalid =
    showFieldErrors && (!Number.isFinite(form.amount) || form.amount <= 0);

  const deptInvalid = showFieldErrors && !form.department;
  const catInvalid = showFieldErrors && !form.category;
  const descInvalid =
    showFieldErrors &&
    (!form.description || form.description.trim().length < 3);

  async function onSubmit() {
    setServerError(null);
    setSuccess(null);
    setTouchedSubmit(true);

    const msg = getValidationMessage(form);
    if (msg) return; // ✅ el banner rojo ya lo muestra

    setSubmitting(true);
    try {
      await reportsApi.submit({
        expenses: [
          {
            ...form,
            currency: "USD",
            description: form.description.trim(),
          },
        ],
      });

      setSuccess("Expense submitted successfully.");
      setTouchedSubmit(false);

      setForm({
        date: todayISO(),
        amount: 0,
        currency: "USD",
        department: "",
        category: "",
        description: "",
      });

      onCreated();
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <div className="text-sm font-medium text-gray-900">Manual entry</div>
        <div className="text-xs text-gray-600">
          Create a single expense line item and submit it as a report.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loadingMeta && (
          <div className="text-sm text-gray-600">Loading form data...</div>
        )}

        {/* ✅ Validación cliente (banner rojo) */}
        {touchedSubmit && validationMsg && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {validationMsg}
          </div>
        )}

        {/* Error del backend */}
        {serverError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={form.date}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                setForm((p) => ({ ...p, date: e.target.value }));
                setSuccess(null);
                setServerError(null);
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                dateInvalid ? "border-red-300" : ""
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              step="0.01"
              value={Number.isFinite(form.amount) ? String(form.amount) : ""}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, amount: v === "" ? NaN : Number(v) }));
                setSuccess(null);
                setServerError(null);
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                amountInvalid ? "border-red-300" : ""
              }`}
              placeholder="e.g. 120.50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Currency
            </label>
            <input
              value="USD"
              disabled
              className="w-full rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => {
                setForm((p) => ({ ...p, department: e.target.value }));
                setSuccess(null);
                setServerError(null);
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                deptInvalid ? "border-red-300" : ""
              }`}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => {
                setForm((p) => ({ ...p, category: e.target.value }));
                setSuccess(null);
                setServerError(null);
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                catInvalid ? "border-red-300" : ""
              }`}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                setSuccess(null);
                setServerError(null);
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm ${
                descInvalid ? "border-red-300" : ""
              }`}
              placeholder="At least 3 characters"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onSubmit}
            disabled={submitting || loadingMeta}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
