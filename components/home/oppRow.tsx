import { labelFor } from "@/lib/jobs/sectors";

// One opportunity row (job or tender) — org avatar, title, location/sector
// chips, and a deadline countdown. Shared by JobsCard and TendersCard so the
// two stay visually identical.
export interface OppRowData {
  link: string;
  title: string;
  org: string | null;
  location: string | null;
  sector: string | null;
  postedAt: string | null;
  deadline: string | null;
  deadlineISO: string | null;
}

export function OpportunityRow({ item, badge, compact }: { item: OppRowData; badge?: string; compact?: boolean }) {
  const dl = deadlineLabel(item);

  // Compact rows power the dense side-by-side Jobs | Tenders columns: no
  // avatar, a single meta line, and the deadline/urgency sitting inline so a
  // narrow column stays readable. The full row (below) is used on its own.
  if (compact) {
    const meta = [item.org, item.location].filter(Boolean).join(" · ");
    return (
      <li>
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block py-3 border-t border-border-soft hover:bg-cream/40 rounded-lg px-2 -mx-2 transition"
        >
          <span className="flex items-start gap-2">
            <span className="font-serif text-[15px] leading-snug text-ink line-clamp-2 group-hover:text-sienna transition-colors">{item.title}</span>
            {badge && <span className="shrink-0 mt-0.5 text-[9.5px] font-semibold tracking-wide text-verified bg-verified/[0.12] rounded-full px-1.5 py-0.5">{badge}</span>}
          </span>
          {meta && <span className="block text-[12px] text-ink-soft mt-1 truncate">{meta}</span>}
          <span className="flex items-center gap-2 mt-1.5">
            {dl ? (
              <span className={`text-[11px] font-medium ${dl.urgent ? "text-amber-700" : "text-muted"}`}>{dl.text}</span>
            ) : item.postedAt ? (
              <span className="text-[11px] text-muted">{ago(item.postedAt)}</span>
            ) : null}
            {item.sector && <span className="text-[11px] text-muted truncate">· {labelFor(item.sector)}</span>}
          </span>
        </a>
      </li>
    );
  }

  return (
    <li>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 py-3.5 border-t border-border-soft hover:bg-cream/40 rounded-lg px-2 -mx-2 transition"
      >
        <span className="shrink-0 w-11 h-11 rounded-full bg-cream border border-border flex items-center justify-center font-serif text-[13px] text-ink-soft">
          {initials(item.org || item.title)}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-[16px] text-ink truncate">{item.title}</span>
            {badge && <span className="text-[10px] font-semibold tracking-wide text-verified bg-verified/[0.12] rounded-full px-2 py-0.5">{badge}</span>}
          </span>
          {item.org && <span className="block text-[13px] text-ink-soft mt-0.5 truncate">{item.org}</span>}
          <span className="flex gap-1.5 mt-2 flex-wrap">
            {item.location && <Chip>{item.location}</Chip>}
            {item.sector && <Chip>{labelFor(item.sector)}</Chip>}
          </span>
        </span>
        <span className="shrink-0 text-right">
          {dl ? (
            <span className={`block text-[11.5px] font-medium ${dl.urgent ? "text-amber-700" : "text-muted"}`}>{dl.text}</span>
          ) : item.postedAt ? (
            <span className="block text-[11.5px] text-muted">{ago(item.postedAt)}</span>
          ) : null}
          <span className="block text-[12.5px] font-medium text-sienna mt-2">View ↗</span>
        </span>
      </a>
    </li>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="border border-border rounded-full px-2.5 py-0.5 text-[11px] text-muted">{children}</span>;
}

// Prefer a countdown from the resolved deadline; fall back to the raw text
// ("Closes Jul, 09"). Returns null once the deadline has passed.
export function deadlineLabel(item: { deadlineISO: string | null; deadline: string | null }): { text: string; urgent: boolean } | null {
  if (item.deadlineISO) {
    const endOfDay = Date.parse(item.deadlineISO) + 86_400_000;
    const days = Math.ceil((endOfDay - Date.now()) / 86_400_000);
    if (days < 0) return null;
    if (days === 0) return { text: "Closes today", urgent: true };
    if (days === 1) return { text: "1 day left", urgent: true };
    return { text: `${days} days left`, urgent: days <= 7 };
  }
  if (item.deadline) return { text: `Closes ${item.deadline}`, urgent: false };
  return null;
}

export function initials(s: string): string {
  const words = s.trim().split(/\s+/).filter(Boolean).slice(0, 3);
  const letters = words.map((w) => w[0]).join("");
  return (letters || s.slice(0, 2)).toUpperCase().slice(0, 3);
}

export function ago(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}
