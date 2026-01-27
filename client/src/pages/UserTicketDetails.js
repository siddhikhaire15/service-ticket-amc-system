import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

import {
  ArrowLeft,
  Ticket as TicketIcon,
  Calendar,
  AlignLeft,
  AlertCircle,
  ShieldCheck,
  ClipboardList,
  Activity,
  Sparkles,
  Dot,
} from "lucide-react";

export default function UserTicketDetails() {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  const [logsLoading, setLogsLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  const statusLabel = useMemo(
    () => formatStatus(ticket?.status),
    [ticket?.status]
  );

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/tickets/${ticketId}`);
        const t = res.data?.ticket || res.data;
        setTicket(t || null);
      } catch (err) {
        console.error("USER TICKET DETAILS ERROR:", err);
        setError(err.message || "Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLogsLoading(true);

        const res = await api.get(`/service-logs/${ticketId}`);
        const list = res.data?.logs || res.data?.data || res.data || [];
        setLogs(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("FETCH LOGS ERROR:", err);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    };

    if (ticketId) fetchLogs();
  }, [ticketId]);

  return (
    <div className="w-full">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -top-14 -right-16 h-64 w-64 rounded-full bg-orange-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/12 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div>
            <button
              onClick={() => navigate("/user/tickets")}
              className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
              shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="mt-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <TicketIcon size={22} className="text-white/90" />
              </div>

              <div>
                <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                  Ticket Details
                </h1>
                <div className="mt-1 h-[3px] w-28 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
              </div>
            </div>

            <p className="text-white/70 mt-3 max-w-[760px] text-[15px] leading-relaxed">
              Track your ticket progress. Engineers will add service logs as they
              work on it.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/60">
              <Sparkles size={14} className="text-orange-200/80" />
              Live status and logs update automatically.
            </div>
          </div>

          {!loading && ticket?.status && <StatusChip value={statusLabel} />}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-[1px]" />
          <div>{error}</div>
        </div>
      )}

      <div className="mt-7 grid grid-cols-1 xl:grid-cols-[1.12fr_0.88fr] gap-6">
        {/* Ticket Info */}
        <AccentPanel
          title="Ticket Summary"
          subtitle={`Ticket ID: ${ticketId}`}
          tone="cyan"
        >
          {loading ? (
            <TicketInfoSkeleton />
          ) : !ticket ? (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-8 text-center text-white/70">
              Ticket not found.
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow
                icon={<ClipboardList size={16} className="text-white/50" />}
                label="Title"
                value={ticket.title || "—"}
              />

              <InfoRow
                icon={<ShieldCheck size={16} className="text-white/50" />}
                label="Priority"
                value={capitalize(ticket.priority || "medium")}
                badge
              />

              <InfoRow
                icon={<Calendar size={16} className="text-white/50" />}
                label="Created At"
                value={formatDateTime(ticket.createdAt)}
              />
              
              
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
  <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
    <AlignLeft size={16} className="text-white/45" />
    Description
  </div>

  <div className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
    {ticket.description || "No description provided."}
  </div>
</div>
  {/* ✅ PREMIUM ATTACHMENT */}
  <AttachmentInfo attachmentUrl={ticket?.attachmentUrl} />





              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white/50 text-xs">
                Note: Customers can view logs only. Status updates are handled by
                engineers/admin.
              </div>
            </div>
          )}
        </AccentPanel>

        {/* Logs */}
        <AccentPanel
          title="Service Timeline"
          subtitle="Engineer actions & updates"
          tone="violet"
        >
          {logsLoading ? (
            <LogsSkeleton />
          ) : logs.length === 0 ? (
            <EmptyLogs />
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <TimelineItem key={log._id} log={log} />
              ))}
            </div>
          )}
        </AccentPanel>
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function AccentPanel({ title, subtitle, children, tone }) {
  const accent =
    tone === "cyan"
      ? "bg-[radial-gradient(760px_340px_at_18%_0%,rgba(34,211,238,0.20),transparent_60%)]"
      : "bg-[radial-gradient(760px_340px_at_18%_0%,rgba(139,92,246,0.18),transparent_60%)]";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
      <div className={`pointer-events-none absolute inset-0 ${accent}`} />
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_55px_rgba(120,170,255,0.14)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_58%)] opacity-80" />

      <div className="relative z-10 mb-5">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <p className="text-white/55 text-sm">{subtitle}</p>
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TimelineItem({ log }) {
  const note = log.workNote || "Service update added";

  const who = log.engineerId?.name || log.engineerId?.email || "Engineer";
  return (
    <div className="relative rounded-2xl bg-black/35 border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-1 w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
          <Activity size={16} className="text-white/75" />
        </div>

        <div className="min-w-0">
          <div className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap">
            {note}
          </div>

          <div className="mt-2 text-white/45 text-xs flex items-center gap-2">
            <span>{formatDateTime(log.createdAt)}</span>
            <Dot size={18} className="text-white/25" />
            <span className="text-white/55">
              Updated by <span className="text-white/80 font-semibold">{who}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyLogs() {
  return (
    <div className="rounded-2xl bg-black/35 border border-white/10 p-8 text-center">
      <div className="text-white font-semibold text-lg">No logs yet</div>
      <div className="text-white/60 text-sm mt-2">
        Logs will appear once the engineer starts working.
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MiniStep label="Engineer picks ticket" />
        <MiniStep label="Status updates" />
        <MiniStep label="Service logs added" />
      </div>
    </div>
  );
}

function MiniStep({ label }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-xs text-white/65">
      {label}
    </div>
  );
}

function InfoRow({ icon, label, value, badge }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/35 border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">
          <div className="text-white/55 text-xs">{label}</div>
          <div className="text-white/85 text-sm font-semibold truncate">
            {value}
          </div>
        </div>
      </div>

      {badge && (
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          {value}
        </span>
      )}
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

/* ---------------- Skeletons ---------------- */

function TicketInfoSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-2xl bg-white/5 animate-pulse" />
      ))}
      <div className="h-28 w-full rounded-2xl bg-white/5 animate-pulse" />
      <div className="h-10 w-full rounded-2xl bg-white/5 animate-pulse" />
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 w-full rounded-2xl bg-white/5 animate-pulse" />
      ))}
    </div>
  );
}

/* ---------------- Helpers ---------------- */

function formatStatus(status) {
  if (!status) return "Open";
  const s = String(status).toLowerCase();
  if (s === "in-progress" || s === "in progress") return "In Progress";
  if (s === "resolved") return "Resolved";
  if (s === "closed") return "Closed";
  return "Open";
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

function capitalize(str) {
  const s = String(str || "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function AttachmentInfo({ attachmentUrl }) {
  if (!attachmentUrl) return null;

  const fullUrl = `http://localhost:5000${attachmentUrl}`;

  return (
    <button
      onClick={() => window.open(fullUrl, "_blank")}
      className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10
                 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                 hover:bg-white/10 transition w-full"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10
                      flex items-center justify-center text-white/80">
        📎
      </div>

      <div className="text-left">
        <div className="text-white/55 text-xs">Attachment</div>
        <div className="text-white/90 text-sm font-semibold">
          View Attachment
        </div>
      </div>
    </button>
  );
}
