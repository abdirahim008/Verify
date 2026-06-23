// Shared CV template thumbnails — small static mockups of each white-page
// register, ported from the Claude Design overview. Rendered in the
// on-profile download chooser (CvDownloadModal).

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[120px] h-[170px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
      <svg viewBox="0 0 100 140" width="120" height="170" xmlns="http://www.w3.org/2000/svg">{children}</svg>
    </div>
  );
}

export function ClassicThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <rect x="30" y="16" width="40" height="5" fill="#16130f" />
      <rect x="38" y="25" width="24" height="2.5" fill="#bdb7ad" />
      <line x1="14" y1="33" x2="86" y2="33" stroke="#16130f" strokeWidth="1" />
      <rect x="14" y="44" width="22" height="3" fill="#16130f" />
      <line x1="14" y1="51" x2="86" y2="51" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="56" width="72" height="2" fill="#cfc9c0" />
      <rect x="14" y="61" width="64" height="2" fill="#cfc9c0" />
      <rect x="14" y="72" width="22" height="3" fill="#16130f" />
      <line x1="14" y1="79" x2="86" y2="79" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="84" width="68" height="2" fill="#cfc9c0" />
      <rect x="14" y="89" width="58" height="2" fill="#cfc9c0" />
      <rect x="14" y="100" width="22" height="3" fill="#16130f" />
      <line x1="14" y1="107" x2="86" y2="107" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="112" width="70" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function ProfileThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <line x1="38" y1="6" x2="38" y2="134" stroke="#d7d3cc" strokeWidth="1" />
      <circle cx="21" cy="24" r="10" fill="none" stroke="#bdb7ad" strokeWidth="1.2" />
      <rect x="9" y="44" width="20" height="2.5" fill="#16130f" />
      <rect x="9" y="50" width="24" height="2" fill="#cfc9c0" />
      <rect x="9" y="55" width="22" height="2" fill="#cfc9c0" />
      <rect x="9" y="68" width="20" height="2.5" fill="#16130f" />
      <rect x="9" y="74" width="24" height="2" fill="#cfc9c0" />
      <rect x="9" y="79" width="20" height="2" fill="#cfc9c0" />
      <rect x="48" y="14" width="34" height="5" fill="#16130f" />
      <rect x="48" y="24" width="20" height="2.5" fill="#bdb7ad" />
      <rect x="48" y="38" width="18" height="3" fill="#16130f" />
      <line x1="48" y1="45" x2="86" y2="45" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="48" y="50" width="38" height="2" fill="#cfc9c0" />
      <rect x="48" y="55" width="32" height="2" fill="#cfc9c0" />
      <rect x="48" y="68" width="18" height="3" fill="#16130f" />
      <line x1="48" y1="75" x2="86" y2="75" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="48" y="80" width="36" height="2" fill="#cfc9c0" />
      <rect x="48" y="85" width="30" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function GridThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <rect x="14" y="14" width="40" height="5" fill="#16130f" />
      <rect x="64" y="15" width="22" height="2.5" fill="#bdb7ad" />
      <rect x="64" y="20" width="22" height="2" fill="#cfc9c0" />
      <line x1="14" y1="30" x2="86" y2="30" stroke="#16130f" strokeWidth="1.4" />
      <line x1="50" y1="38" x2="50" y2="128" stroke="#d7d3cc" strokeWidth="1" />
      <rect x="14" y="40" width="16" height="3" fill="#16130f" />
      <line x1="14" y1="47" x2="44" y2="47" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="52" width="30" height="2" fill="#cfc9c0" />
      <rect x="14" y="57" width="26" height="2" fill="#cfc9c0" />
      <rect x="14" y="70" width="16" height="3" fill="#16130f" />
      <line x1="14" y1="77" x2="44" y2="77" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="82" width="28" height="2" fill="#cfc9c0" />
      <rect x="56" y="40" width="16" height="3" fill="#16130f" />
      <line x1="56" y1="47" x2="86" y2="47" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="56" y="52" width="30" height="2" fill="#cfc9c0" />
      <rect x="56" y="57" width="24" height="2" fill="#cfc9c0" />
      <rect x="56" y="70" width="16" height="3" fill="#16130f" />
      <line x1="56" y1="77" x2="86" y2="77" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="56" y="82" width="28" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function CrestThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <rect x="1" y="1" width="98" height="40" fill="#20304d" />
      <rect x="11" y="14" width="40" height="6" fill="#ffffff" opacity="0.92" />
      <rect x="11" y="25" width="24" height="2.5" fill="#ffffff" opacity="0.5" />
      <circle cx="84" cy="20" r="8" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1" />
      <rect x="11" y="52" width="20" height="3" fill="#16130f" />
      <line x1="11" y1="59" x2="89" y2="59" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="11" y="64" width="74" height="2" fill="#cfc9c0" />
      <rect x="11" y="69" width="62" height="2" fill="#cfc9c0" />
      <rect x="11" y="80" width="20" height="3" fill="#16130f" />
      <line x1="11" y1="87" x2="89" y2="87" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="11" y="92" width="70" height="2" fill="#cfc9c0" />
      <rect x="11" y="104" width="20" height="3" fill="#16130f" />
      <line x1="11" y1="111" x2="89" y2="111" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="11" y="116" width="66" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function EditorialThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <line x1="62" y1="6" x2="62" y2="134" stroke="#d7d3cc" strokeWidth="1" />
      <rect x="14" y="14" width="34" height="5" fill="#16130f" />
      <rect x="14" y="24" width="20" height="2.5" fill="#bdb7ad" />
      <rect x="14" y="38" width="18" height="3" fill="#16130f" />
      <line x1="14" y1="45" x2="52" y2="45" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="50" width="38" height="2" fill="#cfc9c0" />
      <rect x="14" y="55" width="32" height="2" fill="#cfc9c0" />
      <rect x="14" y="68" width="18" height="3" fill="#16130f" />
      <line x1="14" y1="75" x2="52" y2="75" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="80" width="36" height="2" fill="#cfc9c0" />
      <rect x="14" y="85" width="30" height="2" fill="#cfc9c0" />
      <rect x="71" y="14" width="18" height="20" fill="none" stroke="#bdb7ad" strokeWidth="1.2" />
      <rect x="71" y="44" width="16" height="2.5" fill="#16130f" />
      <rect x="71" y="50" width="18" height="2" fill="#cfc9c0" />
      <rect x="71" y="55" width="14" height="2" fill="#cfc9c0" />
      <rect x="71" y="68" width="16" height="2.5" fill="#16130f" />
      <rect x="71" y="74" width="18" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function StatementThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <line x1="14" y1="12" x2="86" y2="12" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="14" y="20" width="40" height="7" fill="#16130f" />
      <rect x="14" y="30" width="24" height="2.5" fill="#bdb7ad" />
      <circle cx="78" cy="24" r="9" fill="none" stroke="#bdb7ad" strokeWidth="1.2" />
      <line x1="6" y1="42" x2="94" y2="42" stroke="#16130f" strokeWidth="1.6" />
      <line x1="34" y1="48" x2="34" y2="130" stroke="#d7d3cc" strokeWidth="1" />
      <rect x="12" y="54" width="16" height="3" fill="#16130f" />
      <rect x="42" y="54" width="44" height="2" fill="#cfc9c0" />
      <rect x="42" y="59" width="38" height="2" fill="#cfc9c0" />
      <line x1="12" y1="70" x2="88" y2="70" stroke="#e2ded7" strokeWidth="0.8" />
      <rect x="12" y="76" width="16" height="3" fill="#16130f" />
      <rect x="42" y="76" width="44" height="2" fill="#cfc9c0" />
      <rect x="42" y="81" width="36" height="2" fill="#cfc9c0" />
      <line x1="12" y1="92" x2="88" y2="92" stroke="#e2ded7" strokeWidth="0.8" />
      <rect x="12" y="98" width="16" height="3" fill="#16130f" />
      <rect x="42" y="98" width="42" height="2" fill="#cfc9c0" />
    </Card>
  );
}

export function EndnoteThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <rect x="11" y="14" width="42" height="6" fill="#16130f" />
      <rect x="11" y="25" width="24" height="2.5" fill="#bdb7ad" />
      <line x1="11" y1="33" x2="89" y2="33" stroke="#16130f" strokeWidth="1" />
      <rect x="11" y="41" width="20" height="3" fill="#16130f" />
      <rect x="11" y="48" width="74" height="2" fill="#cfc9c0" />
      <rect x="11" y="53" width="62" height="2" fill="#cfc9c0" />
      <rect x="11" y="64" width="20" height="3" fill="#16130f" />
      <rect x="11" y="71" width="70" height="2" fill="#cfc9c0" />
      <rect x="11" y="76" width="58" height="2" fill="#cfc9c0" />
      <rect x="1" y="99" width="98" height="40" fill="#1d3b3b" />
      <rect x="11" y="108" width="18" height="2.5" fill="#ffffff" opacity="0.5" />
      <rect x="11" y="117" width="30" height="2.5" fill="#ffffff" opacity="0.9" />
      <rect x="11" y="123" width="26" height="2" fill="#ffffff" opacity="0.45" />
      <rect x="56" y="117" width="30" height="2.5" fill="#ffffff" opacity="0.9" />
      <rect x="56" y="123" width="22" height="2" fill="#ffffff" opacity="0.45" />
    </Card>
  );
}

export function FrameThumb() {
  return (
    <Card>
      <rect x="0.5" y="0.5" width="99" height="139" fill="#fff" stroke="#e4e0d9" />
      <rect x="1" y="1" width="98" height="31" fill="#20304d" />
      <rect x="11" y="11" width="38" height="6" fill="#ffffff" opacity="0.92" />
      <rect x="11" y="21" width="22" height="2.5" fill="#ffffff" opacity="0.5" />
      <rect x="11" y="44" width="20" height="3" fill="#16130f" />
      <line x1="11" y1="51" x2="89" y2="51" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="11" y="56" width="74" height="2" fill="#cfc9c0" />
      <rect x="11" y="61" width="62" height="2" fill="#cfc9c0" />
      <rect x="11" y="72" width="20" height="3" fill="#16130f" />
      <line x1="11" y1="79" x2="89" y2="79" stroke="#d7d3cc" strokeWidth="0.8" />
      <rect x="11" y="84" width="70" height="2" fill="#cfc9c0" />
      <rect x="11" y="95" width="20" height="3" fill="#16130f" />
      <rect x="11" y="102" width="64" height="2" fill="#cfc9c0" />
      <rect x="1" y="116" width="98" height="23" fill="#20304d" />
      <rect x="11" y="124" width="24" height="3" fill="#ffffff" opacity="0.85" />
      <rect x="60" y="125" width="28" height="2" fill="#ffffff" opacity="0.5" />
    </Card>
  );
}

export interface CvTemplateMeta {
  id: "classic" | "profile" | "grid" | "crest" | "editorial" | "statement" | "endnote" | "frame";
  name: string;
  tagline: string;
  Thumb: () => JSX.Element;
}

export const CV_TEMPLATES: CvTemplateMeta[] = [
  { id: "classic", name: "The Classic", tagline: "Single column · serif", Thumb: ClassicThumb },
  { id: "profile", name: "The Profile", tagline: "Left sidebar · photo", Thumb: ProfileThumb },
  { id: "editorial", name: "The Editorial", tagline: "Right sidebar · photo", Thumb: EditorialThumb },
  { id: "grid", name: "The Grid", tagline: "Two column · numbered", Thumb: GridThumb },
  { id: "statement", name: "The Statement", tagline: "Bordered masthead · photo", Thumb: StatementThumb },
  { id: "crest", name: "The Crest", tagline: "Colour header band", Thumb: CrestThumb },
  { id: "endnote", name: "The Endnote", tagline: "Colour footer band", Thumb: EndnoteThumb },
  { id: "frame", name: "The Frame", tagline: "Colour header + footer", Thumb: FrameThumb },
];
