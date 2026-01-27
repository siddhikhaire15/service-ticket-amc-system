import { HelpCircle, Ticket, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserHelp() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
              <HelpCircle size={22} className="text-white/90" />
            </div>

            <div>
              <h1 className="text-white text-[36px] leading-[1.05] font-extrabold tracking-tight">
                Help & Support
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#fbbf24_0%,#ea580c_52%,#7c2d12_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[760px] text-[15px] leading-relaxed">
            Quick guidance to raise tickets correctly and track service updates.
          </p>
        </div>
      </div>

      {/* Help Cards */}
      <div className="mt-7 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <HelpCard
          icon={Ticket}
          title="How to create a ticket?"
          desc="Go to My Tickets → Create Ticket. Add clear title, detailed description, and correct priority."
        />

        <HelpCard
          icon={ShieldCheck}
          title="Ticket status flow"
          desc="Your ticket moves Open → In Progress → Resolved → Closed. Engineers update logs while working."
        />

        <HelpCard
          icon={Mail}
          title="Need more support?"
          desc="If your issue is urgent, create a High priority ticket with full details so engineers can respond faster."
        />
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/user/tickets")}
          className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
          transition hover:opacity-[0.92]
          bg-[linear-gradient(270deg,#7dd3fc_0%,#1d4ed8_55%,#0b1f4d_100%)]
          inline-flex items-center gap-2"
        >
          Open My Tickets
        </button>

        <button
          onClick={() => navigate("/user/dashboard")}
          className="h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
          shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition"
        >
          Back to Overview
        </button>
      </div>
    </div>
  );
}

function HelpCard({ icon: Icon, title, desc }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_58%,rgba(0,0,0,0.55)_100%)] opacity-55" />

      <div className="relative z-10 p-6">
        <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
          <Icon size={20} className="text-white/85" />
        </div>

        <div className="mt-4 text-white font-semibold text-lg">{title}</div>
        <div className="mt-2 text-white/60 text-sm leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}
