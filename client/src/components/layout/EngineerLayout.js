import EngineerSidebar from "../sidebar/EngineerSidebar";
import Topbar from "../topbar/Topbar";

export default function EngineerLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#05070f] text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_25%_15%,rgba(34,197,94,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(720px_520px_at_85%_25%,rgba(56,189,248,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.70)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen p-4 md:p-6">

        {/* Sidebar */}
        <EngineerSidebar />

<div className="flex-1 flex flex-col min-w-0 ml-4 md:ml-6">

          {/* Topbar */}
          <div className="sticky top-0 z-20">
            <Topbar />
          </div>

          {/* Page Content */}
          <main className="flex-1 min-w-0">
  <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-8">
    {children}
  </div>

  <div className="mt-10 pb-2">
                  <div className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),transparent_55%)] opacity-70" />
                    <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 rounded-full bg-white/8 blur-3xl opacity-70" />

                    <div className="relative z-10 flex items-center justify-between text-xs text-white/45">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-[6px] w-[6px] rounded-full bg-white/35" />
                        <span>
                          © {new Date().getFullYear()} Siddhi Khaire • ServiCore 
                          
                        </span>
                      </div>

                      <div className="text-white/35">Internship Project</div>
                    </div>
                  </div>
                </div>
</main>

        </div>
      </div>
    </div>
  );
}
