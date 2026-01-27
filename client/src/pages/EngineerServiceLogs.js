import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import {
  ArrowLeft,
  FileText,
  RefreshCcw,
  Plus,
  AlertCircle,
  Activity,
  Dot,
  X,
  Save,
  Sparkles,
  Timer,
  Wrench,
  Package,
  ClipboardList,
} from "lucide-react";


export default function EngineerServiceLogs() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  console.log("ticketId from params:", ticketId);
  const [ticket, setTicket] = useState(null);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ✅ Premium structured form (UI only)
  const [form, setForm] = useState({
    workNote: "",
    workTypes: [], // multi-select chips
    partsUsed: "",
    timeSpent: "",
    nextAction: "",
    customerNotified: false,
  });

  const WORK_TYPES = [
    "Inspection",
    "Testing",
    "Cleaning",
    "Calibration",
    "Repair",
    "Replacement",
    "Firmware Update",
    "Wiring Check",
    "Configuration",
    "Other",
  ];

  const resetForm = () => {
    setForm({
      workNote: "",
      workTypes: [],
      partsUsed: "",
      timeSpent: "",
      nextAction: "",
      customerNotified: false,
    });
    setCreateError("");
  };

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      const t = res.data?.ticket || res.data;
      setTicket(t || null);
    } catch {
      // optional
    }
  };

  const fetchLogs = async (opts = { silent: false }) => {
    const silent = opts?.silent ?? false;

    try {
      if (!silent) setLoading(true);
      if (silent) setRefreshing(true);

      setError("");

      const res = await api.get(`/service-logs/${ticketId}`);
      const payload = res.data;
      const list = payload?.logs || payload?.data || payload || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("ENGINEER SERVICE LOGS ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load service logs.");
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!ticketId) return;
    fetchTicket();
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const da = new Date(a?.createdAt || 0).getTime();
      const db = new Date(b?.createdAt || 0).getTime();
      return db - da;
    });
  }, [logs]);

  const canSubmit = useMemo(() => {
    return String(form.workNote || "").trim().length >= 10;
  }, [form.workNote]);

  // ✅ Create "workNote" string (Backend-safe)
  const buildWorkNote = () => {
    const lines = [];

    const main = String(form.workNote || "").trim();
    if (main) lines.push(`Work Note: ${main}`);

    if (form.workTypes?.length) {
      lines.push(`Work Done: ${form.workTypes.join(", ")}`);
    }

    const parts = String(form.partsUsed || "").trim();
    if (parts) lines.push(`Parts Used: ${parts}`);

    const time = String(form.timeSpent || "").trim();
    if (time) lines.push(`Time Spent: ${time}`);

    const next = String(form.nextAction || "").trim();
    if (next) lines.push(`Next Action: ${next}`);

    lines.push(`Customer Notified: ${form.customerNotified ? "Yes" : "No"}`);

    return lines.join("\n");
  };

  const createLog = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);
      setCreateError("");

      const payload = {
        ticketId,
        workNote: buildWorkNote(),
      };

      await api.post(`/service-logs`, payload);

      setOpenModal(false);
      resetForm();
      await fetchLogs({ silent: true });
    } catch (err) {
      console.error("CREATE LOG ERROR:", err);
      setCreateError(err?.response?.data?.message || "Failed to create service log.");
    } finally {
      setCreating(false);
    }
  };

  const toggleWorkType = (type) => {
    setForm((p) => {
      const exists = p.workTypes.includes(type);
      return {
        ...p,
        workTypes: exists ? p.workTypes.filter((t) => t !== type) : [...p.workTypes, type],
      };
    });
  };

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -top-14 -right-16 h-64 w-64 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
                shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                onClick={() => fetchLogs({ silent: true })}
                className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
                shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
                disabled={refreshing}
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <FileText size={22} className="text-white/90" />
              </div>

              <div className="min-w-0">
                <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                  Service Logs
                </h1>
                <div className="mt-1 h-[3px] w-28 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
              </div>
            </div>

            <p className="text-white/70 mt-3 max-w-[820px] text-[15px] leading-relaxed">
              Record each action for traceability, audit readiness, and a clean service timeline.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/60">
              <Sparkles size={14} className="text-emerald-200/80" />
              Logs are stored in structured report format automatically.
            </div>

            <div className="mt-3 text-white/45 text-xs">
              Ticket:{" "}
              <span className="text-white/80 font-semibold">
                {ticket?.title || ticketId}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                resetForm();
                setOpenModal(true);
              }}
              className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
              transition hover:opacity-[0.92]
              bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
              inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Add Log
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-[1px]" />
          <div>{error}</div>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-7 relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

        <div className="relative z-10 p-6">
          {loading ? (
            <LogsSkeleton />
          ) : sortedLogs.length === 0 ? (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
              <div className="text-white text-lg font-semibold">No logs yet</div>
              <div className="text-white/60 text-sm mt-2">
                Add your first service log to start tracking actions.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedLogs.map((log) => (
                <TimelineItem key={log._id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {openModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
          <div
            onClick={() => {
              if (!creating) {
                setOpenModal(false);
                resetForm();
              }
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-[980px] overflow-hidden rounded-2xl bg-[#0b1220]/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-85" />
            <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl opacity-80" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl opacity-80" />

            <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="text-white font-extrabold text-lg">
                  Add Service Log
                </div>
                <div className="text-white/50 text-xs mt-1">
                  Ticket ID: <span className="text-white/70">{ticketId}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!creating) {
                    setOpenModal(false);
                    resetForm();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 flex items-center justify-center transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createLog} className="relative z-10 px-6 py-6">
              {createError && (
                <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="mt-[1px]" />
                  {createError}
                </div>
              )}

              {/* ✅ Premium Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-5">
                {/* Left */}
                <div className="rounded-2xl bg-black/35 border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                    <ClipboardList size={16} className="text-white/45" />
                    Work Note (Required)
                  </div>

                  <textarea
                    value={form.workNote}
                    placeholder="Write what you did, observations, measurements, and outcome..."
                    onChange={(e) => setForm((p) => ({ ...p, workNote: e.target.value }))}
                    className="w-full h-40 px-4 py-3 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/35 outline-none
                    focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] resize-none"
                  />

                  <div className="mt-3 text-white/40 text-xs">
                    Minimum 10 characters. Keep it clear and audit-friendly.
                  </div>

                  {/* Chips */}
                  <div className="mt-5">
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
                      <Wrench size={16} className="text-white/45" />
                      Work Done (Tags)
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {WORK_TYPES.map((type) => {
                        const active = form.workTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleWorkType(type)}
                            className={`px-3 py-2 rounded-full text-xs font-semibold border transition
                              ${
                                active
                                  ? "bg-white/15 border-white/20 text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
                                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                              }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <div className="rounded-2xl bg-black/35 border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <Package size={16} className="text-white/45" />
                      Parts Used
                    </div>

                    <input
                      value={form.partsUsed}
                      placeholder="e.g., HDMI cable, power adapter, fuse..."
                      onChange={(e) => setForm((p) => ({ ...p, partsUsed: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/35 outline-none
                      focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    />
                  </div>

                  <div className="rounded-2xl bg-black/35 border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <Timer size={16} className="text-white/45" />
                      Time Spent
                    </div>

                    <input
                      value={form.timeSpent}
                      placeholder="e.g., 20 mins / 1.5 hrs"
                      onChange={(e) => setForm((p) => ({ ...p, timeSpent: e.target.value }))}
                      className="w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/35 outline-none
                      focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    />
                  </div>

                  <div className="rounded-2xl bg-black/35 border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="text-white/70 text-sm mb-2">
                      Next Action / Follow-up
                    </div>

                    <textarea
                      rows={3}
                      value={form.nextAction}
                      placeholder="e.g., verify tomorrow / awaiting spare / monitor performance..."
                      onChange={(e) => setForm((p) => ({ ...p, nextAction: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/35 outline-none
                      focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] resize-none"
                    />
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-white/70 text-sm">
                        Customer Notified
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            customerNotified: !p.customerNotified,
                          }))
                        }
                        className={`h-9 px-4 rounded-full border text-xs font-semibold transition
                          ${
                            form.customerNotified
                              ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-200"
                              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                      >
                        {form.customerNotified ? "Yes" : "No"}
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="text-white/35 text-xs">
                 
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!creating) {
                        setOpenModal(false);
                        resetForm();
                      }
                    }}
                    className="h-11 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition"
                    disabled={creating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating || !canSubmit}
                    className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
                    bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
                    ${creating || !canSubmit ? "opacity-40 cursor-not-allowed" : "hover:opacity-[0.92]"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Save size={16} />
                      {creating ? "Saving..." : "Save Log"}
                    </span>
                  </button>
                </div>
              </div>

              {!canSubmit && (
                <div className="mt-4 text-white/40 text-xs">
                  Work Note should be at least 10 characters.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function TimelineItem({ log }) {
  const note = log.workNote || "Service update added";
  const who = log.engineerId?.email || "Engineer";

  return (
    <div className="relative rounded-2xl bg-black/35 border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex items-start gap-3">
        <div className="mt-1 w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
          <Activity size={16} className="text-white/75" />
        </div>

        <div className="min-w-0 flex-1">
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

function LogsSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 w-full rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

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
