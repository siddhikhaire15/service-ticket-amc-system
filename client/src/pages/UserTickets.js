import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Ticket as TicketIcon,
  Search,
  ChevronDown,
  Plus,
  X,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function UserTickets() {
  const navigate = useNavigate();

  // filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  // data
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create Ticket Modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  // ✅ NEW: Image state (optional attachment)
  const [imageFile, setImageFile] = useState(null);

  const canCreate = useMemo(() => {
    return (
      String(createForm.title || "").trim().length >= 3 &&
      String(createForm.description || "").trim().length >= 8
    );
  }, [createForm.title, createForm.description]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (query.trim()) params.search = query.trim();

      if (status !== "All Status") {
        params.status = status.toLowerCase().replace(" ", "-");
      }

      // ✅ backend returns tickets for logged-in customer
      const res = await api.get("/tickets", { params });

      const list = res.data?.tickets || res.data?.data || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("USER TICKETS ERROR:", err);
      setError(err.message || "Failed to load your tickets. Please try again.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchMyTickets, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const openCreateModal = () => {
    setCreateError("");
    setCreateForm({ title: "", description: "", priority: "medium" });
    setImageFile(null); // ✅ reset image
    setOpenCreate(true);
  };

  // ✅ Create Ticket (with optional image)
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreateError("");

    try {
      const cleanTitle = String(createForm.title || "").trim();
      const cleanDescription = String(createForm.description || "").trim();
      const cleanPriority = String(createForm.priority || "medium").toLowerCase();

      if (!cleanTitle) throw new Error("Title is required.");
      if (!cleanDescription) throw new Error("Description is required.");
      if (cleanTitle.length < 3) throw new Error("Title must be at least 3 characters.");
      if (cleanDescription.length < 8)
        throw new Error("Description must be at least 8 characters.");

      setCreating(true);

      // ✅ IMPORTANT: Use FormData so image can be sent
      const formData = new FormData();
      formData.append("title", cleanTitle);
      formData.append("description", cleanDescription);
      formData.append("priority", cleanPriority);

      // ✅ optional image
      if (imageFile) {
        formData.append("image", imageFile); // must match upload.single("image")
      }

      const res = await api.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const created = res.data?.ticket || res.data;
      const id = created?._id || created?.id;

      setOpenCreate(false);
      await fetchMyTickets();

      if (id) navigate(`/user/tickets/${id}`);
    } catch (err) {
      console.error("CREATE TICKET ERROR:", err);
      setCreateError(err?.response?.data?.message || err.message || "Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full">
      {/* ✅ Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <TicketIcon size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                My Tickets
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[760px] text-[15px] leading-relaxed">
            Create a service ticket and track updates. Engineers will add service logs once
            work begins.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
          transition hover:opacity-[0.92]
          bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
          inline-flex items-center gap-2 w-fit"
        >
          <Plus size={16} />
          Create Ticket
        </button>
      </div>

      {/* ✅ Filters */}
      <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.3fr_0.55fr] gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets..."
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

      {/* ✅ Ticket List Container */}
      <div className="mt-6 relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

        <div className="relative z-10 p-6">
          {loading && <TicketsSkeleton />}

          {!loading && tickets.length === 0 && (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
              <div className="text-white text-lg font-semibold">No tickets found</div>
              <div className="text-white/60 text-sm mt-2">
                Try changing filters or create a new ticket.
              </div>

              <button
                onClick={openCreateModal}
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

          {!loading && tickets.length > 0 && (
            <div className="space-y-3">
              {tickets.map((t) => (
                <TicketRow
                  key={t._id}
                  ticket={t}
                  onOpen={() => navigate(`/user/tickets/${t._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {openCreate && (
        <CreateTicketModal
          creating={creating}
          error={createError}
          form={createForm}
          setForm={setCreateForm}
          imageFile={imageFile}
          setImageFile={setImageFile}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreateTicket}
          canSubmit={canCreate}
        />
      )}
    </div>
  );
}

/* ---------------- UI Components ---------------- */

function TicketRow({ ticket, onOpen }) {
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

function CreateTicketModal({
  creating,
  error,
  form,
  setForm,
  imageFile,
  setImageFile,
  onClose,
  onSubmit,
  canSubmit,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-[760px] overflow-hidden rounded-2xl bg-[#0b1220]/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/10 blur-3xl opacity-80" />

        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-extrabold text-lg">Create Ticket</div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="relative z-10 px-6 py-6">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Field
              label="Title*"
              value={form.title}
              placeholder="e.g., Camera not powering on"
              onChange={(v) => setForm((p) => ({ ...p, title: v }))}
            />

            <TextAreaField
              label="Description*"
              value={form.description}
              placeholder="Explain issue, symptoms, and steps tried..."
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
            />

            <SelectField
              label="Priority"
              value={form.priority}
              onChange={(v) => setForm((p) => ({ ...p, priority: v }))}
            />

            {/* ✅ Attachment */}
            <div>
              <label className="text-white/65 text-sm">Attachment (optional)</label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-2 w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white outline-none
                focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              />

              {imageFile && (
                <div className="mt-3 rounded-2xl bg-black/35 border border-white/10 p-3 flex items-center justify-between gap-3">
                  <div className="text-white/70 text-xs truncate">
                    Selected:{" "}
                    <span className="text-white/90 font-semibold">{imageFile.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating || !canSubmit}
              className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
              bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
              ${creating || !canSubmit ? "opacity-40 cursor-not-allowed" : "hover:opacity-[0.92]"}`}
            >
              <span className="inline-flex items-center gap-2">
                <Send size={16} />
                {creating ? "Creating..." : "Create Ticket"}
              </span>
            </button>
          </div>

          {!canSubmit && (
            <div className="mt-4 text-white/40 text-xs">
              Title must be 3+ chars and description must be 8+ chars.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-white/65 text-sm">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-white/65 text-sm">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-28 px-4 py-3 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] resize-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange }) {
  return (
    <div className="relative">
      <label className="text-white/65 text-sm">{label}</label>

      <div className="relative mt-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 pr-10 rounded-2xl bg-black/55 border border-white/10 text-white outline-none
          focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] appearance-none cursor-pointer"
        >
          <option value="low" className="bg-[#0b1220]">
            Low
          </option>
          <option value="medium" className="bg-[#0b1220]">
            Medium
          </option>
          <option value="high" className="bg-[#0b1220]">
            High
          </option>
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[220px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[92px] w-full rounded-2xl bg-white/5 animate-pulse" />
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
