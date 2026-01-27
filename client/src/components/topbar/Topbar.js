import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { getUserRole, logout } from "../../utils/auth";
import NotificationBell from "../NotificationBell";
import { getAvatarUrl } from "../../utils/avatar";

export default function Topbar() {
  const navigate = useNavigate();
  const role = getUserRole();

  const username = useMemo(() => {
    const stored = localStorage.getItem("name");
    if (stored && stored.trim()) return stored.trim();

    const r = String(role || "").toLowerCase();
    if (r === "admin") return "Admin";
    if (r === "engineer") return "Engineer";
    return "Customer";
  }, [role]);

  const initials = useMemo(() => {
    const n = String(username || "").trim();
    if (!n) return "U";
    const parts = n.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [username]);

  const roleLabel = useMemo(() => {
    const r = String(role || "").toLowerCase();
    if (r === "admin") return "Admin Panel";
    if (r === "engineer") return "Engineer Console";
    return "User Portal";
  }, [role]);

  

  const handleLogout = () => {
    logout();
    localStorage.removeItem("name");
    navigate("/", { replace: true }); // ✅ correct for your App.js
  };

  return (
    <header className="relative h-[74px] w-full px-6 flex items-center justify-between border-b border-white/10 bg-white/[0.02] backdrop-blur-xl">
      {/* subtle topbar glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(125,211,252,0.06),transparent_40%,rgba(34,211,238,0.05))]" />
        <div className="absolute inset-0 bg-[radial-gradient(420px_140px_at_10%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      {/* LEFT */}
      <div className="relative z-10 flex flex-col">
        <div className="text-white text-[18px] font-extrabold tracking-tight">
          {roleLabel}
        </div>
        <div className="text-white/45 text-xs mt-0.5">
          Welcome,{" "}
          <span className="text-white/80 font-semibold">{username}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex items-center gap-3">
        <NotificationBell />

      

        {/* Avatar (clean premium) */}
        {/* Avatar */}
<div
  className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10
             flex items-center justify-center overflow-hidden"
  title={username}
>
  <img
    src={getAvatarUrl(localStorage.getItem("email"))}
    alt="avatar"
    className="w-9 h-9 rounded-xl"
  />
</div>



        {/* Logout */}
        <button
          onClick={handleLogout}
          className="h-11 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 text-red-200 text-sm font-semibold transition
          shadow-[0_12px_25px_rgba(0,0,0,0.35)] inline-flex items-center gap-2"
          title="Logout"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
