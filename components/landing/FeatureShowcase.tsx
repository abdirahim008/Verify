import { ProfileThumb } from "@/components/templates/CvThumbnails";
import { WadaniThumb } from "@/components/templates/CompanyThumbnails";

// "What you'll create" — faithful, code-drawn mocks of the three things a
// Sahan account produces, so logged-out visitors see the payoff before they
// sign up. The CV + company mocks reuse the SAME thumbnail components shown in
// the in-app download chooser; the business card mock mirrors
// components/cv/BusinessCard.tsx (which is server-only and data-heavy, so it
// can't render directly here).
export function FeatureShowcase() {
  return (
    <section id="build" className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-14 sm:pt-20 pb-4">
        <p className="section-eyebrow text-sienna">What you&apos;ll create</p>
        <h2 className="font-serif text-[28px] sm:text-[40px] tracking-[-0.02em] mt-3 max-w-2xl leading-[1.12]">
          One profile, every format your sector needs.
        </h2>
        <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-ink-soft max-w-xl leading-relaxed">
          Fill it in once. Export an elegant CV, a bid-ready company profile, or a shareable digital business card — all from the same profile.
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Tile kind="For individuals" label="An elegant CV" desc="A4, print-clean, in eight editorial templates — download in a tap.">
            <div className="drop-shadow-[0_12px_28px_rgba(0,0,0,0.16)]"><ProfileThumb /></div>
          </Tile>

          <Tile kind="For organisations" label="A company profile" desc="Bid-ready cover, mission, selected projects and team — straight into your tender pack.">
            <div className="drop-shadow-[0_12px_28px_rgba(0,0,0,0.16)]"><WadaniThumb /></div>
          </Tile>

          <Tile kind="Share anywhere" label="A digital business card" desc="A landscape card with a QR that opens your live, always-current profile.">
            <BusinessCardMock />
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ kind, label, desc, children }: { kind: string; label: string; desc: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-border bg-paper overflow-hidden flex flex-col">
      <div className="h-60 flex items-center justify-center bg-[#f1ede4] px-4">{children}</div>
      <div className="p-5 flex-1 flex flex-col">
        <p className="text-[10.5px] uppercase tracking-[0.14em] text-sienna font-semibold">{kind}</p>
        <h3 className="font-serif text-[19px] tracking-tightish mt-1.5">{label}</h3>
        <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{desc}</p>
      </div>
    </article>
  );
}

// Static landscape mock of components/cv/BusinessCard.tsx — left accent panel
// (identity + contact), right panel (QR + scan prompt + wordmark).
function BusinessCardMock() {
  const ACCENT = "#173655";
  return (
    <div
      className="flex overflow-hidden"
      style={{ width: 300, borderRadius: 16, background: "#fff", boxShadow: "0 14px 36px rgba(0,0,0,0.18)", fontFamily: "system-ui, sans-serif" }}
    >
      {/* Left: identity + contact */}
      <div style={{ flex: 1.35, background: ACCENT, padding: "16px 15px", display: "flex", flexDirection: "column", color: "#fff" }}>
        <div className="flex items-center">
          <div style={{ width: 30, height: 30, borderRadius: "50%", border: "1.4px solid rgba(255,255,255,0.32)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Source Serif 4, Georgia, serif", fontWeight: 600, fontSize: 12 }}>AM</div>
        </div>
        <div style={{ marginTop: 12, fontFamily: "Source Serif 4, Georgia, serif", fontWeight: 600, fontSize: 16, lineHeight: 1.1 }}>Abdirahim M.</div>
        <div style={{ marginTop: 3, fontSize: 8, fontWeight: 600 }}>Senior Health Coordinator</div>
        <div style={{ fontSize: 7.5, color: "rgba(255,255,255,0.72)" }}>UNICEF Somalia</div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7, paddingTop: 14 }}>
          <Row icon="@" label="Email" value="abdirahim@example.so" accent={ACCENT} />
          <Row icon="☎" label="Phone" value="+252 61 234 5678" accent={ACCENT} />
        </div>
      </div>
      {/* Right: QR + prompt */}
      <div style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <FauxQr />
        <div style={{ marginTop: 9, fontFamily: "Source Serif 4, Georgia, serif", fontWeight: 600, fontSize: 10, color: "#16130f" }}>Scan to view profile</div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #efedea", width: "100%", fontFamily: "Source Serif 4, Georgia, serif", fontWeight: 700, fontSize: 9, color: "#16130f" }}>
          Sahan<span style={{ color: ACCENT }}>.</span>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center" style={{ gap: 7 }}>
      <div style={{ width: 18, height: 18, flex: "none", borderRadius: 5, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 6, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(255,255,255,0.72)" }}>{label}</div>
        <div style={{ fontSize: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </div>
    </div>
  );
}

// A QR-like glyph — three finder squares + a deterministic module field.
function FauxQr() {
  const cells = [];
  const pattern = "1011010010110100101101001011010010110100"; // arbitrary, stable
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const corner = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      if (corner) continue;
      if (pattern[(y * 9 + x) % pattern.length] === "1") {
        cells.push(<rect key={`${x}-${y}`} x={x * 5 + 1} y={y * 5 + 1} width={4} height={4} fill="#16130f" />);
      }
    }
  }
  const finder = (cx: number, cy: number) => (
    <g>
      <rect x={cx} y={cy} width={13} height={13} fill="none" stroke="#16130f" strokeWidth={2} />
      <rect x={cx + 4} y={cy + 4} width={5} height={5} fill="#16130f" />
    </g>
  );
  return (
    <div style={{ width: 70, height: 70, borderRadius: 8, background: "#fff", border: "1px solid #e6e3dc", padding: 5 }}>
      <svg viewBox="0 0 47 47" width="100%" height="100%" aria-hidden>
        {cells}
        {finder(0, 0)}
        {finder(34, 0)}
        {finder(0, 34)}
      </svg>
    </div>
  );
}
