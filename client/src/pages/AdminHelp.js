import {
  HelpCircle,
  Ticket,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHelp() {
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
                Admin Help
              </h1>
              <div className="mt-1 h-[3px] w-24 rounded-full bg-[linear-gradient(270deg,#a78bfa_0%,#4f46e5_55%,#0b1f4d_100%)] opacity-90" />
            </div>
          </div>

          <p className="text-white/65 mt-3 max-w-[760px] text-[15px] leading-relaxed">
            Quick guidance for managing tickets, assigning engineers, reviewing AMC
            records, and keeping operations smooth.
          </p>
        </div>
      </div>

      {/* Help Cards */}
      <div className="mt-7 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <HelpCard
          icon={Ticket}
          title="Ticket workflow overview"
          desc="Tickets follow the enforced flow: Open → In Progress → Resolved → Closed. Engineers update service logs during work."
        />

        <HelpCard
          icon={Users}
          title="Engineer assignment rules"
          desc="Engineers can only access tickets assigned to them. If an engineer sees Access Denied, assign the ticket first."
        />

        <HelpCard
          icon={ShieldCheck}
          title="Role-based access"
          desc="Admin has full access. Engineers see only assigned tickets. Customers see only their own tickets and status updates."
        />

        <HelpCard
          icon={FileText}
          title="AMC management"
          desc="AMC records should be reviewed regularly for renewals, expiry, and customer coverage. Keep AMC data updated and consistent."
        />

        <HelpCard
          icon={AlertTriangle}
          title="Priority handling"
          desc="High-priority tickets should be reviewed first. Ensure detailed issue description and assign an engineer quickly."
        />

        <HelpCard
          icon={ArrowRight}
          title="Best practice operations"
          desc="Keep ticket descriptions clean, assign early, track logs, and close tickets only after confirmation/testing is complete."
        />
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/tickets")}
          className="h-11 px-5 rounded-2xl text-white text-sm font-semibold shadow-[0_14px_30px_rgba(0,0,0,0.40)]
          transition hover:opacity-[0.92]
          bg-[linear-gradient(270deg,#a78bfa_0%,#4f46e5_55%,#0b1f4d_100%)]
          inline-flex items-center gap-2"
        >
          Open Tickets
        </button>

        <button
          onClick={() => navigate("/admin/dashboard")}
          className="h-11 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm
          shadow-[0_12px_25px_rgba(0,0,0,0.35)] transition"
        >
          Back to Dashboard
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
