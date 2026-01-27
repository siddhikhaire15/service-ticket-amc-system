import { useState } from "react";
import { X, ImageIcon, ExternalLink } from "lucide-react";

export default function AttachmentViewer({ attachmentUrl }) {
  const [open, setOpen] = useState(false);

  if (!attachmentUrl) {
    return (
      <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="text-white/55 text-xs">Attachment</div>
        <div className="mt-2 text-white/70 text-sm">No attachment uploaded.</div>
      </div>
    );
  }

  const fullUrl = `http://localhost:5000${attachmentUrl}`;

  return (
    <>
      {/* ✅ Premium Small Preview */}
      <div className="mt-5 rounded-2xl bg-black/30 border border-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <ImageIcon size={16} className="text-white/70" />
            </div>

            <div>
              <div className="text-white/70 text-sm font-semibold">Attachment</div>
              <div className="text-white/45 text-xs">Click preview to open full</div>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs
            shadow-[0_10px_20px_rgba(0,0,0,0.35)] transition"
          >
            View
          </button>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:bg-white/[0.04] transition
          shadow-[0_18px_45px_rgba(0,0,0,0.50)]"
          title="Click to open full image"
        >
          <img
            src={fullUrl}
            alt="Ticket Attachment"
            className="w-full h-[140px] object-cover"
          />
        </button>
      </div>

      {/* ✅ Premium Modal */}
      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-full max-w-[980px] rounded-2xl overflow-hidden border border-white/10 bg-[#0b1220]/95 shadow-[0_40px_100px_rgba(0,0,0,0.85)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="text-white font-semibold text-sm">
                Ticket Attachment Preview
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs transition inline-flex items-center gap-2"
                >
                  <ExternalLink size={14} />
                  Open Tab
                </a>

                <button
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center transition"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 bg-black/35">
              <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                <img
                  src={fullUrl}
                  alt="Full Attachment"
                  className="w-full max-h-[75vh] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
