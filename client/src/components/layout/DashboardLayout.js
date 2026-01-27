import Sidebar from "../sidebar/Sidebar";
import Topbar from "../topbar/Topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#070B12]">
      <div className="min-h-screen w-full p-3">
        <div className="relative w-full h-[calc(100vh-24px)] rounded-[22px] overflow-hidden border border-white/10 bg-[#0b1220] shadow-[0_30px_90px_rgba(0,0,0,0.80)]">
          {/* ✅ BACKGROUND EFFECTS (same as your AdminDashboard) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a111c,#0c1524,#0a111c)]" />

            <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_96%_6%,rgba(110,170,255,0.22),transparent_62%)] opacity-100" />
            <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_92%_18%,rgba(255,255,255,0.10),transparent_65%)] opacity-70" />

            <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_45%_18%,rgba(255,255,255,0.14),transparent_62%)] opacity-100" />

            <div
              className="absolute right-0 top-0 h-full w-[55%] opacity-100"
              style={{
                backgroundImage: `
                  linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%),
                  linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%),
                  linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 62%)
                `,
                backgroundSize: "360px 360px, 540px 540px, 760px 760px",
                backgroundPosition: "100% 0%, 92% 14%, 82% 28%",
                backgroundRepeat: "no-repeat",
                mixBlendMode: "overlay",
              }}
            />

            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.30) 1px, transparent 1px)",
                backgroundSize: "3px 3px",
                backgroundPosition: "0 0",
                mixBlendMode: "soft-light",
              }}
            />

            <div className="absolute left-0 bottom-0 h-[35%] w-full bg-[radial-gradient(800px_260px_at_45%_100%,rgba(255,120,60,0.14),transparent_70%)] opacity-65" />

            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.60)_100%)]" />
          </div>

          <div className="relative z-10 flex h-full">
            <Sidebar />

            <div className="flex-1 flex flex-col">
              <Topbar />

              <main className="flex-1 overflow-y-auto px-8 py-6">
                {/* ✅ Page Content */}
                {children}

                {/* ✅ PREMIUM FOOTER (Glass Strip) */}
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
                {/* ✅ END FOOTER */}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
