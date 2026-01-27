import { LayoutDashboard, Ticket, HelpCircle, User2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserName } from "../../utils/auth";
import { Wrench } from "lucide-react";

export default function EngineerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = getUserName();

  // ✅ Active highlight supports nested routes like /engineer/tickets/:id
  const isActive = (to) => {
    if (to === "/engineer/dashboard") {
      return location.pathname === "/engineer/dashboard";
    }
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
          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-emerald-400 rounded-full" />
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
      {/* Subtle sidebar glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_20%_20%,rgba(134,239,172,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      </div>

      {/* BRAND */}
      <div className="relative z-10 flex items-center gap-3 mb-8 px-2">
        <div className="w-4 h-4 rounded bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.35)]" />
        <div>
          <div className="text-white font-extrabold text-[16px] tracking-tight">
            ServiCore
          </div>
          <div className="text-white/40 text-xs -mt-0.5">Engineer Panel</div>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="relative z-10 space-y-2">
        <Item icon={LayoutDashboard} label="Dashboard" to="/engineer/dashboard" />
        <Item icon={Ticket} label="Work Queue" to="/engineer/tickets" />
        <Item icon={User2} label="Profile" to="/engineer/profile" />
        


      </div>

      {/* Divider */}
      <div className="relative z-10 my-6 h-px w-full bg-white/10" />

      {/* BOTTOM MENU */}
      <div className="relative z-10 mt-auto space-y-2">
        <Item icon={HelpCircle} label="Help" to="/engineer/help" />
      </div>

     <div className="relative z-10 mt-6 px-2 text-xs text-white/35">
        SIDDHI KHAIRE
      </div>
      
    </aside>
  );
}
