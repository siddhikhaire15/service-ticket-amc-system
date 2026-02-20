import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import {
  ShieldCheck,
  CalendarDays,
  Hash,
  User2,
  FileText,
  RefreshCcw,
  Search,
  Filter,
  AlertCircle,
  Download,
  Eye,
  Clock4,
  BadgeCheck,
} from "lucide-react";

/**
 * ✅ Premium User AMC Page
 * - Works with existing API: GET /amc/my
 * - Supports optional `documentUrl` or `documentPath`
 */
export default function UserAMC() {
  const [amcs, setAmcs] = useState([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce search
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const fetchMyAmc = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
      if (status !== "All Status") params.status = status.toLowerCase();

      const res = await api.get("/amc/my", { params });

      const list = res.data?.amcs || [];
      setAmcs(Array.isArray(list) ? list : []);
      setTotal(res.data?.total ?? list.length ?? 0);
    } catch (err) {
      console.error("USER AMC FETCH ERROR:", err);
      setError(
        err?.response?.data?.message || "Failed to load your AMC. Please try again."
      );
      setAmcs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
  

  

  useEffect(() => {
    fetchMyAmc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, status]);

  const stats = useMemo(() => {
    const active = amcs.filter(
      (a) => String(a?.status || "").toLowerCase() === "active"
    ).length;

    const expired = amcs.filter(
      (a) => String(a?.status || "").toLowerCase() === "expired"
    ).length;

    const suspended = amcs.filter(
      (a) => String(a?.status || "").toLowerCase() === "suspended"
    ).length;

    return { active, expired, suspended };
  }, [amcs]);

  return (
    <div className="w-full">
      {/* ✅ Premium Hero Header */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/12 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ShieldCheck size={22} className="text-white/90" />
              </div>

              <div className="min-w-0">
                <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                  My AMC
                </h1>
                <div className="mt-1 h-[3px] w-16 rounded-full bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)] opacity-90" />
              </div>
            </div>

            <p className="text-white/70 mt-3 max-w-[820px] text-[15px] leading-relaxed">
              View AMC contract validity, coverage period, and included services.
              Download the contract document whenever required.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/60">
              <BadgeCheck size={14} className="text-emerald-200/80" />
              Contracts are managed by Admin. Your view is read-only.
            </div>
          </div>

          <button
            onClick={fetchMyAmc}
            className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
            transition hover:opacity-[0.92]
            bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
            inline-flex items-center gap-2 w-fit"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ✅ KPI */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-5">
        <KPI title="Total Contracts" value={loading ? "..." : String(total)} tone="blue" />
        <KPI title="Active" value={loading ? "..." : String(stats.active)} tone="green" />
        <KPI
          title="Expired / Suspended"
          value={loading ? "..." : String(stats.expired + stats.suspended)}
          tone="red"
        />
      </div>

      {/* ✅ Filters */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-[1.2fr_0.6fr] gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contract number..."
            className="w-full h-12 pl-11 pr-4 rounded-xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
            focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_55%)] opacity-55" />
        </div>

        <PillSelect
          value={status}
          onChange={setStatus}
          options={["All Status", "Active", "Expired", "Suspended"]}
          icon={Filter}
        />
      </div>

      {/* ✅ Error */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="mt-[1px]" />
          {error}
        </div>
      )}

      {/* ✅ Contracts Panel */}
      <div className="mt-6 relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(120,170,255,0.14)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

        <div className="relative z-10 p-6">
          <div className="flex items-start md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-white text-lg font-semibold">AMC Contracts</h2>
              <p className="text-white/60 text-sm">
                {loading ? "Loading..." : `Showing ${amcs.length} contract(s)`}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 h-11 rounded-2xl bg-black/30 border border-white/10 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <CalendarDays size={16} className="text-white/60" />
              <span className="text-white/60 text-sm">Validity</span>
              <span className="font-semibold">Summary</span>
            </div>
          </div>

          {loading && <SkeletonList />}

          {!loading && amcs.length === 0 && (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
              <div className="text-white text-lg font-semibold">No AMC found</div>
              <div className="text-white/60 text-sm mt-2">
                Your AMC will appear here once Admin assigns it to your account.
              </div>
            </div>
          )}

          {!loading && amcs.length > 0 && (
            <div className="space-y-4">
              {amcs.map((a) => (
                <AMCCard key={a._id} amc={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Premium Cards ---------------- */

function AMCCard({ amc }) {
  const status = String(amc?.status || "unknown").toLowerCase();

  const start = amc?.startDate ? new Date(amc.startDate) : null;
  const end = amc?.endDate ? new Date(amc.endDate) : null;

  const { percent, daysLeft, totalDays } = useMemo(() => {
    if (!start || !end) return { percent: 0, daysLeft: null, totalDays: null };

    const now = new Date();
    const total = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const left = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const elapsed = total - left;

    const p = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
    return { percent: p, daysLeft: left, totalDays: total };
  }, [amc?.startDate, amc?.endDate]);

  // ✅ support multiple possible backend keys
 const documentUrl =
  amc?.amcDocumentUrl ||
  amc?.documentUrl ||
  amc?.documentPath ||
  amc?.fileUrl ||
  amc?.attachmentUrl ||
  "";


  let fullUrl = attachmentUrl.includes("localhost")
  ? attachmentUrl.replace("http://localhost:5000", "https://service-ticket-amc-system.onrender.com")
  : `https://service-ticket-amc-system.onrender.com${attachmentUrl}`;

  const covered = Array.isArray(amc?.coveredServices) ? amc.coveredServices : [];
  const handleDownload = async () => {
  try {
    const res = await api.get(`/amc/${amc._id}/download-my-document`, {
      responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(amc.contractNumber || "AMC").replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    alert("Download failed");
  }
};

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/35 border border-white/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),transparent_55%)] opacity-40" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-white/90 font-semibold">
            <Hash size={14} className="text-white/40" />
            <span className="truncate">{amc?.contractNumber || "—"}</span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-white/55 text-xs">
            <User2 size={14} className="text-white/35" />
            <span className="truncate">
              {amc?.customer?.name || amc?.customer?.email || "Customer"}
            </span>
          </div>

          {/* Validity quick line */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <CalendarDays size={14} className="text-white/40" />
              {formatDate(amc?.startDate)} → {formatDate(amc?.endDate)}
            </span>

            {daysLeft !== null && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Clock4 size={14} className="text-white/40" />
                {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-end lg:items-end flex-col gap-3">
          <StatusChip value={status} />

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
  type="button"
  disabled={!fullDocUrl}
  onClick={() => window.open(fullDocUrl, "_blank")}
  className={`h-9 px-4 rounded-full border text-xs transition inline-flex items-center gap-2
  ${
    fullDocUrl
      ? "bg-white/10 hover:bg-white/15 border-white/10 text-white"
      : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
  }`}
  title={fullDocUrl ? "View AMC Document" : "No document uploaded"}
>
  <Eye size={14} />
  View
</button>

            <button
  onClick={handleDownload}
  disabled={!fullDocUrl}
  className={`h-9 px-4 rounded-full border text-xs transition inline-flex items-center gap-2
    ${
      fullDocUrl
        ? "bg-emerald-500/15 hover:bg-emerald-500/20 border-emerald-400/20 text-emerald-200"
        : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
    }`}
>
  <Download size={14} />
  Download
</button>

          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="relative z-10 mt-5 rounded-2xl bg-black/30 border border-white/10 p-4">
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>Contract Validity</span>
          {totalDays ? (
            <span className="text-white/70 font-semibold">{percent}% used</span>
          ) : (
            <span className="text-white/40">—</span>
          )}
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Covered Services */}
      <div className="relative z-10 mt-4 rounded-2xl bg-black/30 border border-white/10 p-4">
        <div className="flex items-center gap-2 text-white/60 text-xs mb-3">
          <FileText size={14} className="text-white/40" />
          Covered Services
        </div>

        {covered.length === 0 ? (
          <div className="text-white/60 text-sm">—</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {covered.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs"
              >
                {String(s)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function KPI({ title, value, tone }) {
  const theme =
    tone === "blue"
      ? "bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]"
      : tone === "green"
      ? "bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]"
      : "bg-[linear-gradient(270deg,#fecaca_0%,#ef4444_50%,#7f1d1d_100%)]";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white ${theme}
      ring-1 ring-white/10 shadow-[0_22px_55px_rgba(0,0,0,0.55)]`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_-18px_30px_rgba(0,0,0,0.35)]" />
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.22)_0%,transparent_55%)] opacity-60" />

      <div className="relative">
        <div className="text-white/85 text-sm font-semibold">{title}</div>
        <div className="mt-2 text-[44px] leading-none font-extrabold tracking-tight">
          {value}
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
  const s = String(value || "unknown").toLowerCase();
  const styles =
    s === "active"
      ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-200"
      : s === "expired"
      ? "bg-red-500/20 border-red-400/30 text-red-200"
      : s === "suspended"
      ? "bg-yellow-500/20 border-yellow-400/30 text-yellow-200"
      : "bg-white/10 border-white/15 text-white/80";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function SkeletonList() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[240px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[150px] w-full rounded-2xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Helpers ---------------- */

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
