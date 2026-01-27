import { useEffect, useMemo, useState } from "react";
import {
  Ticket,
  ShieldCheck,
  Clock,
  FileText,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../pages/Dashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);

  const [amcs, setAmcs] = useState([]);
  const [loadingAmc, setLoadingAmc] = useState(false);

  // ✅ Fetch latest tickets (Admin)
  useEffect(() => {
    const fetchLatestTickets = async () => {
      try {
        setLoadingTickets(true);

        const res = await api.get("/tickets", {
          params: { page: 1, limit: 5 },
        });

        setTickets(res.data?.tickets || []);
        setTotalTickets(res.data?.total ?? 0);
      } catch (err) {
        console.error("DASHBOARD TICKETS ERROR:", err);
        setTickets([]);
        setTotalTickets(0);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchLatestTickets();
  }, []);

  // ✅ Fetch AMC list for dashboard KPI + renewals
  useEffect(() => {
    const fetchAmc = async () => {
      try {
        setLoadingAmc(true);

        const res = await api.get("/amc", {
          params: { page: 1, limit: 200 },
        });

        setAmcs(res.data?.amcs || []);
      } catch (err) {
        console.error("DASHBOARD AMC ERROR:", err);
        setAmcs([]);
      } finally {
        setLoadingAmc(false);
      }
    };

    fetchAmc();
  }, []);

  // ✅ Pending = OPEN tickets
  const pendingRequests = useMemo(() => {
    return tickets.filter((t) => String(t.status).toLowerCase() === "open").length;
  }, [tickets]);

  // ✅ Active AMC count
  const activeAmcCount = useMemo(() => {
    return amcs.filter((a) => String(a.status).toLowerCase() === "active").length;
  }, [amcs]);

  // ✅ Upcoming AMC renewals (endDate near)
  const upcomingRenewals = useMemo(() => {
    const now = new Date().getTime();

    const list = amcs
      .filter((a) => {
        const end = new Date(a.endDate || 0).getTime();
        return end && end >= now;
      })
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 3);

    return list;
  }, [amcs]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <FileText size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                Welcome Back ADMIN
              </h1>
              <div className="mt-1 h-[3px] w-28 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/70 mt-3 max-w-[740px] text-[15px] leading-relaxed">
            Monitor tickets, AMC coverage, and pending requests in one premium control panel.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <QuickLink
            label="View Tickets"
            onClick={() => navigate("/admin/tickets")}
          />
          <QuickLink label="View AMC" onClick={() => navigate("/admin/amc")} />
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPI
          icon={Ticket}
          title="Total Tickets"
          value={loadingTickets ? "..." : String(totalTickets)}
          tone="orange"
        />

        <KPI
          icon={ShieldCheck}
          title="Active AMC Contracts"
          value={loadingAmc ? "..." : String(activeAmcCount)}
          tone="blue"
        />

        <KPI
          icon={Clock}
          title="Pending Requests"
          value={loadingTickets ? "..." : String(pendingRequests)}
          tone="green"
        />
      </div>

      {/* Main Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-6">
        {/* Recent Tickets */}
        <GlassCard
          title="Recent Tickets"
          description="Latest ticket submissions and current status."
          icon={FileText}
          actionLabel="View All"
          onAction={() => navigate("/admin/tickets")}
        >
          {loadingTickets ? (
            <BlockSkeleton rows={5} />
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No tickets found"
              subtitle="Ticket database is empty or no results are available."
            />
          ) : (
            

            <div className="overflow-x-auto admin-scroll-dark">

              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="text-white/55 text-sm border-b border-white/10">
                    <TH>S.No.</TH>
                    <TH>ID</TH>
                    <TH>Title</TH>
                    <TH>Status</TH>
                    <TH>Priority</TH>
                    <TH>Assigned To</TH>
                    

                  </tr>
                </thead>

                <tbody className="text-white/90 text-sm">
                  {tickets.map((t,idx) => (
                    <tr
                      key={t._id}
                      className="border-b border-white/10 hover:bg-white/[0.04] transition cursor-pointer"
                      onClick={() => navigate(`/admin/tickets/${t._id}`)}
                    
                    >
                      <TD className="text-white/55 font-semibold">{idx + 1}</TD>

                      <TD className="font-semibold text-white/85">
                        {t.ticketId || t._id?.slice(-6) || "—"}
                      </TD>
                      <TD className="font-semibold">{t.title || "—"}</TD>
                      <TD>
                        <StatusChip value={formatStatus(t.status)} />
                      </TD>
                      <TD className="text-white/80">{formatPriority(t.priority)}</TD>
                      <TD className="text-white/80">
                        {t.assignedTo?.name || "Unassigned"}
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Upcoming AMC Renewals */}
        <GlassCard
          title="Upcoming AMC Renewals"
          description="Closest AMC end dates for quick follow-up."
          icon={CalendarDays}
          actionLabel="View All"
          onAction={() => navigate("/admin/amc")}
        >
          {loadingAmc ? (
            <BlockSkeleton rows={3} />
          ) : upcomingRenewals.length === 0 ? (
            <EmptyState
              title="No renewals found"
              subtitle="No active AMC contracts with upcoming end dates."
            />
          ) : (
            <div className="space-y-3 mt-2">
              {upcomingRenewals.map((a) => (
                <div
                  key={a._id}
                  className="rounded-2xl bg-black/30 border border-white/10 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-white/90 font-semibold truncate">
                        {a.customer?.name || "Customer"}
                      </div>

                      <div className="text-white/45 text-xs truncate mt-1">
                        {a.contractNumber || "—"}
                      </div>
                    </div>

                    <div className="text-white/70 text-sm whitespace-nowrap">
                      {formatDate(a.endDate)}
                    </div>
                  </div>

                  <div className="mt-3 text-white/50 text-xs">
                    Status:{" "}
                    <span className="text-white/70 font-semibold">
                      {String(a.status || "—").toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

/* ------------------------ Helpers ------------------------ */

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

/* ------------------------ Components ------------------------ */

function QuickLink({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
      shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
    >
      {label}
      <ChevronRight size={16} className="text-white/80" />
    </button>
  );
}

function KPI({ icon: Icon, title, value, tone }) {
  const theme =
    tone === "orange"
      ? {
          bg: "bg-[linear-gradient(270deg,#fbbf24_0%,#ea580c_52%,#7c2d12_100%)]",
          rightGlow:
            "bg-[radial-gradient(220px_140px_at_76%_52%,rgba(255,255,255,0.14),transparent_72%)]",
        }
      : tone === "blue"
      ? {
          bg: "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]",
          rightGlow:
            "bg-[radial-gradient(220px_140px_at_80%_50%,rgba(255,255,255,0.14),transparent_72%)]",
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

      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      />

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

function GlassCard({ title, description, icon: Icon, children, actionLabel, onAction }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(120,170,255,0.14)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-white/95 font-semibold">
              {Icon && <Icon size={18} strokeWidth={2.2} />}
              {title}
            </div>
            <div className="text-white/60 text-sm mt-1">{description}</div>
          </div>

          {actionLabel && (
            <button
              onClick={onAction}
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm transition shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            >
              {actionLabel}
            </button>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
      <div className="text-white text-lg font-semibold">{title}</div>
      <div className="text-white/60 text-sm mt-2">{subtitle}</div>
    </div>
  );
}

function BlockSkeleton({ rows = 4 }) {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[240px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function TH({ children }) {
  return <th className="text-left py-3 px-4 font-semibold tracking-wide">{children}</th>;
}

function TD({ children, className = "" }) {
  return <td className={`py-4 px-4 ${className}`}>{children}</td>;
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
