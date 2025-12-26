import { useEffect, useMemo, useState } from "react";
import type { ReportSummary, ReportDetail } from "../types";
import { reportsApi } from "../lib/reports.api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Props = {
  reports: ReportSummary[];
};

type KV = { name: string; value: number };

function formatMoneyUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function AnalyticsPanel({ reports }: Props) {
  const [details, setDetails] = useState<ReportDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trae detalles para poder calcular category/department
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!reports.length) {
        setDetails([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await Promise.all(
          reports.map((r) => reportsApi.getById(r.id))
        );
        if (!cancelled) setDetails(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load analytics data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reports]);

  const totalsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const rep of details) {
      for (const e of rep.expenses) {
        const key = e.category || "—";
        map.set(key, (map.get(key) ?? 0) + (e.amount ?? 0));
      }
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [details]);

  const totalsByDepartment = useMemo(() => {
    const map = new Map<string, number>();
    for (const rep of details) {
      for (const e of rep.expenses) {
        const key = e.department || "—";
        map.set(key, (map.get(key) ?? 0) + (e.amount ?? 0));
      }
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [details]);

  const grandTotal = useMemo(() => {
    return totalsByDepartment.reduce((acc, x) => acc + x.value, 0);
  }, [totalsByDepartment]);

  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <div className="text-sm font-medium text-gray-900">Analytics</div>
        <div className="text-xs text-gray-600">
          Visual summary across submitted reports.
          {grandTotal > 0 ? ` Total: ${formatMoneyUSD(grandTotal)}` : ""}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <div className="text-sm text-gray-600">Loading analytics...</div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && details.length === 0 && (
          <div className="text-sm text-gray-600">
            No data yet. Submit some reports first.
          </div>
        )}

        {!loading && !error && details.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie: total por category */}
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium text-gray-900">
                Total expenses by Category
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalsByCategory as KV[]}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label={(d) => d.name}
                    >
                      {totalsByCategory.map((_, idx) => (
                        <Cell key={idx} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => formatMoneyUSD(Number(v))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar: total por department */}
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-sm font-medium text-gray-900">
                Total expenses by Department
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalsByDepartment as KV[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(v: any) => formatMoneyUSD(Number(v))}
                    />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
