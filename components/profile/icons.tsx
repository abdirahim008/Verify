// Small inline icons for the profile builder — contact chips, timeline
// dots, and row controls. Kept here so every section shares one set.

type P = { className?: string; size?: number };
const base = (size = 14) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });

export function PinIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}
export function MailIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 5 8-5" /></svg>;
}
export function PhoneIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L16 13l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></svg>;
}
export function OrgIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h3a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2" /></svg>;
}
export function CalendarIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>;
}
export function PencilIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M4 20h4l10-10a2 2 0 00-3-3L5 17v3z" /><path d="M13.5 6.5l3 3" /></svg>;
}
export function TrashIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" /></svg>;
}
export function CapIcon({ className, size }: P) {
  return <svg {...base(size)} className={className} aria-hidden><path d="M22 9L12 5 2 9l10 4 10-4z" /><path d="M6 11v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5" /></svg>;
}

// Green verified-style check inside a filled circle — the timeline dot.
export function CheckDot({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="11" fill="#067a5e" />
      <path d="M6 11.2 L9.4 14.6 L16 8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
// Hollow dot for not-yet-verified timeline entries.
export function HollowDot({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="9.5" fill="#fff" stroke="#cbd2d9" strokeWidth="1.6" />
      <circle cx="11" cy="11" r="3" fill="#cbd2d9" />
    </svg>
  );
}
