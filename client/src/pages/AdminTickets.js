import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Ticket as TicketIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User2,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function AdminTickets() {
  const navigate = useNavigate();

  // UI states
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [priority, setPriority] = useState("All Priority");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 8;

  // data
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);

  // network
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // debounce search
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status, priority]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const fromCount = useMemo(() => {
    if (total === 0) return 0;
    return (page - 1) * limit + 1;
  }, [page, limit, total]);

  const toCount = useMemo(() => {
    return Math.min(page * limit, total);
  }, [page, limit, total]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit,
      };

      // search
      if (debouncedQuery.trim()) {
        params.search = debouncedQuery.trim();
      }

      // status filter
      if (status !== "All Status") {
        params.status = status.toLowerCase().replace(" ", "-");
      }

      // priority filter
      if (priority !== "All Priority") {
        params.priority = priority.toLowerCase();
      }

      const res = await api.get("/tickets", { params });

      const data = res.data;
      const list = data?.tickets || data?.data || [];
      const totalCount = data?.total ?? data?.count ?? 0;

      setTickets(list);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Failed to load tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, status, priority]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <TicketIcon size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                Tickets
              </h1>
              <div className="mt-1 h-[3px] w-20 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/70 mt-3 max-w-[560px] text-[15px] leading-relaxed">
            Manage and track all service tickets with filters, assignments, and
            status visibility in one place.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 h-11 rounded-2xl bg-black/30 border border-white/10 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <span className="text-white/60 text-sm">Total</span>
          <span className="font-semibold">{total}</span>
          <span className="text-white/60 text-sm">Tickets</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-[1.3fr_0.6fr_0.6fr] gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_55%)] opacity-55" />
        </div>

        <PillSelect
          value={status}
          onChange={setStatus}
          options={["All Status", "Open", "In Progress", "Resolved", "Closed"]}
          icon={Filter}
        />

        <PillSelect
          value={priority}
          onChange={setPriority}
          options={["All Priority", "High", "Medium", "Low"]}
          icon={ChevronDown}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table Block */}
      <div className="mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(120,170,255,0.14)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

          <div className="relative z-10 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white text-lg font-semibold">All Tickets</h2>
                <p className="text-white/60 text-sm">
                  Filter, search, and track the latest requests.
                </p>
              </div>
            </div>

            {/* Loading */}
            {loading && <TicketsSkeleton />}

            {/* Empty */}
            {!loading && tickets.length === 0 && (
              <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
                <div className="text-white text-lg font-semibold">
                  No tickets found
                </div>
                <div className="text-white/60 text-sm mt-2">
                  Try changing filters or search keywords.
                </div>
              </div>
            )}

            {/* Table */}
            {!loading && tickets.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead>
                      <tr className="text-white/60 text-sm">
                        <TH>S.No.</TH>
                        <TH>Id</TH>
                        <TH>Title</TH>
                        <TH>Customer</TH>
                        <TH>Status</TH>
                        <TH>Priority</TH>
                        <TH>Assigned To</TH>
                        <TH>Created</TH>
                      </tr>
                    </thead>

                    <tbody className="text-white/90 text-sm">
                      {tickets.map((t,idx) => (
                        <tr
                          key={t._id || t.id}
                          onClick={() =>
                            navigate(`/admin/tickets/${t._id || t.id}`)
                          }
                          className="border-t border-white/10 hover:bg-white/[0.04] transition cursor-pointer"
                        > <TD className="text-white/55 font-semibold">{idx + 1}</TD>

                          <TD className="font-semibold text-white/85">
                            {t.ticketId || t.id || "—"}
                          </TD>

                          <TD className="font-semibold">{t.title || "—"}</TD>

                          <TD>
                            <div className="flex items-center gap-2 text-white/85">
                              <Building2 size={15} className="text-white/55" />
                              {t.customerName ||
                                t.customer?.name ||
                                t.user?.name ||
                                "—"}
                            </div>
                          </TD>

                          <TD>
                            <StatusChip value={formatStatus(t.status)} />
                          </TD>

                          <TD>
                            <PriorityChip value={formatPriority(t.priority)} />
                          </TD>

                          <TD>
                            <div className="flex items-center gap-2 text-white/85">
                              <User2 size={15} className="text-white/55" />
                              {t.assignedEngineerName ||
                                t.assignedTo?.name ||
                                "Unassigned"}
                            </div>
                          </TD>

                          <TD>
                            <div className="flex items-center gap-2 text-white/70">
                              <Calendar size={15} className="text-white/45" />
                              {formatDate(t.createdAt)}
                            </div>
                          </TD>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="text-white/60 text-sm">
                    Showing{" "}
                    <span className="text-white/85">{fromCount}</span> –{" "}
                    <span className="text-white/85">{toCount}</span> of{" "}
                    <span className="text-white/85">{total}</span> tickets
                  </div>

                  <div className="flex items-center gap-2">
                    <PagerBtn
                      icon={ChevronLeft}
                      label="Prev"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />

                    <div className="px-4 h-10 rounded-xl bg-white/10 border border-white/10 text-white text-sm flex items-center justify-center">
                      Page <span className="ml-2 font-semibold">{page}</span>
                      <span className="mx-2 text-white/40">/</span>
                      <span className="text-white/85">{totalPages}</span>
                    </div>

                    <PagerBtn
                      icon={ChevronRight}
                      label="Next"
                      disabled={page >= totalPages || loading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------ Helpers ------------------------ */

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

function formatStatus(status) {
  if (!status) return "Open";
  const s = String(status).toLowerCase();
  if (s === "in-progress" || s === "in progress") return "In Progress";
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

/* ------------------------ Small UI Parts ------------------------ */

function TH({ children }) {
  return (
    <th className="text-left py-3 px-4 font-semibold tracking-wide">
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return <td className={`py-4 px-4 ${className}`}>{children}</td>;
}

function PagerBtn({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-10 px-4 rounded-xl border text-white text-sm flex items-center gap-2 transition shadow-[0_10px_24px_rgba(0,0,0,0.35)]
      ${
        disabled
          ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
          : "bg-white/10 hover:bg-white/15 border-white/10"
      }`}
    >
      <Icon size={16} className="text-white/85" />
      {label}
    </button>
  );
}

function PillSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 pr-10 rounded-xl bg-black/55 border border-white/10 text-white outline-none focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] appearance-none cursor-pointer"
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
      : "bg-[linear-gradient(270deg,#fecaca_0%,#ef4444_50%,#7f1d1d_100%)]";

  return (
    <span
      className={`relative inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-semibold shadow-[0_10px_20px_rgba(0,0,0,0.35)] ${styles}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)] opacity-70" />
      <span className="relative">{value}</span>
    </span>
  );
}

function PriorityChip({ value }) {
  const styles =
    value === "High"
      ? "bg-orange-500/20 border-orange-400/30 text-orange-200"
      : value === "Medium"
      ? "bg-blue-500/20 border-blue-400/30 text-blue-200"
      : "bg-green-500/20 border-green-400/30 text-green-200";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      {value}
    </span>
  );
}

/* ------------------------ Loading Skeleton ------------------------ */

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-full rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
