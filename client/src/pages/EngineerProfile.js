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



export default function EngineerProfile() {
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

  /* ---------------- Helpers ---------------- */

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

  /* ---------------- API ---------------- */

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await api.get("/users/me");
      const u = res.data?.user;

      setUser(u || null);
      setForm({ name: u?.name || "" });

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

  /* ---------------- Actions ---------------- */

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
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password";
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  /* ---------------- Render ---------------- */
  



  if (loading) return null;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-6 mb-7">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <User size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[36px] font-extrabold">Profile</h1>
              <div className="mt-1 h-[3px] w-20 rounded-full bg-blue-600" />
            </div>
          </div>

          <p className="text-white/65 mt-3 text-sm">
            Manage your personal details and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
        {/* Profile */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-white font-semibold">Account Details</div>

          {error && (
            <div className="mt-4 text-red-300 text-sm flex gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {success && (
            <div className="mt-4 text-green-300 text-sm flex gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
            
            

            <Field
              label="Name"
              icon={User}
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
            />

            <Field label="Email" icon={Mail} value={user?.email} disabled />
            <Field label="Role" icon={ShieldCheck} value={roleLabel} disabled />

            <button
              type="submit"
              disabled={!canSave || saving}
              className="h-11 px-5 rounded-xl bg-blue-600 text-white flex items-center gap-2 disabled:opacity-40"
            >
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="text-white font-semibold">Security</div>

          {pwError && <div className="mt-4 text-red-300 text-sm">{pwError}</div>}
          {pwSuccess && (
            <div className="mt-4 text-green-300 text-sm">{pwSuccess}</div>
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
                className="text-sm text-white/70 flex items-center gap-2"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPw ? "Hide" : "Show"}
              </button>

              <button
                type="submit"
                disabled={!canChangePassword || pwSaving}
                className="h-11 px-5 rounded-xl bg-green-600 text-white flex items-center gap-2 disabled:opacity-40"
              >
                <Lock size={16} />
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Small Components ---------------- */

function Field({ label, icon: Icon, value, onChange, disabled }) {
  return (
    <div>
      <label className="text-white/60 text-sm">{label}</label>
      <div className="mt-2 relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
          <Icon size={16} />
        </div>
        <input
          value={value || ""}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/60 border border-white/10 text-white disabled:opacity-60"
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show }) {
  return (
    <div>
      <label className="text-white/60 text-sm">{label}</label>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 mt-2 px-4 rounded-xl bg-black/60 border border-white/10 text-white"
      />
    </div>
  );
}
