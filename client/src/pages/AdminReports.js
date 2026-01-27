import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Ticket,
  ShieldCheck,
  Users,
  Activity,
  PieChart,
  Wrench,
  Timer,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import api from "../utils/api";

export default function AdminReports() {
  const [tickets, setTickets] = useState([]);
  const [amcs, setAmcs] = useState([]);
  const [engineerReport, setEngineerReport] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketsRes, amcRes, engineerRes] = await Promise.all([
        api.get("/tickets", { params: { page: 1, limit: 300 } }),
        api.get("/amc", { params: { page: 1, limit: 300 } }),
        api.get("/reports/engineer-workload"), 
      ]);

      const ticketList = ticketsRes.data?.tickets || ticketsRes.data?.data || [];
      const amcList = amcRes.data?.amcs || [];

      setTickets(Array.isArray(ticketList) ? ticketList : []);
      setEngineerReport(Array.isArray(engineerRes.data) ? engineerRes.data : []);

      setAmcs(Array.isArray(amcList) ? amcList : []);
    } catch (err) {
      console.error("REPORTS ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load reports");
      setTickets([]);
      setAmcs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  /* ---------------- Tickets Metrics ---------------- */

  const ticketMetrics = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((t) => String(t.status).toLowerCase() === "open").length;
    const inProgress = tickets.filter(
      (t) => String(t.status).toLowerCase() === "in-progress"
    ).length;
    const resolved = tickets.filter(
      (t) => String(t.status).toLowerCase() === "resolved"
    ).length;
    const closed = tickets.filter((t) => String(t.status).toLowerCase() === "closed").length;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      pending: open + inProgress,
    };
  }, [tickets]);

  const ticketStatusDist = useMemo(() => {
    const total = ticketMetrics.total || 1;
    return [
      { label: "Open", value: ticketMetrics.open, pct: Math.round((ticketMetrics.open / total) * 100) },
      {
        label: "In Progress",
        value: ticketMetrics.inProgress,
        pct: Math.round((ticketMetrics.inProgress / total) * 100),
      },
      { label: "Resolved", value: ticketMetrics.resolved, pct: Math.round((ticketMetrics.resolved / total) * 100) },
      { label: "Closed", value: ticketMetrics.closed, pct: Math.round((ticketMetrics.closed / total) * 100) },
    ];
  }, [ticketMetrics]);

  const engineerWorkload = useMemo(() => {
    const map = new Map();

    tickets.forEach((t) => {
      const assigned =
        typeof t.assignedTo === "object"
          ? t.assignedTo?.name || t.assignedTo?.email || t.assignedTo?._id
          : t.assignedTo;

      const key = assigned || "Unassigned";
      map.set(key, (map.get(key) || 0) + 1);
    });

    const arr = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 7);
  }, [tickets]);

  const resolutionPerformance = useMemo(() => {
    const done = tickets.filter((t) =>
      ["resolved", "closed"].includes(String(t.status).toLowerCase())
    );

    if (done.length === 0) return { avgDays: null, totalDone: 0 };

    let totalDays = 0;
    let valid = 0;

    done.forEach((t) => {
      const created = new Date(t.createdAt || 0).getTime();
      const updated = new Date(t.updatedAt || t.createdAt || 0).getTime();
      if (!created || !updated) return;

      const days = Math.max(0, (updated - created) / (1000 * 60 * 60 * 24));
      totalDays += days;
      valid += 1;
    });

    return {
      avgDays: valid ? totalDays / valid : null,
      totalDone: done.length,
    };
  }, [tickets]);

  /* ---------------- AMC Metrics ---------------- */

  const amcMetrics = useMemo(() => {
    const total = amcs.length;
    const active = amcs.filter((a) => String(a.status).toLowerCase() === "active").length;
    const expired = amcs.filter((a) => String(a.status).toLowerCase() === "expired").length;
    const suspended = amcs.filter(
      (a) => String(a.status).toLowerCase() === "suspended"
    ).length;

    return { total, active, expired, suspended };
  }, [amcs]);

  const amcExpiryStats = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();

    const in7 = nowTime + 7 * 24 * 60 * 60 * 1000;
    const in30 = nowTime + 30 * 24 * 60 * 60 * 1000;

    const expiring7 = amcs.filter((a) => {
      const end = new Date(a.endDate || 0).getTime();
      return end && end >= nowTime && end <= in7;
    }).length;

    const expiring30 = amcs.filter((a) => {
      const end = new Date(a.endDate || 0).getTime();
      return end && end >= nowTime && end <= in30;
    }).length;

    return { expiring7, expiring30 };
  }, [amcs]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <BarChart3 size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[34px] leading-[1.05] font-extrabold tracking-tight">
                System Reports
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#c084fc_0%,#7c3aed_55%,#3b0764_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 text-[15px]">
            High-level insights across tickets, AMCs, engineers, and workload.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
          shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          icon={Ticket}
          title="Total Tickets"
          value={loading ? "—" : String(ticketMetrics.total)}
          gradient="from-sky-400 via-blue-600 to-indigo-900"
        />

        <KpiCard
          icon={Activity}
          title="Open / In Progress"
          value={loading ? "—" : String(ticketMetrics.pending)}
          gradient="from-amber-400 via-orange-500 to-amber-900"
        />

        <KpiCard
          icon={ShieldCheck}
          title="Active AMCs"
          value={loading ? "—" : String(amcMetrics.active)}
          gradient="from-emerald-400 via-green-600 to-emerald-900"
        />

        <KpiCard
  icon={Users}
  title="Engineers"
  value={loading ? "—" : String(engineerReport.length)}
  gradient="from-fuchsia-400 via-purple-600 to-fuchsia-900"
/>

      </div>

      {/* Analytics Panels */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GlassPanel
          title="Ticket Status Distribution"
          description="Breakdown of tickets by workflow stage."
          icon={PieChart}
        >
          {loading ? (
            <PanelSkeleton />
          ) : ticketMetrics.total === 0 ? (
            <EmptyPanel text="No tickets found to generate distribution." />
          ) : (
            <div className="space-y-3 mt-5">
              {ticketStatusDist.map((s) => (
                <StatusRow key={s.label} label={s.label} value={s.value} pct={s.pct} />
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel
          title="Engineer Workload"
          description="Ticket assignment load per engineer (based on assignedTo)."
          icon={Wrench}
        >
          {loading ? (
  <PanelSkeleton />
) : engineerReport.length === 0 ? (
  <EmptyPanel text="No engineer workload data found." />
) : (
  <div className="space-y-3 mt-5">

    {engineerReport.map((e) => (
      <div
        key={e.engineerId}
        className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 flex items-center justify-between"
      >
        <div className="text-white/80 text-sm truncate max-w-[70%]">
          {e.name}
        </div>
        <div className="text-white font-semibold">{e.total}</div>
      </div>
    ))}
  </div>
)}

        </GlassPanel>

        <GlassPanel
          title="AMC Expiry Overview"
          description="Upcoming AMC expirations and risk exposure."
          icon={AlertTriangle}
        >
          {loading ? (
            <PanelSkeleton />
          ) : amcMetrics.total === 0 ? (
            <EmptyPanel text="No AMC records found yet." />
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-4">
                <div className="text-white/70 text-sm">Total AMCs</div>
                <div className="text-white text-3xl font-extrabold mt-2">
                  {amcMetrics.total}
                </div>
                <div className="text-white/45 text-xs mt-2">
                  Active: {amcMetrics.active} • Expired: {amcMetrics.expired} • Suspended: {amcMetrics.suspended}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-4">
                  <div className="text-white/60 text-sm">Expiring in 7 Days</div>
                  <div className="text-white text-2xl font-extrabold mt-2">
                    {amcExpiryStats.expiring7}
                  </div>
                </div>

                <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-4">
                  <div className="text-white/60 text-sm">Expiring in 30 Days</div>
                  <div className="text-white text-2xl font-extrabold mt-2">
                    {amcExpiryStats.expiring30}
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>

        <GlassPanel
          title="Resolution Performance"
          description="Average resolution time and closure trends."
          icon={Timer}
        >
          {loading ? (
            <PanelSkeleton />
          ) : resolutionPerformance.totalDone === 0 ? (
            <EmptyPanel text="No resolved/closed tickets found to calculate performance." />
          ) : (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-4">
                <div className="text-white/60 text-sm">Average Resolution Time</div>
                <div className="text-white text-3xl font-extrabold mt-2">
                  {resolutionPerformance.avgDays === null
                    ? "—"
                    : `${resolutionPerformance.avgDays.toFixed(1)} days`}
                </div>
                <div className="text-white/40 text-xs mt-1">
                  Created → Updated timestamp for resolved/closed tickets.
                </div>
              </div>

              <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="text-white/70 text-sm">Resolved/Closed Count</div>
                <div className="text-white font-semibold">{resolutionPerformance.totalDone}</div>
              </div>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

/* -------------------- UI Components -------------------- */

function KpiCard({ icon: Icon, title, value, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(140,140,255,0.15)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16),transparent_55%)] opacity-70" />

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.45)]`}
          >
            <Icon size={20} className="text-white" />
          </div>

          <div>
            <div className="text-white/60 text-sm">{title}</div>
            <div className="text-white text-2xl font-extrabold tracking-tight">
              {value}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassPanel({ title, description, icon: Icon, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_55px_rgba(160,120,255,0.14)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_58%)] opacity-80" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white font-semibold text-lg">
          {Icon && <Icon size={18} className="text-white/80" />}
          {title}
        </div>
        <div className="text-white/60 text-sm mt-1">{description}</div>

        <div>{children}</div>
      </div>
    </div>
  );
}

function EmptyPanel({ text }) {
  return (
    <div className="mt-6 rounded-xl bg-black/30 border border-white/10 p-6 text-center">
      <div className="text-white/80 text-sm">{text}</div>
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="mt-6 rounded-xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function StatusRow({ label, value, pct }) {
  const theme =
    label === "Open"
      ? "from-amber-300/90 to-orange-600/90"
      : label === "In Progress"
      ? "from-sky-300/90 to-blue-700/90"
      : label === "Resolved"
      ? "from-emerald-300/90 to-emerald-700/90"
      : "from-rose-300/90 to-red-700/90";

  return (
    <div className="rounded-xl bg-black/30 border border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="text-white/80 text-sm font-semibold">{label}</div>
        <div className="text-white/70 text-sm">
          {value} <span className="text-white/40">({pct}%)</span>
        </div>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${theme}`}
          style={{ width: `${Math.max(3, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
