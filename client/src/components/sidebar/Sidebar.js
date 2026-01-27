import {
  LayoutDashboard,
  Ticket,
  ShieldCheck,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) => {
    // exact active (dashboard)
    if (to === "/admin/dashboard") {
      return location.pathname === "/admin/dashboard";
    }

    // nested route active support (tickets/:id etc.)
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  const Item = ({ icon: Icon, label, to }) => {
    const active = isActive(to);

    return (
      <button
        onClick={() => navigate(to)}
        className={`group relative w-full flex items-center gap-3 h-[50px] px-3 rounded-2xl text-left transition
        ${
          active
            ? "bg-white/10 text-white shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            : "text-white/70 hover:bg-white/[0.06]"
        }`}
      >
        {/* Active rail */}
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-orange-400 rounded-full" />
        )}

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition
          ${
            active
              ? "bg-white/10 border-white/20"
              : "bg-white/5 border-white/10 group-hover:bg-white/10"
          }`}
        >
          <Icon size={20} strokeWidth={2.2} className="text-white/90" />
        </div>

        <span className="font-semibold tracking-wide text-[14px]">{label}</span>

        {/* Active glow */}
        {active && (
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-80" />
        )}
      </button>
    );
  };

  return (
    <aside className="relative w-[260px] px-4 py-6 flex flex-col bg-white/[0.02] backdrop-blur-xl border-r border-white/10 overflow-hidden">
      {/* subtle sidebar glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_20%_20%,rgba(125,211,252,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* BRAND */}
      <div className="relative z-10 flex items-center gap-3 mb-8 px-2">
        <div className="w-4 h-4 rounded bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.35)]" />
        <div>
          <div className="text-white font-extrabold text-[16px] tracking-tight">
            ServiCore
          </div>
          <div className="text-white/40 text-xs -mt-0.5">
            Ticket & AMC System
          </div>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="relative z-10 space-y-2">
        <Item icon={LayoutDashboard} label="Dashboard" to="/admin/dashboard" />
        <Item icon={Ticket} label="Tickets" to="/admin/tickets" />
        <Item icon={ShieldCheck} label="AMC" to="/admin/amc" />
        <Item icon={BarChart3} label="Reports" to="/admin/reports" />
      </div>

      {/* Divider */}
      <div className="relative z-10 my-6 h-px w-full bg-white/10" />

      {/* BOTTOM MENU */}
      <div className="relative z-10 mt-auto space-y-2">
        {/* ✅ FIXED: Admin Help route */}
        <Item icon={HelpCircle} label="Help" to="/admin/help" />
      </div>

      <div className="relative z-10 mt-6 px-2 text-xs text-white/35">
        SIDDHI KHAIRE
      </div>
    </aside>
  );
}
