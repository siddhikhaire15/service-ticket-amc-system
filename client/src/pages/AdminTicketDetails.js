import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

import {
  ArrowLeft,
  ClipboardList,
  Calendar,
  User2,
  BadgeCheck,
  AlertTriangle,
  Wrench,
  RefreshCcw,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AdminTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);

  // ✅ Service Logs
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");

  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  // ✅ Engineers list
  const [engineers, setEngineers] = useState([]);
  const [engineersLoading, setEngineersLoading] = useState(false);
  const [engineersError, setEngineersError] = useState("");

  const [selectedEngineerId, setSelectedEngineerId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/tickets/${ticketId}`);
      const t = res.data?.ticket || res.data;
      setTicket(t);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      setLogsError("");

      const res = await api.get(`/service-logs/${ticketId}`);
      const list = res.data?.logs || res.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH LOGS ERROR:", err);
      setLogs([]);
      setLogsError(err?.response?.data?.message || "Failed to load service logs.");
    } finally {
      setLogsLoading(false);
    }
  };

  // ✅ Fetch Engineers list
  const fetchEngineers = async () => {
    try {
      setEngineersLoading(true);
      setEngineersError("");

      // your backend endpoint
      const res = await api.get("/users/engineers");
      const list = res.data?.engineers || res.data || [];
      setEngineers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("FETCH ENGINEERS ERROR:", err);
      setEngineers([]);
      setEngineersError(err?.response?.data?.message || "Failed to load engineers.");
    } finally {
      setEngineersLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchLogs();
    fetchEngineers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  // ✅ Admin should ONLY Close Ticket (after resolved)
  const canCloseTicket = useMemo(() => {
    const s = String(ticket?.status || "").toLowerCase();
    return s === "resolved";
  }, [ticket?.status]);

  const updateStatus = async (nextStatus) => {
    try {
      setUpdatingStatus(true);
      setError("");

      await api.patch(`/tickets/${ticketId}/status`, { status: nextStatus });

      await fetchTicket();
      await fetchLogs();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ✅ Assign engineer
  const canAssign = useMemo(() => {
    return selectedEngineerId && String(selectedEngineerId).length > 5;
  }, [selectedEngineerId]);

  const assignEngineer = async () => {
    try {
      setAssigning(true);
      setAssignError("");
      setAssignSuccess("");

      await api.patch("/tickets/assign", {
        ticketId,
        engineerId: selectedEngineerId,
      });

      setAssignSuccess("Engineer assigned successfully ✅");
      await fetchTicket();
    } catch (err) {
      console.error("ASSIGN ERROR:", err);
      setAssignError(err?.response?.data?.message || "Failed to assign engineer.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <button
            onClick={() => navigate("/admin/tickets")}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-4"
          >
            <ArrowLeft size={18} />
            Back to Tickets
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <ClipboardList size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[34px] leading-[1.05] font-extrabold tracking-tight">
                Ticket Details
              </h1>
              <div className="mt-1 h-[3px] w-28 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 text-[15px]">
            View full ticket information, assignments, and service logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
            shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
          >
            <RefreshCcw size={16} />
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.55)] p-6 text-white/70">
          Loading ticket...
        </div>
      )}

      {!loading && ticket && (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Ticket Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(120,170,255,0.14)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

              <div className="relative z-10 p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-white/60 text-sm">
                      Ticket ID:{" "}
                      <span className="text-white/90 font-semibold">
                        {ticket.ticketId || ticket._id}
                      </span>
                    </div>

                    <div className="mt-2 text-white text-2xl font-extrabold tracking-tight">
                      {ticket.title || "Untitled Ticket"}
                    </div>

                    <div className="mt-3 text-white/70 text-sm leading-relaxed">
                      {ticket.description || "No description provided."}
                    </div>
                  </div>
                    

        


                  <StatusBadge status={ticket.status} />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AttachmentInfo attachmentUrl={ticket?.attachmentUrl} />

                  <InfoLine
                    icon={Calendar}
                    label="Created"
                    value={formatDate(ticket.createdAt)}
                  />

                  <InfoLine
                    icon={User2}
                    label="Created By"
                    value={
                      typeof ticket.createdBy === "object"
                        ? ticket.createdBy?.name ||
                          ticket.createdBy?.email ||
                          ticket.createdBy?._id
                        : ticket.createdBy || "—"
                    }
                  />

                  <InfoLine
                    icon={AlertTriangle}
                    label="Priority"
                    value={formatPriority(ticket.priority)}
                  />

                  <InfoLine
                    icon={BadgeCheck}
                    label="Assigned To"
                    value={
                      typeof ticket.assignedTo === "object"
                        ? ticket.assignedTo?.name ||
                          ticket.assignedTo?.email ||
                          ticket.assignedTo?._id
                        : ticket.assignedTo || "Unassigned"
                    }
                  />
                  
                </div>
              </div>
            </div>

            {/* ✅ Assign Engineer Panel */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-2 text-white/95 font-semibold">
                <Users size={18} />
                Assign Engineer
              </div>

              <p className="text-white/60 text-sm mt-1">
                Assign this ticket to an engineer so they can work and add service logs.
              </p>

              {engineersError && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
                  {engineersError}
                </div>
              )}

              <div className="mt-4 flex flex-col md:flex-row gap-3">
                <select
                  value={selectedEngineerId}
                  onChange={(e) => setSelectedEngineerId(e.target.value)}
                  className="w-full md:flex-1 h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white outline-none
                  focus:border-white/20 focus:bg-black/65"
                >
                  <option value="">Select Engineer...</option>

                  {engineersLoading ? (
                    <option value="">Loading...</option>
                  ) : (
                    engineers.map((eng) => (
                      <option key={eng._id} value={eng._id}>
                        {eng.name || "Engineer"} ({eng.email})
                      </option>
                    ))
                  )}
                </select>

                <button
                  onClick={assignEngineer}
                  disabled={!canAssign || assigning}
                  className={`h-12 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
                  bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
                  ${
                    !canAssign || assigning
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:opacity-[0.92]"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {assigning ? "Assigning..." : "Assign"}
                  </span>
                </button>
              </div>

              {assignError && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
                  {assignError}
                </div>
              )}

              {assignSuccess && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-200 text-sm">
                  {assignSuccess}
                </div>
              )}
            </div>

            {/* ✅ Service Logs Panel */}
            <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]">
              <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_55px_rgba(120,170,255,0.14)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_58%)] opacity-80" />
              <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/12 blur-3xl opacity-80" />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-white/95 font-semibold">
                    <Wrench size={18} strokeWidth={2.2} />
                    Service Logs
                  </div>

                  <button
                    onClick={fetchLogs}
                    className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm transition shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
                  >
                    Refresh
                  </button>
                </div>

                <p className="text-white/60 text-sm mt-1">
                  Logs recorded by engineers for this ticket.
                </p>

                {logsError && (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
                    {logsError}
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  {logsLoading && <LogsSkeleton />}

                  {!logsLoading && logs.length === 0 && (
                    <div className="rounded-2xl bg-black/25 border border-white/10 p-6 text-center">
                      <div className="text-white font-semibold">
                        No service logs found
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        Engineers haven’t added any logs for this ticket yet.
                      </div>
                    </div>
                  )}

                  {!logsLoading &&
                    logs.length > 0 &&
                    logs.map((log) => (
                      <div
                        key={log._id}
                        className="rounded-2xl bg-black/30 border border-white/10 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-white/90 font-semibold">
                            Service Update
                          </div>
                          <div className="text-white/50 text-xs">
                            {formatDate(log.createdAt)}
                          </div>
                        </div>

                        <div className="mt-2 text-white/70 text-sm leading-relaxed">
                         {log.workNote || "—"}


                        </div>

                        <div className="mt-3 text-white/50 text-xs">
                          By:{" "}
                          <span className="text-white/70">
                            {log.engineerId?.name || log.engineerId?.email || "—"}


                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Admin Actions (ONLY CLOSE) */}
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] h-fit">
            <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_55px_rgba(120,170,255,0.14)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_58%)] opacity-80" />
            <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/12 blur-3xl opacity-80" />

            <div className="relative z-10">
              <div className="text-white/95 font-semibold text-lg">
                Admin Controls
              </div>
              <div className="text-white/60 text-sm mt-1">
                Admin can assign engineer and close ticket after it is resolved.
              </div>

              <div className="mt-5 space-y-3">
                <StatusActionButton
                  label={canCloseTicket ? "Close Ticket" : "Close (Only after Resolved)"}
                  tone="red"
                  disabled={updatingStatus || !canCloseTicket}
                  onClick={() => updateStatus("closed")}
                />
              </div>

              {!canCloseTicket && (
                <div className="mt-4 rounded-2xl bg-black/25 border border-white/10 p-4 text-white/55 text-sm">
                  Ticket must be <b>Resolved</b> by engineer before Admin can close it.
                </div>
              )}

              {updatingStatus && (
                <div className="mt-5 text-white/60 text-sm">
                  Updating status...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttachmentInfo({ attachmentUrl }) {
  if (!attachmentUrl) return null;

  const fullUrl = `http://localhost:5000${attachmentUrl}`;

  return (
    <button
      onClick={() => window.open(fullUrl, "_blank")}
      className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10
                 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                 hover:bg-white/10 transition"
    >
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10
                      flex items-center justify-center text-white/80">
        📎
      </div>

      <div>
        <div className="text-white/55 text-xs">Attachment</div>
        <div className="text-white/90 text-sm font-semibold">
          View Attachment
        </div>
      </div>
    </button>
  );
}


/* -------------------- UI Helpers -------------------- */

function StatusBadge({ status }) {
  const s = String(status || "open").toLowerCase();

  const cls =
    s === "open"
      ? "bg-[linear-gradient(270deg,#fbbf24_0%,#ea580c_52%,#7c2d12_100%)]"
      : s === "in-progress"
      ? "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]"
      : s === "resolved"
      ? "bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]"
      : "bg-[linear-gradient(270deg,#fecaca_0%,#ef4444_50%,#7f1d1d_100%)]";

  return (
    <span
      className={`relative inline-flex items-center px-4 py-2 rounded-full text-white text-xs font-semibold shadow-[0_10px_22px_rgba(0,0,0,0.35)] ${cls}`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_55%)] opacity-70" />
      <span className="relative">
        {s === "in-progress" ? "In Progress" : capitalize(s)}
      </span>
    </span>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
        <Icon size={18} className="text-white/80" />
      </div>

      <div>
        <div className="text-white/55 text-xs">{label}</div>
        <div className="text-white/90 text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function StatusActionButton({ label, tone, onClick, disabled }) {
  const theme =
    tone === "blue"
      ? "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]"
      : tone === "green"
      ? "bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]"
      : "bg-[linear-gradient(270deg,#fecaca_0%,#ef4444_50%,#7f1d1d_100%)]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-12 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition ${theme}
      ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-[0.92]"}`}
    >
      {label}
    </button>
  );
}

function LogsSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Formatting -------------------- */

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

function formatPriority(p) {
  if (!p) return "Medium";
  const s = String(p).toLowerCase();
  if (s === "high") return "High";
  if (s === "low") return "Low";
  return "Medium";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
