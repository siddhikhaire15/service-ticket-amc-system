import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  LayoutDashboard,
  Ticket,
  Clock,
  BadgeCheck,
  Plus,
  Calendar,
  ArrowRight,
  AlertCircle,
  Info,
  Target,
} from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoadingTickets(true);
        setError("");

        const res = await api.get("/tickets", {
          params: { page: 1, limit: 6 },
        });

        const list = res.data?.tickets || res.data?.data || [];
        setTickets(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("USER DASHBOARD TICKETS ERROR:", err);
        setError(err.message || "Failed to load dashboard data.");
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchMyTickets();
  }, []);

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

    const closed = tickets.filter((t) => normalizeStatus(t?.status) === "closed")
      .length;

    const resolutionRate =
      total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

    return { total, open, inProgress, resolved, closed, resolutionRate };
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
                User Overview
              </h1>
              <div className="mt-1 h-[3px] w-20 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[760px] text-[15px] leading-relaxed">
            Track your service requests, monitor progress, and review recent
            updates.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/user/tickets")}
            className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
            shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
          >
            <Ticket size={16} />
            My Tickets
          </button>

          <button
            onClick={() => navigate("/user/tickets")}
            className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
            transition hover:opacity-[0.92]
            bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
            inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create Ticket
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPI
          icon={Ticket}
          title="Total Tickets"
          value={loadingTickets ? "..." : String(stats.total)}
          tone="blue"
        />

        <KPI
          icon={Clock}
          title="Open / In Progress"
          value={
            loadingTickets
              ? "..."
              : String(stats.open + stats.inProgress)
          }
          tone="orange"
        />

        <KPI
          icon={BadgeCheck}
          title="Resolved"
          value={loadingTickets ? "..." : String(stats.resolved)}
          tone="green"
        />

        <ResolutionRing
          percent={loadingTickets ? null : stats.resolutionRate}
          resolved={stats.resolved + stats.closed}
          total={stats.total}
        />
      </div>

      {/* Bottom Section */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.85fr_0.65fr] gap-9">
        {/* Recent Tickets */}
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white text-lg font-semibold">
                  Recent Tickets
                </h2>
                <p className="text-white/60 text-sm">
                  Tap any ticket to view details & logs
                </p>
              </div>

              <button
                onClick={() => navigate("/user/tickets")}
                className="text-blue-400 text-sm hover:text-blue-300 transition inline-flex items-center gap-1"
              >
                View all <ArrowRight size={16} />
              </button>
            </div>

            {loadingTickets && <RecentSkeleton />}

            {!loadingTickets && tickets.length === 0 && (
              <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
                <div className="text-white text-lg font-semibold">
                  No tickets yet
                </div>
                <div className="text-white/60 text-sm mt-2">
                  Create your first service ticket to get started.
                </div>

                <button
                  onClick={() => navigate("/user/tickets")}
                  className="mt-6 h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
                  transition hover:opacity-[0.92]
                  bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
                  inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Ticket
                </button>
              </div>
            )}

            {!loadingTickets && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <RecentTicketRow
                    key={t._id}
                    ticket={t}
                    onOpen={() => navigate(`/user/tickets/${t._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips Panel */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]
          h-fit"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

          <div className="relative z-10 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Info size={18} className="text-white/80" />
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">
                  Support Tips
                </h2>
                <p className="text-white/60 text-sm">
                  Small things that help resolve your ticket faster
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              <MiniTip
                title="Add clear details"
                desc="Mention model, symptoms, and what you already tried."
              />
              <MiniTip
                title="Use correct priority"
                desc="High priority for critical downtime issues."
              />
              <MiniTip
                title="Track engineer logs"
                desc="Logs appear once the ticket is in progress."
              />
            </div>

            <button
              onClick={() => navigate("/user/tickets")}
              className="mt-4 w-full h-11 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
              shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center justify-center gap-2"
            >
              Open Tickets <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- KPI Components ---------------- */

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

/**
 * ✅ Circular Resolution Rate KPI
 * Uses SVG ring (no extra libraries).
 */
function ResolutionRing({ percent, resolved, total }) {
  const p = typeof percent === "number" ? clamp(percent, 0, 100) : null;

  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = p === null ? circumference : circumference * (1 - p / 100);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10
      shadow-[0_25px_70px_rgba(0,0,0,0.55)] p-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <Target size={18} className="text-white/85" />
            </div>
            <div className="text-white/90 font-semibold text-[15px]">
              Resolution Rate
            </div>
          </div>

          <div className="mt-2 text-white/55 text-sm">
            {p === null ? "Calculating..." : `${resolved} resolved out of ${total}`}
          </div>
        </div>

        <div className="relative w-[112px] h-[112px] shrink-0">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(125,211,252,0.95)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-white font-extrabold text-[28px] leading-none">
              {p === null ? "—" : `${p}%`}
            </div>
            <div className="mt-1 text-white/45 text-[11px]">complete</div>
          </div>

          {/* glow */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.18),transparent_62%)]" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function MiniTip({ title, desc }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="text-white/90 font-semibold">{title}</div>
      <div className="text-white/60 text-sm mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}

function RecentTicketRow({ ticket, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl bg-black/35 border border-white/10 px-5 py-4 hover:bg-white/[0.05] transition
      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
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
        </div>

        <StatusChip value={formatStatus(ticket.status)} />
      </div>
    </button>
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
          <div
            key={i}
            className="h-[92px] w-full rounded-2xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
