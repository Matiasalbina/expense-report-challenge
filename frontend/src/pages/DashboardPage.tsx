import { useEffect, useMemo, useState } from "react";
import { reportsApi } from "../lib/reports.api";
import type { ReportDetail, ReportSummary } from "../types";
import ManualEntryCard from "../components/ManualEntryCard";
import UploadCard from "../components/UploadCard";
import { formatDateOnlyUS } from "../lib/format";
import AnalyticsPanel from "../components/AnalyticsPanel";

function formatMoneyUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function formatDateUS(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function DashboardPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selected, setSelected] = useState<ReportDetail | null>(null);

  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadReports() {
    setError(null);
    setLoadingReports(true);
    try {
      const data = await reportsApi.list();
      setReports(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  }

  async function openDetail(id: string) {
    setError(null);
    setLoadingDetail(true);
    try {
      const data = await reportsApi.getById(id);
      setSelected(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load report detail");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const hasReports = useMemo(() => reports.length > 0, [reports]);

  return (
    <div className="space-y-6">
      <ManualEntryCard onCreated={() => loadReports()} />
      <UploadCard onSubmitted={() => loadReports()} />

      {/* Header / actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-600">
            View submitted expense reports and open details.
          </p>
        </div>

        <button
          onClick={loadReports}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-6">
        <AnalyticsPanel reports={reports} />
      </div>

      {/* Reports table */}
      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <div className="text-sm font-medium text-gray-900">
            Submitted reports
          </div>
          <div className="text-xs text-gray-600">
            {loadingReports ? "Loading..." : `${reports.length} report(s)`}
          </div>
        </div>

        {loadingReports ? (
          <div className="p-4 text-sm text-gray-600">Loading reports...</div>
        ) : !hasReports ? (
          <div className="p-4 text-sm text-gray-600">
            No reports yet. Submit one from the Upload section (we’ll add it
            next).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateUS(r.created_at)}
                    </td>
                    <td className="px-4 py-3">{r.items_count}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatMoneyUSD(r.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(r.id)}
                        className="rounded-md border bg-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        View detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <div className="text-sm font-medium text-gray-900">Report detail</div>
          <div className="text-xs text-gray-600">
            {selected
              ? `ID: ${selected.id}`
              : "Select a report to view its expenses"}
          </div>
        </div>

        {loadingDetail ? (
          <div className="p-4 text-sm text-gray-600">Loading detail...</div>
        ) : !selected ? (
          <div className="p-4 text-sm text-gray-600">No report selected.</div>
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                Created:{" "}
                <span className="font-medium">
                  {formatDateUS(selected.created_at)}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                Total:{" "}
                <span className="font-semibold">
                  {formatMoneyUSD(selected.total_amount)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selected.expenses.map((e, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDateOnlyUS(e.date)}
                      </td>
                      <td className="px-3 py-2">{e.department}</td>
                      <td className="px-3 py-2">{e.category}</td>
                      <td className="px-3 py-2">{e.description}</td>
                      <td className="px-3 py-2 text-right">
                        {formatMoneyUSD(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-gray-500">
              Dates are displayed in US format; amounts in USD.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
