import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  LayoutDashboard,
  Ticket,
  Clock,
  BadgeCheck,
  ArrowRight,
  RefreshCcw,
  AlertCircle,
  FileText,
  Wrench,
  Calendar,
  Activity,
  User2,
} from "lucide-react";

export default function EngineerDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Service log center
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchAssignedTickets = async (opts = { silent: false }) => {
    const silent = opts?.silent ?? false;

    try {
      if (!silent) setLoadingTickets(true);
      if (silent) setRefreshing(true);

      setError("");

      const res = await api.get("/tickets", {
        params: { page: 1, limit: 8 },
      });

      const list = res.data?.tickets || res.data?.data || res.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("ENGINEER DASHBOARD TICKETS ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load assigned tickets."
      );
      setTickets([]);
    } finally {
      setLoadingTickets(false);
      setRefreshing(false);
    }
  };

  // Fetch recent logs by reading logs per ticket (safe fallback, no backend change)
  const fetchRecentLogs = async (ticketList) => {
    try {
      setLoadingLogs(true);

      // only pull logs for a few tickets to keep it fast
      const targets = (ticketList || []).slice(0, 4);

      const results = await Promise.allSettled(
        targets.map(async (t) => {
          const res = await api.get(`/service-logs/${t._id}`);
          const list = res.data?.logs || res.data?.data || res.data || [];
          return {
            ticketId: t._id,
            ticketTitle: t?.title || "Untitled Ticket",
            logs: Array.isArray(list) ? list : [],
          };
        })
      );

      const merged = results
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => {
          const data = r.value;
          return (data.logs || []).map((log) => ({
            ...log,
            __ticketId: data.ticketId,
            __ticketTitle: data.ticketTitle,
          }));
        })
        .sort((a, b) => {
          const da = new Date(a?.createdAt || 0).getTime();
          const db = new Date(b?.createdAt || 0).getTime();
          return db - da;
        })
        .slice(0, 6);

      setLogs(merged);
    } catch (err) {
      console.error("ENGINEER DASHBOARD LOGS ERROR:", err);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) fetchRecentLogs(tickets);
    else setLogs([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  const stats = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((t) => normalizeStatus(t?.status) === "open")
      .length;

    const inProgress = tickets.filter(
      (t) => normalizeStatus(t?.status) === "in-progress"
    ).length;

    const resolved = tickets.filter(
      (t) => normalizeStatus(t?.status) === "resolved"
    ).length;

    return { total, open, inProgress, resolved };
  }, [tickets]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <LayoutDashboard size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                Engineer Dashboard
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[820px] text-[15px] leading-relaxed">
            Your active work queue. Open tickets, update status, and create
            service logs for full service traceability.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/engineer/tickets")}
            className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
            shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
          >
            <Ticket size={16} />
            Work Queue
          </button>

          <button
            onClick={() => fetchAssignedTickets({ silent: true })}
            className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
            transition hover:opacity-[0.92]
            bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
            inline-flex items-center gap-2"
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-[1px]" />
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPI
          icon={Ticket}
          title="Assigned"
          value={loadingTickets ? "..." : String(stats.total)}
          tone="green"
        />
        <KPI
          icon={Clock}
          title="Open / In Progress"
          value={loadingTickets ? "..." : String(stats.open + stats.inProgress)}
          tone="orange"
        />
        <KPI
          icon={BadgeCheck}
          title="Resolved"
          value={loadingTickets ? "..." : String(stats.resolved)}
          tone="blue"
        />
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.85fr_0.65fr] gap-9">
        {/* Work Queue Preview */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white text-lg font-semibold">Work Queue</h2>
                <p className="text-white/60 text-sm">
                  Open ticket to update status and add logs
                </p>
              </div>

              <button
                onClick={() => navigate("/engineer/tickets")}
                className="text-emerald-300 text-sm hover:text-emerald-200 transition inline-flex items-center gap-1"
              >
                View all <ArrowRight size={16} />
              </button>
            </div>

            {loadingTickets && <RecentSkeleton />}

            {!loadingTickets && tickets.length === 0 && (
              <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
                <div className="text-white text-lg font-semibold">
                  No assigned tickets
                </div>
                <div className="text-white/60 text-sm mt-2">
                  Tickets assigned to you will appear here automatically.
                </div>
              </div>
            )}

            {!loadingTickets && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <TicketRow
                    key={t._id}
                    ticket={t}
                    onOpen={() => navigate(`/engineer/tickets/${t._id}`)}
                    onLogs={() => navigate(`/engineer/service-logs/${t._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ Service Log Center (Attractive + Productive) */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)] h-fit">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

          <div className="relative z-10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <FileText size={18} className="text-white/85" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white text-lg font-semibold">
                  Service Log Center
                </h2>
                <p className="text-white/60 text-sm">
                  Latest updates across your tickets
                </p>
              </div>
            </div>

            <div className="mt-4">
              {loadingLogs ? (
                <LogsMiniSkeleton />
              ) : logs.length === 0 ? (
                <div className="rounded-2xl bg-black/30 border border-white/10 px-5 py-5 text-center">
                  <div className="text-white/90 font-semibold">
                    No recent logs
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    Logs will appear after you start adding service updates.
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <MiniLogRow
                      key={log._id}
                      log={log}
                      onOpenTicket={() =>
                        navigate(`/engineer/tickets/${log.__ticketId}`)
                      }
                      onOpenLogs={() =>
                        navigate(`/engineer/service-logs/${log.__ticketId}`)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/engineer/tickets")}
              className="mt-4 w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
              shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center justify-center gap-2"
            >
              <Wrench size={16} />
              Manage Service Logs
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function KPI({ icon: Icon, title, value, tone }) {
  const theme =
    tone === "blue"
      ? {
          bg: "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]",
          rightGlow:
            "bg-[radial-gradient(220px_140px_at_80%_50%,rgba(255,255,255,0.14),transparent_72%)]",
        }
      : tone === "orange"
      ? {
          bg: "bg-[linear-gradient(270deg,#fbbf24_0%,#ea580c_52%,#7c2d12_100%)]",
          rightGlow:
            "bg-[radial-gradient(220px_140px_at_78%_52%,rgba(255,255,255,0.14),transparent_72%)]",
        }
      : {
          bg: "bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]",
          rightGlow:
            "bg-[radial-gradient(220px_140px_at_80%_52%,rgba(255,255,255,0.12),transparent_74%)]",
        };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white ${theme.bg}
      ring-1 ring-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.55)]`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_-18px_30px_rgba(0,0,0,0.35)]" />
      <div className={`pointer-events-none absolute inset-0 ${theme.rightGlow}`} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.22)_0%,transparent_55%)] opacity-60" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/15 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.20)]">
            <Icon size={20} strokeWidth={2.2} className="text-white/95" />
          </div>

          <span className="text-[15px] font-semibold tracking-wide text-white/95">
            {title}
          </span>
        </div>

        <div className="text-[44px] leading-none font-extrabold tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
}

function TicketRow({ ticket, onOpen, onLogs }) {
  return (
    <div
      className="w-full rounded-2xl bg-black/35 border border-white/10 px-5 py-4 hover:bg-white/[0.05] transition
      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <button onClick={onOpen} className="min-w-0 text-left flex-1">
          <div className="text-white/90 font-semibold truncate">
            {ticket.title || "Untitled Ticket"}
          </div>

          <div className="mt-1 text-white/55 text-xs flex items-center gap-2">
            <Calendar size={14} className="text-white/35" />
            {formatDate(ticket.createdAt)}
            <span className="text-white/25">•</span>
            <span className="text-white/55">
              Priority: {formatPriority(ticket.priority)}
            </span>
            <span className="text-white/25">•</span>
            <span className="text-white/40">
              ID: {ticket.ticketId || ticket._id?.slice(-6) || "—"}
            </span>
          </div>

          <div className="mt-2 text-white/60 text-sm line-clamp-2">
            {ticket.description || "No description provided."}
          </div>
        </button>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <StatusChip value={formatStatus(ticket.status)} />
          <button
            onClick={onLogs}
            className="h-9 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs
            shadow-[0_10px_20px_rgba(0,0,0,0.32)] transition inline-flex items-center gap-2"
          >
            <FileText size={14} />
            Logs
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniLogRow({ log, onOpenTicket, onOpenLogs }) {
  const note =
    log?.note ||
    log?.workDone ||
    log?.description ||
    log?.message ||
    "Service update added.";

  const who =
    log?.engineerName ||
    log?.createdBy?.name ||
    log?.createdBy?.email ||
    "Engineer";

  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          <Activity size={16} className="text-white/75" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-white/80 text-xs mb-1 truncate">
            {log?.__ticketTitle || "Ticket"}
          </div>

          <div className="text-white/85 text-sm leading-relaxed line-clamp-2">
            {note}
          </div>

          <div className="mt-2 flex items-center gap-2 text-white/45 text-xs">
            <User2 size={14} className="text-white/35" />
            {who}
            <span className="text-white/25">•</span>
            <span>{formatDateTime(log?.createdAt)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onOpenTicket}
              className="h-8 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs transition"
            >
              Open Ticket
            </button>
            <button
              onClick={onOpenLogs}
              className="h-8 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs transition"
            >
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusChip({ value }) {
  const styles =
    value === "Open"
      ? "bg-[linear-gradient(270deg,#fbbf24_0%,#ea580c_52%,#7c2d12_100%)]"
      : value === "In Progress"
      ? "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]"
      : value === "Resolved"
      ? "bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]"
      : "bg-[linear-gradient(270deg,#cbd5e1_0%,#475569_55%,#0f172a_100%)]";

  return (
    <span
      className={`relative inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold shadow-[0_10px_20px_rgba(0,0,0,0.35)] ${styles}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)] opacity-70" />
      <span className="relative">{value}</span>
    </span>
  );
}

function RecentSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[92px] w-full rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function LogsMiniSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[92px] w-full rounded-2xl bg-white/5 animate-pulse"
        />
      ))}
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function normalizeStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "in progress") return "in-progress";
  return s || "open";
}

function formatStatus(status) {
  const s = normalizeStatus(status);
  if (s === "in-progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  if (s === "closed") return "Closed";
  return "Open";
}

function formatPriority(priority) {
  if (!priority) return "Medium";
  const p = String(priority).toLowerCase();
  if (p === "high") return "High";
  if (p === "low") return "Low";
  return "Medium";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}
