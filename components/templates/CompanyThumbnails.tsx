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

export interface CompanyTemplateMeta {
  id: "wadani" | "annual" | "minimal";
  name: string;
  tagline: string;
  Thumb: () => JSX.Element;
}

export const COMPANY_TEMPLATES: CompanyTemplateMeta[] = [
  { id: "wadani", name: "Wadani", tagline: "Dark teal cover · topographic", Thumb: WadaniThumb },
  { id: "annual", name: "Annual", tagline: "Report register · stat tiles", Thumb: AnnualThumb },
  { id: "minimal", name: "Minimal", tagline: "Massive type · one accent", Thumb: MinimalThumb },
];
