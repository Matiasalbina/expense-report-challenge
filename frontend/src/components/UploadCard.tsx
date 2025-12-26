import { useMemo, useState } from "react";
import type {
  ExpenseRow,
  RowValidationResult,
  ValidateExpensesResponse,
} from "../types";
import { expensesApi } from "../lib/expenses.api";
import { reportsApi } from "../lib/reports.api";

type Props = {
  onSubmitted: () => void;
};

function formatMoneyUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatDateUSShort(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value || "");
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(d);
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  );
}

export default function UploadCard({ onSubmitted }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<ValidateExpensesResponse | null>(null);
  const [validRows, setValidRows] = useState<RowValidationResult[]>([]);
  const [invalidRows, setInvalidRows] = useState<RowValidationResult[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canValidate = !!file && !validating && !submitting;
  const canSubmit =
    validRows.length > 0 &&
    invalidRows.length === 0 &&
    !submitting &&
    !validating;

  const isBusy = validating || submitting;

  async function onValidate() {
    if (!file) return;

    setError(null);
    setSuccess(null);
    setValidating(true);

    try {
      const res = await expensesApi.validate(file);
      setResult(res);
      setValidRows(res.valid);
      setInvalidRows(res.invalid);
    } catch (e: any) {
      setError(e?.message ?? "Failed to validate file");
    } finally {
      setValidating(false);
    }
  }

  // Remove row + mantener summary consistente
  function removeInvalid(rowNumber: number) {
    setInvalidRows((prev) => {
      const next = prev.filter((r) => r.row !== rowNumber);

      // Mantener contadores del summary alineados (si result existe)
      setResult((r) =>
        r
          ? {
              ...r,
              valid_rows: validRows.length,
              invalid_rows: next.length,
            }
          : r
      );

      return next;
    });
  }

  const submitPayload = useMemo(() => {
    const expenses: ExpenseRow[] = validRows
      .map((r) => r.data)
      .filter((d): d is ExpenseRow => !!d)
      .map((d) => ({
        ...d,
        currency: "USD",
        description: String(d.description ?? "").trim(),
      }));

    return { expenses };
  }, [validRows]);

  const totalValidAmount = useMemo(() => {
    return validRows.reduce((acc, r) => acc + (r.data?.amount ?? 0), 0);
  }, [validRows]);

  async function onSubmit() {
    setError(null);
    setSuccess(null);

    if (invalidRows.length > 0) {
      setError("You must fix or remove invalid rows before submitting.");
      return;
    }
    if (submitPayload.expenses.length === 0) {
      setError("No valid rows to submit.");
      return;
    }

    setSubmitting(true);
    try {
      await reportsApi.submit(submitPayload);
      setSuccess("Report submitted successfully.");

      // Limpia draft
      setResult(null);
      setValidRows([]);
      setInvalidRows([]);
      setFile(null);

      onSubmitted();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <div className="text-sm font-medium text-gray-900">Bulk upload</div>
        <div className="text-xs text-gray-600">
          Upload the provided .xlsx or .csv, validate rows, then submit as a
          report.
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Loading/progress UI */}
        {isBusy && (
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              {validating
                ? "Uploading & validating file..."
                : "Submitting report..."}
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-full w-2/3 animate-pulse bg-gray-900" />
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="file"
            accept=".xlsx,.csv"
            // Al cambiar de archivo, limpiar estado anterior
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setResult(null);
              setValidRows([]);
              setInvalidRows([]);
              setError(null);
              setSuccess(null);
            }}
            className="block w-full text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={onValidate}
              disabled={!canValidate}
              className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {validating && <Spinner />}
              {validating ? "Validating..." : "Validate"}
            </button>

            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting && <Spinner />}
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>

        {/* Summary */}
        {result && (
          <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-800">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium">Rows:</span> {result.total_rows} •{" "}
                <span className="font-medium">Valid:</span> {validRows.length} •{" "}
                <span className="font-medium">Invalid:</span>{" "}
                {invalidRows.length}
              </div>
              <div>
                <span className="font-medium">Valid total:</span>{" "}
                {formatMoneyUSD(totalValidAmount)}
              </div>
            </div>
            {invalidRows.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Remove invalid rows or fix the source file and validate again.
              </div>
            )}
          </div>
        )}

        {/* Invalid rows */}
        {invalidRows.length > 0 && (
          <div className="rounded-lg border">
            <div className="border-b p-3 text-sm font-medium text-gray-900">
              Invalid rows ({invalidRows.length})
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Reason</th>
                    <th className="px-3 py-2">Preview</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invalidRows.map((r) => (
                    <tr key={r.row}>
                      <td className="px-3 py-2 font-medium">#{r.row}</td>
                      <td className="px-3 py-2">
                        <ul className="list-disc pl-5">
                          {r.errors.map((e, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{e.code}:</span>{" "}
                              {e.message}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {r.data ? (
                          <div className="space-y-1">
                            <div>
                              <b>Date:</b>{" "}
                              {formatDateUSShort(String(r.data.date))}
                            </div>
                            <div>
                              <b>Dept:</b> {r.data.department}
                            </div>
                            <div>
                              <b>Cat:</b> {r.data.category}
                            </div>
                            <div>
                              <b>Desc:</b> {r.data.description}
                            </div>
                            <div>
                              <b>Amount:</b> {formatMoneyUSD(r.data.amount)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No data</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeInvalid(r.row)}
                          className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Remove row
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Valid rows preview */}
        {validRows.length > 0 && (
          <div className="rounded-lg border">
            <div className="border-b p-3 text-sm font-medium text-gray-900">
              Valid rows ready to submit ({validRows.length})
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {validRows.map((r) => (
                    <tr key={r.row}>
                      <td className="px-3 py-2 font-medium">#{r.row}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDateUSShort(String(r.data?.date ?? ""))}
                      </td>
                      <td className="px-3 py-2">{r.data?.department}</td>
                      <td className="px-3 py-2">{r.data?.category}</td>
                      <td className="px-3 py-2">{r.data?.description}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoneyUSD(r.data?.amount ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {invalidRows.length === 0 ? (
              <div className="p-3 text-xs text-emerald-700">
                All rows are valid. You can submit now.
              </div>
            ) : (
              <div className="p-3 text-xs text-gray-600">
                You can only submit after removing or fixing invalid rows.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
