import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  FileText,
  RefreshCcw,
  Search,
  ShieldCheck,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Hash,
  User2,
  Plus,
  X,
  Upload,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import api from "../utils/api";

export default function AdminAMC() {
  const [amcs, setAmcs] = useState([]);
  const [total, setTotal] = useState(0);

  // filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 8;

  // network
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [form, setForm] = useState({
    customer: "",
    contractNumber: "",
    startDate: "",
    endDate: "",
    status: "active",
    coveredServices: "",
    notes: "",
  });

  // upload modal
  const [openUpload, setOpenUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedAMC, setSelectedAMC] = useState(null);
  const [docFile, setDocFile] = useState(null);

  // delete confirm
  const [deletingId, setDeletingId] = useState("");

  // ✅ IMPORTANT: endpoint must be "/amc"
  const AMC_ENDPOINT = "/amc";

  // debounce search
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

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
    

    const updateStatus = async (amcId, status) => {
  try {
    await api.patch(`/amc/${amcId}`, { status });
    fetchAmc();
  } catch (err) {
    alert(err?.response?.data?.message || "Status update failed");
  }
};


    return { total, active, expired, suspended };
  }, [amcs, total]);

  const fetchAmc = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, limit };
      if (debouncedQuery.trim()) params.search = debouncedQuery.trim();
      if (status !== "All Status") params.status = status.toLowerCase();

      const res = await api.get(AMC_ENDPOINT, { params });

      const list = res.data?.amcs || [];
      const totalCount = res.data?.total ?? 0;

      setAmcs(Array.isArray(list) ? list : []);
      setTotal(totalCount);
    } catch (err) {
      console.error("AMC FETCH ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load AMC data. Please refresh."
      );
      setAmcs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, status]);

  const fromCount = useMemo(() => {
    if (total === 0) return 0;
    return (page - 1) * limit + 1;
  }, [page, total]);

  const toCount = useMemo(() => {
    return Math.min(page * limit, total);
  }, [page, total]);

  const openCreateModal = () => {
    setCreateError("");
    setForm({
      customer: "",
      contractNumber: "",
      startDate: "",
      endDate: "",
      status: "active",
      coveredServices: "",
      notes: "",
    });
    setOpenCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");

    try {
      setCreating(true);

      if (!form.customer.trim()) throw new Error("Customer ID is required");
      if (!form.contractNumber.trim())
        throw new Error("Contract Number is required");
      if (!form.startDate) throw new Error("Start Date is required");
      if (!form.endDate) throw new Error("End Date is required");

      const coveredServicesArr = form.coveredServices
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post(AMC_ENDPOINT, {
        customer: form.customer.trim(),
        contractNumber: form.contractNumber.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        coveredServices: coveredServicesArr,
        notes: form.notes?.trim() || "",
      });

      setOpenCreate(false);
      await fetchAmc();
    } catch (err) {
      console.error("CREATE AMC ERROR:", err);
      setCreateError(
        err?.response?.data?.message || err?.message || "Failed to create AMC"
      );
    } finally {
      setCreating(false);
    }
  };

  // ✅ Upload Document (Admin)
  const openUploadModal = (amc) => {
    setSelectedAMC(amc);
    setDocFile(null);
    setUploadError("");
    setOpenUpload(true);
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      setUploadError("");

      if (!selectedAMC?._id) throw new Error("AMC not found");
      if (!docFile) throw new Error("Please select a PDF file");

      const fd = new FormData();
      fd.append("document", docFile);

      await api.patch(
        `${AMC_ENDPOINT}/${selectedAMC._id}/upload-document`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setOpenUpload(false);
      setSelectedAMC(null);
      setDocFile(null);

      await fetchAmc();
    } catch (err) {
      console.error("UPLOAD AMC DOC ERROR:", err);
      setUploadError(
        err?.response?.data?.message || err?.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete AMC (Soft delete in backend required)
  const deleteAMC = async (amcId) => {
    try {
      setDeletingId(amcId);

      // If you make DELETE route: DELETE /amc/:amcId
      await api.delete(`${AMC_ENDPOINT}/${amcId}`);

      await fetchAmc();
    } catch (err) {
      console.error("DELETE AMC ERROR:", err);
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const handleAdminDownload = async (amc) => {
  try {
    const res = await api.get(`/amc/${amc._id}/download-document`, {
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
    alert("Admin download failed");
  }
};
 
  const updateStatus = async (amcId, status) => {
  try {
    await api.patch(`/amc/${amcId}`, { status });
    fetchAmc();
  } catch (err) {
    alert(err?.response?.data?.message || "Status update failed");
  }
};


  return (
    <div className="w-full">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.55)] mb-7">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-80" />
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <ShieldCheck size={22} className="text-white/90" />
              </div>

              <div>
                <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                  AMC Management
                </h1>
                <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#c7d2fe_0%,#6366f1_55%,#312e81_100%)] opacity-90" />
              </div>
            </div>

            <p className="text-white/70 mt-3 max-w-[820px] text-[15px] leading-relaxed">
              Create contracts, upload AMC documents, monitor status, and manage coverage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
              shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Create AMC
            </button>

            <button
              onClick={fetchAmc}
              className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
              shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition inline-flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPI icon={FileText} title="Total Contracts" value={loading ? "..." : String(stats.total)} tone="indigo" />
        <KPI icon={BadgeCheck} title="Active" value={loading ? "..." : String(stats.active)} tone="green" />
        <KPI icon={AlertTriangle} title="Expired" value={loading ? "..." : String(stats.expired)} tone="red" />
      </div>

      {/* Filters */}
      <div className="mt-1 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by contract number..."
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

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Table Panel */}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.06] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute -inset-[1px] rounded-2xl shadow-[0_0_70px_rgba(120,170,255,0.14)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />

        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-white text-lg font-semibold">AMC Contracts</h2>
              <p className="text-white/60 text-sm">
                {loading ? "Loading contracts..." : `Showing ${amcs.length} contract(s)`}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 h-11 rounded-2xl bg-black/30 border border-white/10 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <CalendarDays size={16} className="text-white/60" />
              <span className="text-white/60 text-sm">Coverage</span>
              <span className="font-semibold">Tracking</span>
            </div>
          </div>

          {loading && <AMCSkeleton />}

          {!loading && amcs.length === 0 && (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-10 text-center">
              <div className="text-white text-lg font-semibold">No AMC records found</div>
              <div className="text-white/60 text-sm mt-2">
                Click <span className="text-white/80 font-semibold">Create AMC</span> to add your first contract.
              </div>
            </div>
          )}

          {!loading && amcs.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse">
                  <thead>
                    <tr className="text-white/60 text-sm">
                      <TH>#</TH>
                      <TH>Contract No.</TH>
                      <TH>Customer</TH>
                      <TH>Status</TH>
                      <TH>Start</TH>
                      <TH>End</TH>
                      <TH>Document</TH>
                      <TH>Actions</TH>

                      <TH className="text-right">Actions</TH>
                    </tr>
                  </thead>

                  <tbody className="text-white/90 text-sm">
                    {amcs.map((a, idx) => {
                      const doc = a?.amcDocumentUrl || "";
                      const fullDoc = doc ? `http://localhost:5000${doc}` : "";

                      return (
                        <tr key={a._id} className="border-t border-white/10 hover:bg-white/[0.04] transition">
                          <TD className="text-white/55 font-semibold">{idx + 1}</TD>

                          <TD className="font-semibold text-white/90">
                            <div className="flex items-center gap-2">
                              <Hash size={14} className="text-white/40" />
                              {a.contractNumber || "—"}
                            </div>
                          </TD>

                          <TD>
                            <div className="flex items-center gap-2 text-white/85">
                              <User2 size={15} className="text-white/55" />
                              <div className="flex flex-col">
                                <span className="font-semibold">{a.customer?.name || "Unknown"}</span>
                                <span className="text-white/45 text-xs">{a.customer?.email || "—"}</span>
                              </div>
                            </div>
                          </TD>

                          <TD>
                            <StatusChip value={a.status || "unknown"} />
                          </TD>

                          <TD className="text-white/80">{formatDate(a.startDate)}</TD>
                          <TD className="text-white/80">{formatDate(a.endDate)}</TD>

                          {/* Document */}
                          <TD>
                            {!fullDoc ? (
                              <span className="text-white/35 text-xs">No doc</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <a
                                  href={fullDoc}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs inline-flex items-center gap-2 transition"
                                  title="View document"
                                >
                                  <Eye size={14} />
                                  View
                                </a>

                                {/* ✅ Force download */}
                                <button
  onClick={() => handleAdminDownload(a)}
  disabled={!a?.amcDocumentUrl}
  className={`h-9 px-4 rounded-full border text-xs transition inline-flex items-center gap-2
    ${
      a?.amcDocumentUrl
        ? "bg-emerald-500/15 hover:bg-emerald-500/20 border-emerald-400/20 text-emerald-200"
        : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
    }`}
>
  <Download size={14} />
  Download
</button>


                              </div>
                            )}
                          </TD>

                          {/* Actions */}
                          <TD className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openUploadModal(a)}
                                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs inline-flex items-center gap-2 transition"
                              >
                                <Upload size={14} />
                                Upload
                              </button>

                              <button
                                onClick={() => {
                                  const ok = window.confirm("Delete this AMC contract?");
                                  if (ok) deleteAMC(a._id);
                                }}
                                disabled={deletingId === a._id}
                                className={`h-9 px-3 rounded-xl border text-xs inline-flex items-center gap-2 transition
                                ${
                                  deletingId === a._id
                                    ? "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
                                    : "bg-red-500/10 hover:bg-red-500/20 border-red-400/20 text-red-200"
                                }`}
                              >
                                <Trash2 size={14} />
                                {deletingId === a._id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          </TD>

                          <TD>
  <div className="flex items-center gap-2">
    {a.status !== "expired" && (
      <>
        {a.status === "active" ? (
          <button
            onClick={() => updateStatus(a._id, "suspended")}
            className="px-3 py-1 rounded-full text-xs font-semibold
            bg-yellow-500/20 text-yellow-200 border border-yellow-400/30
            hover:bg-yellow-500/30 transition"
          >
            Suspend
          </button>
        ) : (
          <button
            onClick={() => updateStatus(a._id, "active")}
            className="px-3 py-1 rounded-full text-xs font-semibold
            bg-emerald-500/20 text-emerald-200 border border-emerald-400/30
            hover:bg-emerald-500/30 transition"
          >
            Activate
          </button>
        )}
      </>
    )}
  </div>
</TD>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="text-white/60 text-sm">
                  Showing <span className="text-white/85">{fromCount}</span> –{" "}
                  <span className="text-white/85">{toCount}</span> of{" "}
                  <span className="text-white/85">{total}</span> contracts
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

      {/* Create Modal */}
      {openCreate && (
        <CreateAMCModal
          creating={creating}
          error={createError}
          form={form}
          setForm={setForm}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Upload Modal */}
      {openUpload && (
        <UploadAMCModal
          uploading={uploading}
          error={uploadError}
          amc={selectedAMC}
          file={docFile}
          setFile={setDocFile}
          onClose={() => {
            if (!uploading) {
              setOpenUpload(false);
              setSelectedAMC(null);
              setDocFile(null);
              setUploadError("");
            }
          }}
          onSubmit={handleUploadDocument}
        />
      )}
    </div>
  );
}

/* ---------------- Upload Modal ---------------- */

function UploadAMCModal({ uploading, error, amc, file, setFile, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-[620px] overflow-hidden rounded-2xl bg-[#0b1220]/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-80" />

        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-white font-extrabold text-lg">Upload AMC Document</div>
            <div className="text-white/45 text-xs mt-1">
              Contract: <span className="text-white/75">{amc?.contractNumber || amc?._id}</span>
            </div>
          </div>

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

          <label className="text-white/70 text-sm">Select PDF Document</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 w-full rounded-2xl bg-black/55 border border-white/10 text-white p-3"
          />

          {file && (
            <div className="mt-3 text-white/60 text-xs">
              Selected: <span className="text-white/85 font-semibold">{file.name}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="h-11 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={uploading || !file}
              className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
              bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
              ${uploading || !file ? "opacity-40 cursor-not-allowed" : "hover:opacity-[0.92]"}`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Create Modal ---------------- */

function CreateAMCModal({ creating, error, form, setForm, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-[720px] overflow-hidden rounded-2xl bg-[#0b1220]/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.75)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-80" />

        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-extrabold text-lg">Create AMC Contract</div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Customer ID (Mongo ObjectId)*"
              placeholder="Paste customer _id"
              value={form.customer}
              onChange={(v) => setForm((p) => ({ ...p, customer: v }))}
            />

            <Field
              label="Contract Number*"
              placeholder="AMC-2026-0001"
              value={form.contractNumber}
              onChange={(v) => setForm((p) => ({ ...p, contractNumber: v }))}
            />

            <Field
              label="Start Date*"
              type="date"
              value={form.startDate}
              onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
            />

            <Field
              label="End Date*"
              type="date"
              value={form.endDate}
              onChange={(v) => setForm((p) => ({ ...p, endDate: v }))}
            />

            <SelectField
              label="Status"
              value={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              options={[
                { label: "Active", value: "active" },
                { label: "Expired", value: "expired" },
                { label: "Suspended", value: "suspended" },
              ]}
            />

            <Field
              label="Covered Services (comma separated)"
              placeholder="inspection, repair, replacement"
              value={form.coveredServices}
              onChange={(v) => setForm((p) => ({ ...p, coveredServices: v }))}
            />
          </div>

          <div className="mt-4">
            <label className="text-white/65 text-sm">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Optional notes..."
              className="mt-2 w-full h-24 px-4 py-3 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
              focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] resize-none"
            />
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
              disabled={creating}
              className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
              bg-[linear-gradient(270deg,#c7d2fe_0%,#6366f1_55%,#312e81_100%)]
              ${creating ? "opacity-50 cursor-not-allowed" : "hover:opacity-[0.92]"}`}
            >
              {creating ? "Creating..." : "Create AMC"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Small UI Components ---------------- */

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-white/65 text-sm">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-white/65 text-sm">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-12 px-4 rounded-2xl bg-black/55 border border-white/10 text-white outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] appearance-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0b1220]">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function KPI({ icon: Icon, title, value, tone }) {
  const theme =
    tone === "indigo"
      ? "bg-[linear-gradient(270deg,#c7d2fe_0%,#6366f1_55%,#312e81_100%)]"
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

function TH({ children, className = "" }) {
  return (
    <th className={`text-left py-3 px-4 font-semibold tracking-wide ${className}`}>
      {children}
    </th>
  );
}

function TD({ children, className = "" }) {
  return <td className={`py-4 px-4 ${className}`}>{children}</td>;
}

function PillSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 pr-10 rounded-xl bg-black/55 border border-white/10 text-white outline-none
        focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
        appearance-none cursor-pointer"
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

function AMCSkeleton() {
  return (
    <div className="rounded-2xl bg-black/25 border border-white/10 p-6">
      <div className="h-4 w-[240px] rounded bg-white/10 animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
