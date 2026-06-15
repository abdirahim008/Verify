// Shared CV template thumbnails — small static mockups of each register.
// Rendered in the on-profile download chooser (CvDownloadModal).

export function EditorialThumb() {
  return (
    <div className="w-[120px] h-[170px] bg-[#f6f2ea] shadow p-3 text-[#1a1a17]" style={{ fontFamily: "Source Serif 4, Georgia, serif" }}>
      <div className="text-[5px] uppercase tracking-[0.18em] text-[#6e7480]">Curriculum vitae</div>
      <div className="mt-2.5 leading-[0.95]" style={{ fontSize: 14, fontWeight: 350, letterSpacing: "-0.035em" }}>
        Ifrah<br /><em className="text-[#0d3b66] font-light">Abdi.</em>
      </div>
      <div className="text-[5px] italic text-[#3a3a3d] mt-1">Senior Health Coordinator</div>
      <div className="h-px bg-[#dcd6c8] my-1.5" />
      <div className="text-[5px] leading-[1.4] text-[#3a3a3d] line-clamp-6">
        <span className="float-left text-[#0d3b66] italic font-light" style={{ fontSize: 14, lineHeight: 0.85, marginRight: 1 }}>P</span>
        ublic health practitioner with eleven years coordinating maternal, newborn and child health programmes.
      </div>
    </div>
  );
}

export function SidebarThumb() {
  return (
    <div className="w-[120px] h-[170px] shadow flex">
      <div className="w-12 bg-[#091e36] text-[#e6ecf3] p-2 text-[5px] leading-[1.3]" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="w-5 h-5 rounded-full bg-[#bfcad6] text-[#091e36] flex items-center justify-center text-[7px] font-bold">IA</div>
        <div className="mt-2 font-bold tracking-tight uppercase" style={{ fontSize: 7, lineHeight: 1 }}>Ifrah<br />Hassan<br />Abdi</div>
        <div className="mt-1.5 text-[#9aa6b3] text-[4.5px]">Senior Health<br />Coordinator</div>
        <div className="mt-2 text-[#bfcad6] uppercase tracking-[0.18em] font-bold" style={{ fontSize: 4.5 }}>Skills</div>
        <div className="mt-1 space-y-0.5 text-[4.5px]"><div>· Cold-chain</div><div>· BHA</div><div>· DHIS2</div></div>
      </div>
      <div className="flex-1 bg-[#0e2a4a] text-[#e6ecf3] p-2" style={{ fontFamily: "system-ui, sans-serif" }}>
        <div className="text-[#bfcad6] uppercase tracking-[0.2em] font-bold border-b border-[#1d3b5e] pb-1" style={{ fontSize: 4.5 }}>Experience</div>
        <div className="mt-1.5">
          <div className="font-semibold" style={{ fontSize: 7 }}>Senior Health Coord.</div>
          <div className="text-[#bfcad6]" style={{ fontSize: 5 }}>UNICEF Somalia · 2021—</div>
          <div className="text-[4.5px] mt-0.5 leading-[1.4] line-clamp-3">Lead a team of fourteen across Banadir and Lower Shabelle.</div>
        </div>
      </div>
    </div>
  );
}

export function MonoThumb() {
  return (
    <div className="w-[120px] h-[170px] bg-[#fafaf7] shadow p-2.5 text-[#111] relative" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex items-baseline justify-between" style={{ fontFamily: "ui-monospace, monospace", fontSize: 4.5 }}>
        <span className="flex items-center gap-1 text-[#888]"><span className="w-1 h-1 bg-[#0a5cad]" />cv / abdi-i</span>
        <span className="text-[#888]">MOG · SOM</span>
      </div>
      <div className="mt-3 leading-[0.95]" style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.04em" }}>
        Ifrah H. Abdi<span className="text-[#0a5cad]">.</span>
      </div>
      <div className="text-[5px] text-[#111] font-medium mt-0.5">Senior Health Coordinator</div>
      <div className="h-px bg-[#e3e0d8] my-2" />
      <div className="grid grid-cols-[18px_4px_1fr] gap-1 text-[5px]" style={{ fontFamily: "ui-monospace, monospace" }}>
        <span className="text-[#555]">21</span><span className="flex justify-center pt-0.5"><span className="w-1 h-1 rounded-full bg-[#0a5cad]" /></span><span className="text-[#111] not-italic" style={{ fontFamily: "system-ui, sans-serif", fontSize: 6 }}><strong>Health Coord.</strong> @ UNICEF</span>
        <span className="text-[#555]">17</span><span className="flex justify-center pt-0.5"><span className="w-1 h-1 rounded-full bg-[#c8c4b8]" /></span><span className="text-[#111]" style={{ fontFamily: "system-ui, sans-serif", fontSize: 6 }}><strong>MNCH Mgr.</strong> @ SCI</span>
        <span className="text-[#555]">14</span><span className="flex justify-center pt-0.5"><span className="w-1 h-1 rounded-full bg-[#c8c4b8]" /></span><span className="text-[#111]" style={{ fontFamily: "system-ui, sans-serif", fontSize: 6 }}><strong>Health Officer</strong> @ SRCS</span>
      </div>
    </div>
  );
}

export interface CvTemplateMeta {
  id: "editorial" | "sidebar" | "mono";
  name: string;
  tagline: string;
  Thumb: () => JSX.Element;
}

export const CV_TEMPLATES: CvTemplateMeta[] = [
  { id: "editorial", name: "Editorial", tagline: "Magazine register · cream paper", Thumb: EditorialThumb },
  { id: "sidebar", name: "Sidebar", tagline: "Two columns · executive", Thumb: SidebarThumb },
  { id: "mono", name: "Mono", tagline: "Minimal · technical", Thumb: MonoThumb },
];
