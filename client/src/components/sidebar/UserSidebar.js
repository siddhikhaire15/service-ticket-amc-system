import {
  LayoutDashboard,
  Ticket,
  User,
  Settings,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";


export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const mainNav = [
    { name: "Dashboard", icon: LayoutDashboard, to: "/user/dashboard" },
    { name: "My Tickets", icon: Ticket, to: "/user/tickets" },
    { name: "My AMC", icon: ShieldCheck, to: "/user/amc" },
     { name: "Profile", icon: User, to: "/user/profile" },

  ];

  const bottomNav = [
    
    { name: "Help", icon: HelpCircle, to: "/user/help" },
  ];

  const Item = ({ icon: Icon, label, to }) => {
    const active = location.pathname === to;

    return (
      <div
        onClick={() => navigate(to)}
        className={`relative flex items-center gap-3 h-12 px-3 rounded-xl cursor-pointer transition
        ${
          active
            ? "bg-white/10 text-white"
            : "text-white/70 hover:bg-white/5"
        }`}
      >
        {active && (
          <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-orange-400 rounded-full" />
        )}

        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center
          ${
            active
              ? "bg-white/10 border-white/20"
              : "bg-white/5 border-white/10"
          }`}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>

        <span className="font-medium">{label}</span>
      </div>
    );
  };

  return (
    <aside
      className="relative w-[260px] h-full px-4 py-5 flex flex-col
      bg-black/30 backdrop-blur-xl border-r border-white/10
      shadow-[0_0_60px_rgba(120,170,255,0.10)]"

    >
      {/* Bottom Glow */}
<div className="pointer-events-none absolute bottom-[-120px] left-[-80px] h-[320px] w-[320px] rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_400px_at_0%_10%,rgba(110,170,255,0.18),transparent_60%)]" />
      
      {/* BRAND */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-4 h-4 rounded bg-orange-400 shadow-[0_0_25px_rgba(255,140,60,0.60)]" />
        <div>
          <div className="text-white font-semibold text-lg">ServiCore</div>
          <div className="text-white/35 text-xs -mt-[2px]">
            Ticket & AMC System
          </div>
        </div>
      </div>

      {/* MAIN MENU */}
      <div className="space-y-1">
        {mainNav.map((item) => (
          <Item
            key={item.to}
            icon={item.icon}
            label={item.name}
            to={item.to}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="mt-6 mb-5 border-t border-white/10" />

      {/* BOTTOM MENU (Keep simple + premium like admin) */}
      <div className="mt-auto space-y-1">
        {bottomNav.map((item) => (
          <Item
            key={item.to}
            icon={item.icon}
            label={item.name}
            to={item.to}
          />
        ))}

        <div className="pt-6 text-white/30 text-[11px] px-1">
          Siddhi Khaire
        </div>
      </div>
    </aside>
  );
}
