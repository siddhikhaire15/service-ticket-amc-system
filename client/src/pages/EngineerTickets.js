import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Ticket as TicketIcon,
  Search,
  ChevronDown,
  RefreshCcw,
  AlertCircle,
  Calendar,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function EngineerTickets() {
  const navigate = useNavigate();

  // filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  // data
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAssignedTickets = async (opts = { silent: false }) => {
    const silent = opts?.silent ?? false;

    try {
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);

      setError("");

      const params = { page: 1, limit: 50 };

      if (query.trim()) params.search = query.trim();

      if (status !== "All Status") {
        params.status = status.toLowerCase().replace(" ", "-");
      }

      // ✅ engineer gets assigned tickets
      const res = await api.get("/tickets", { params });

      const list = res.data?.tickets || res.data?.data || res.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("ENGINEER TICKETS ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load tickets."
      );
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchAssignedTickets(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const grouped = useMemo(() => {
    const list = Array.isArray(tickets) ? tickets : [];
    const open = list.filter((t) => normalizeStatus(t?.status) === "open");
    const inProgress = list.filter(
      (t) => normalizeStatus(t?.status) === "in-progress"
    );
    const resolved = list.filter((t) => normalizeStatus(t?.status) === "resolved");
    const closed = list.filter((t) => normalizeStatus(t?.status) === "closed");
    return { open, inProgress, resolved, closed };
  }, [tickets]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <TicketIcon size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                Work Queue
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[820px] text-[15px] leading-relaxed">
            Assigned tickets. Open a ticket to update status and create service logs.
          </p>
        </div>

        <button
          onClick={() => fetchAssignedTickets({ silent: true })}
          className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
          transition hover:opacity-[0.92]
          bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
          inline-flex items-center gap-2 w-fit"
          disabled={refreshing}
        >
          <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.3fr_0.55fr] gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assigned tickets..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
            focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_55%)] opacity-55" />
        </div>

        <PillSelect
          value={status}
          onChange={setStatus}
          options={["All Status", "Open", "In Progress", "Resolved", "Closed"]}
          icon={ChevronDown}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-[1px]" />
          {error}
        </div>
      )}

      {/* Queue Container */}
      <div className="mt-6 relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

        <div className="relative z-10 p-6">
          {loading && <TicketsSkeleton />}

          {!loading && tickets.length === 0 && (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
              <div className="text-white text-lg font-semibold">No tickets found</div>
              <div className="text-white/60 text-sm mt-2">
                Try changing filters.
              </div>
            </div>
          )}

          {!loading && tickets.length > 0 && (
            <div className="space-y-3">
              {/* ✅ High productivity: show In Progress first */}
              {grouped.inProgress.map((t) => (
                <EngineerTicketRow
                  key={t._id}
                  ticket={t}
                  onOpen={() => navigate(`/engineer/tickets/${t._id}`)}
                  onLogs={() => navigate(`/engineer/service-logs/${t._id}`)}
                />
              ))}

              {grouped.open.map((t) => (
                <EngineerTicketRow
                  key={t._id}
                  ticket={t}
                  onOpen={() => navigate(`/engineer/tickets/${t._id}`)}
                  onLogs={() => navigate(`/engineer/service-logs/${t._id}`)}
                />
              ))}

              {grouped.resolved.map((t) => (
                <EngineerTicketRow
                  key={t._id}
                  ticket={t}
                  onOpen={() => navigate(`/engineer/tickets/${t._id}`)}
                  onLogs={() => navigate(`/engineer/service-logs/${t._id}`)}
                />
              ))}

              {grouped.closed.map((t) => (
                <EngineerTicketRow
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
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function EngineerTicketRow({ ticket, onOpen, onLogs }) {
  return (
    <div
      className="w-full text-left rounded-2xl bg-black/35 border border-white/10 px-5 py-4 hover:bg-white/[0.05] transition
      shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
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
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PillSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 pr-10 rounded-xl bg-black/55 border border-white/10 text-white outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0b1220]">
            {o}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
        <Icon size={18} />
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_55%)] opacity-55" />
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

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
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
