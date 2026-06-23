// Shared company-profile template thumbnails — small static mockups of
// each register. Rendered in the on-profile download chooser
// (CompanyDownloadModal).

export function WadaniThumb() {
  return (
    <div className="w-[120px] h-[170px] shadow text-[#e8edf3] p-2.5 relative overflow-hidden" style={{ background: "linear-gradient(165deg, #0a1a2e 0%, #0e2a4a 55%, #0c1f38 100%)", fontFamily: "system-ui, sans-serif" }}>
      <div className="text-[4px] uppercase tracking-[0.2em] opacity-70">— Company profile</div>
      <div className="mt-7 leading-[0.92]" style={{ fontSize: 14, fontWeight: 300, letterSpacing: "-0.04em", fontFamily: "Source Serif 4, Georgia, serif" }}>
        Wadani<br />Engineering<br /><em className="opacity-70">Group.</em>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5 pt-1.5 border-t border-white/20 text-[3.5px] uppercase tracking-wider opacity-70">
        Founded · Registration · HQ · Web
      </div>
    </div>
  );
}

export function AnnualThumb() {
  return (
    <div className="w-[120px] h-[170px] shadow bg-[#fafaf7] relative overflow-hidden" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="h-12 relative" style={{ background: "linear-gradient(180deg, #0d3b66, #072044)" }}>
        <div className="absolute bottom-1 left-2 text-white leading-[1.0]" style={{ fontSize: 9, fontWeight: 350, fontFamily: "Source Serif 4, Georgia, serif" }}>
          Wadani Engineering<br /><em className="text-[#b6c4d6]">Group.</em>
        </div>
      </div>
      <div className="mx-2 -mt-1.5 h-9 rounded-[2px] border border-[#d8dde3] relative" style={{ background: "repeating-linear-gradient(45deg, #d3dae3 0px, #d3dae3 1px, #e3e8ef 1px, #e3e8ef 6px)" }} />
      <div className="px-2 mt-1.5 text-[3.5px] uppercase tracking-[0.2em] text-[#0d3b66] font-bold">Established Mogadishu, 2012</div>
      <div className="px-2 mt-0.5 text-[5px] italic text-[#072044] leading-snug" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>
        Civil infrastructure for the Horn of Africa.
      </div>
      <div className="absolute bottom-2 left-2 right-2 pt-1 border-t border-[#d8dde3] grid grid-cols-4 gap-1">
        {["14", "$22M", "23", "9"].map((n, i) => (
          <div key={i}>
            <div className="text-[7px] text-[#072044]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>{n}</div>
            <div className="text-[3px] uppercase tracking-wider text-[#0d3b66] font-bold">Stat</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MinimalThumb() {
  return (
    <div className="w-[120px] h-[170px] shadow bg-[#fbfbfa] p-2.5 relative overflow-hidden text-[#0e1116]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex justify-between text-[3.5px] uppercase tracking-[0.2em] text-[#6e7480] font-semibold">
        <span>Wadani Engineering</span><span>MMXXVI</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <em className="text-[6px] text-[#0a5cad]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>W.E.G</em>
        <span className="w-2 h-px bg-[#0e1116]" />
        <span className="text-[3.5px] uppercase tracking-wider text-[#6e7480] font-semibold">Est. 2012</span>
      </div>
      <div className="mt-6 leading-[0.88]" style={{ fontSize: 17, fontWeight: 250, letterSpacing: "-0.05em", fontFamily: "Source Serif 4, Georgia, serif" }}>
        Wadani<br />Engineering<br /><em className="text-[#0a5cad]">Group.</em>
      </div>
      <div className="absolute bottom-2 left-2.5 right-2.5 pt-1 border-t-[1.5px] border-[#0e1116] grid grid-cols-3 gap-1">
        {["Founded", "HQ", "Web"].map((k, i) => (
          <div key={i}>
            <div className="text-[3px] uppercase tracking-wider text-[#6e7480] font-bold">{k}</div>
            <div className="text-[4.5px]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── "Company Profile System" thumbnails (4-page white-page layouts) ──
// Ported from the design handoff's overview mockups (viewBox 0 0 100 140).
function ThumbFrame({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 100 140" width={120} height={168} style={{ display: "block" }} aria-hidden>{children}</svg>;
}

export function StandardThumb() {
  return (
    <ThumbFrame>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#d7d3cc" />
      <circle cx="50" cy="16" r="6" fill="none" stroke="#20304d" strokeWidth="1.2" />
      <rect x="32" y="27" width="36" height="5" fill="#16130f" />
      <rect x="38" y="36" width="24" height="2" fill="#20304d" />
      <line x1="14" y1="44" x2="86" y2="44" stroke="#16130f" strokeWidth="1" />
      <rect x="14" y="52" width="72" height="2" fill="#cfc9c0" />
      <rect x="14" y="57" width="64" height="2" fill="#cfc9c0" />
      <rect x="14" y="68" width="33" height="22" rx="2" fill="#eef1f7" stroke="#c9d2e3" strokeWidth="0.8" />
      <rect x="53" y="68" width="33" height="22" rx="2" fill="#eef1f7" stroke="#c9d2e3" strokeWidth="0.8" />
      <line x1="14" y1="100" x2="86" y2="100" stroke="#16130f" strokeWidth="1" />
      <line x1="14" y1="118" x2="86" y2="118" stroke="#16130f" strokeWidth="1" />
      <rect x="22" y="106" width="12" height="6" fill="#20304d" />
      <rect x="44" y="106" width="12" height="6" fill="#20304d" />
      <rect x="66" y="106" width="12" height="6" fill="#20304d" />
    </ThumbFrame>
  );
}

export function DossierThumb() {
  return (
    <ThumbFrame>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#d7d3cc" />
      <line x1="38" y1="6" x2="38" y2="134" stroke="#16130f" strokeWidth="1" />
      <rect x="9" y="14" width="10" height="10" rx="2" fill="#1d3b3b" />
      <rect x="9" y="34" width="18" height="2.5" fill="#1d3b3b" />
      <rect x="9" y="41" width="24" height="2" fill="#cfc9c0" />
      <rect x="9" y="46" width="20" height="2" fill="#cfc9c0" />
      <rect x="9" y="58" width="18" height="2.5" fill="#1d3b3b" />
      <rect x="9" y="65" width="22" height="2" fill="#cfc9c0" />
      <rect x="9" y="70" width="18" height="2" fill="#cfc9c0" />
      <rect x="48" y="14" width="34" height="5" fill="#16130f" />
      <rect x="48" y="23" width="20" height="2" fill="#1d3b3b" />
      <rect x="48" y="34" width="16" height="2.5" fill="#1d3b3b" />
      <rect x="48" y="40" width="38" height="2" fill="#cfc9c0" />
      <rect x="48" y="45" width="32" height="2" fill="#cfc9c0" />
      <rect x="48" y="56" width="38" height="26" rx="2" fill="#eef3f1" stroke="#c5d6d1" strokeWidth="0.8" />
      <rect x="52" y="62" width="14" height="2.5" fill="#1d3b3b" />
      <rect x="52" y="69" width="30" height="2" fill="#b9c4c0" />
      <rect x="52" y="74" width="26" height="2" fill="#b9c4c0" />
    </ThumbFrame>
  );
}

export function BannerThumb() {
  return (
    <ThumbFrame>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#d7d3cc" />
      <rect x="1" y="1" width="98" height="30" fill="#20304d" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1" />
      <rect x="29" y="11" width="38" height="6" fill="#ffffff" opacity="0.92" />
      <rect x="29" y="21" width="22" height="2.5" fill="#ffffff" opacity="0.5" />
      <rect x="14" y="42" width="18" height="3" fill="#20304d" />
      <rect x="14" y="49" width="72" height="2" fill="#cfc9c0" />
      <rect x="14" y="54" width="64" height="2" fill="#cfc9c0" />
      <rect x="14" y="66" width="14" height="2.5" fill="#20304d" />
      <line x1="50" y1="64" x2="50" y2="92" stroke="#d7d3cc" strokeWidth="1" />
      <rect x="56" y="66" width="14" height="2.5" fill="#20304d" />
      <rect x="14" y="72" width="30" height="2" fill="#cfc9c0" />
      <rect x="56" y="72" width="30" height="2" fill="#cfc9c0" />
      <rect x="1" y="116" width="98" height="23" fill="#20304d" />
      <rect x="14" y="124" width="24" height="3" fill="#ffffff" opacity="0.85" />
      <rect x="60" y="125" width="26" height="2" fill="#ffffff" opacity="0.5" />
    </ThumbFrame>
  );
}

export function BroadsheetThumb() {
  return (
    <ThumbFrame>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#d7d3cc" />
      <rect x="14" y="13" width="40" height="6" fill="#16130f" />
      <rect x="14" y="22" width="24" height="2" fill="#243d31" />
      <rect x="14" y="28" width="72" height="2" fill="#243d31" />
      <rect x="14" y="36" width="72" height="2" fill="#cfc9c0" />
      <rect x="14" y="41" width="66" height="2" fill="#cfc9c0" />
      <line x1="50" y1="50" x2="50" y2="118" stroke="#e2ded7" strokeWidth="1" />
      <rect x="14" y="52" width="14" height="2.5" fill="#243d31" />
      <rect x="14" y="60" width="30" height="2" fill="#cfc9c0" />
      <rect x="14" y="65" width="26" height="2" fill="#cfc9c0" />
      <rect x="14" y="74" width="30" height="2" fill="#cfc9c0" />
      <rect x="56" y="52" width="30" height="14" rx="2" fill="#eef2ef" stroke="#cad9d0" strokeWidth="0.8" />
      <rect x="56" y="70" width="30" height="14" rx="2" fill="#eef2ef" stroke="#cad9d0" strokeWidth="0.8" />
      <line x1="14" y1="104" x2="86" y2="104" stroke="#16130f" strokeWidth="1" />
      <line x1="14" y1="120" x2="86" y2="120" stroke="#16130f" strokeWidth="1" />
      <rect x="20" y="109" width="12" height="6" fill="#243d31" />
      <rect x="44" y="109" width="12" height="6" fill="#243d31" />
      <rect x="68" y="109" width="12" height="6" fill="#243d31" />
    </ThumbFrame>
  );
}

export function BentoThumb() {
  return (
    <ThumbFrame>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#d7d3cc" />
      <rect x="14" y="12" width="9" height="9" rx="2" fill="#532330" />
      <rect x="28" y="13" width="34" height="5" fill="#16130f" />
      <rect x="14" y="28" width="72" height="20" rx="2.5" fill="#fff" stroke="#e1ddd4" strokeWidth="0.8" />
      <rect x="20" y="33" width="14" height="2.5" fill="#532330" />
      <rect x="20" y="40" width="58" height="2" fill="#cfc9c0" />
      <rect x="14" y="54" width="22" height="26" rx="2.5" fill="#f4ecee" stroke="#dcc7cd" strokeWidth="0.8" />
      <rect x="39" y="54" width="22" height="26" rx="2.5" fill="#f4ecee" stroke="#dcc7cd" strokeWidth="0.8" />
      <rect x="64" y="54" width="22" height="26" rx="2.5" fill="#f4ecee" stroke="#dcc7cd" strokeWidth="0.8" />
      <rect x="14" y="86" width="46" height="24" rx="2.5" fill="#fff" stroke="#e1ddd4" strokeWidth="0.8" />
      <rect x="64" y="86" width="22" height="24" rx="2.5" fill="#532330" />
      <rect x="14" y="116" width="72" height="16" rx="2.5" fill="#fff" stroke="#e1ddd4" strokeWidth="0.8" />
    </ThumbFrame>
  );
}

export interface CompanyTemplateMeta {
  id: "wadani" | "annual" | "minimal" | "standard" | "dossier" | "banner" | "broadsheet" | "bento";
  name: string;
  tagline: string;
  Thumb: () => JSX.Element;
}

export const COMPANY_TEMPLATES: CompanyTemplateMeta[] = [
  { id: "standard", name: "The Standard", tagline: "Classic centered · tint boxes", Thumb: StandardThumb },
  { id: "dossier", name: "The Dossier", tagline: "Sidebar facts · vertical rule", Thumb: DossierThumb },
  { id: "banner", name: "The Banner", tagline: "Colour header + footer band", Thumb: BannerThumb },
  { id: "broadsheet", name: "The Broadsheet", tagline: "Two-column editorial", Thumb: BroadsheetThumb },
  { id: "bento", name: "The Bento", tagline: "Modular cards · stat tile", Thumb: BentoThumb },
  { id: "wadani", name: "Wadani", tagline: "Dark teal cover · topographic", Thumb: WadaniThumb },
  { id: "annual", name: "Annual", tagline: "Report register · stat tiles", Thumb: AnnualThumb },
  { id: "minimal", name: "Minimal", tagline: "Massive type · one accent", Thumb: MinimalThumb },
];
