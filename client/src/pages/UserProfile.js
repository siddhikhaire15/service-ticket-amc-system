import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import {
  User,
  Mail,
  ShieldCheck,
  Save,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";


export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
  });

  // password section
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const roleLabel = useMemo(() => {
    const r = String(user?.role || "").toLowerCase();
    if (r === "admin") return "Admin";
    if (r === "engineer") return "Engineer";
    return "Customer";
  }, [user?.role]);

  const canSave = useMemo(() => {
    return form.name.trim().length >= 2;
  }, [form.name]);

  const canChangePassword = useMemo(() => {
    return (
      pwForm.currentPassword.trim().length >= 1 &&
      pwForm.newPassword.trim().length >= 6
    );
  }, [pwForm.currentPassword, pwForm.newPassword]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.get("/users/me");
      const u = res.data?.user;

      setUser(u || null);
      setForm({ name: u?.name || "" });

      // keep localStorage name synced for Topbar
      if (u?.name) localStorage.setItem("name", u.name);
    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load profile.");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = { name: form.name.trim() };

      const res = await api.patch("/users/me", payload);
      const updated = res.data?.user;

      setUser(updated);
      setSuccess("Profile updated successfully");

      if (updated?.name) localStorage.setItem("name", updated.name);
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    try {
      setPwSaving(true);

      await api.patch("/users/me/password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });

      setPwSuccess("Password updated successfully");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.log("CHANGE PASSWORD ERROR:", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password";

      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
    }

    return (
      <div className="w-full">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-7">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                <User size={22} className="text-white/90" />
              </div>

              <div>
                <h1 className="text-white text-[38px] leading-[1.05] font-extrabold tracking-tight">
                  Profile
                </h1>
                <div className="mt-1 h-[3px] w-20 rounded-full bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)] opacity-90" />
              </div>
            </div>

            <p className="text-white/65 mt-3 max-w-[760px] text-[15px] leading-relaxed">
              Update your personal details and keep your account secure.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
          {/* Profile Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

            <div className="relative z-10 p-6">
              <div className="text-white text-lg font-semibold">Account Details</div>
              <div className="text-white/60 text-sm mt-1">
                Manage your name and view account info
              </div>
              
              {/* Status */}
              {error && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-[1px]" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-200 text-sm flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-[1px]" />
                  {success}
                </div>
              )}

              {/* Loading */}
              {loading ? (
                <div className="mt-6 space-y-3">
                  <div className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                  <div className="h-11 rounded-2xl bg-white/5 animate-pulse" />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                  <Field
                    label="Name"
                    icon={User}
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    placeholder="Enter your full name"
                  />

                  <Field
                    label="Email"
                    icon={Mail}
                    value={user?.email || "—"}
                    disabled
                  />

                  <Field
                    label="Role"
                    icon={ShieldCheck}
                    value={roleLabel}
                    disabled
                  />

                  <button
                    type="submit"
                    disabled={saving || !canSave}
                    className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
                  bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
                  ${saving || !canSave
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:opacity-[0.92]"
                      } inline-flex items-center gap-2`}
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Password Card */}
          <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

            <div className="relative z-10 p-6">
              <div className="text-white text-lg font-semibold">Security</div>
              <div className="text-white/60 text-sm mt-1">
                Change your password securely
              </div>

              {pwError && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm flex items-start gap-3">
                  <AlertTriangle size={18} className="mt-[1px]" />
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-emerald-200 text-sm flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-[1px]" />
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                <PasswordField
                  label="Current Password"
                  value={pwForm.currentPassword}
                  onChange={(v) =>
                    setPwForm((p) => ({ ...p, currentPassword: v }))
                  }
                  show={showPw}
                />

                <PasswordField
                  label="New Password"
                  value={pwForm.newPassword}
                  onChange={(v) =>
                    setPwForm((p) => ({ ...p, newPassword: v }))
                  }
                  show={showPw}
                />

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="h-10 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 text-sm transition inline-flex items-center gap-2"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPw ? "Hide" : "Show"}
                  </button>

                  <button
                    type="submit"
                    disabled={pwSaving || !canChangePassword}
                    className={`h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)] transition
                  bg-[linear-gradient(270deg,#86efac_0%,#16a34a_58%,#064e3b_100%)]
                  ${pwSaving || !canChangePassword
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:opacity-[0.92]"
                      } inline-flex items-center gap-2`}
                  >
                    <Lock size={16} />
                    {pwSaving ? "Updating..." : "Change Password"}
                  </button>
                </div>

                {!canChangePassword && (
                  <div className="text-white/40 text-xs">
                    New password must be at least 6 characters.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Small UI Components ---------------- */

  function Field({ label, icon: Icon, value, onChange, placeholder, disabled }) {
    return (
      <div>
        <label className="text-white/65 text-sm">{label}</label>

        <div className="mt-2 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
            <Icon size={16} />
          </div>

          <input
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className={`w-full h-12 pl-11 pr-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
          focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
          ${disabled ? "opacity-70 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>
    );
  }

  function PasswordField({ label, value, onChange, show }) {
    return (
      <div>
        <label className="text-white/65 text-sm">{label}</label>

        <div className="mt-2 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45">
            <Lock size={16} />
          </div>

          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-black/55 border border-white/10 text-white placeholder:text-white/45 outline-none
          focus:border-white/20 focus:bg-black/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          />

        </div>
      </div>
    );
  }
