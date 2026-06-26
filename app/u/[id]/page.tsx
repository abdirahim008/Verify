import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadPublicProfile, viewerContext } from "@/lib/public-profile";
import { ReadMore } from "@/components/ReadMore";
import { CollapsibleScope } from "@/components/CollapsibleScope";

// Public profile page — the QR / share destination, so it doubles as the
// app's shop window. No (app) layout: reachable by logged-out viewers, with
// per-section visibility enforced at the data layer (CLAUDE.md §10).
// Design: Sahan-Public-Profile handoff.
export const dynamic = "force-dynamic";

const C = {
  ink: "#16130f", blue: "#1e50c7", green: "#1f8a4c", greenSoft: "#e7f4ec",
  body: "#43403a", muted: "#6a6a64", faint: "#8a8a84", faint2: "#8d8d87", soft: "#a8a29a",
  cardBorder: "#e6e3dc", chipBorder: "#e1ddd4", chipBg: "#faf9f6",
  hair: "#efedea", line: "#f2f0ea", connector: "#e9e6df", dotIdle: "#cdd0d6",
};
const SERIF = "var(--font-serif), 'Source Serif 4', Georgia, serif";

export async function generateMetadata({ params }: { params: { id: string } }) {
  // Public profiles are shareable by link but intentionally kept OUT of search
  // engines (privacy; matches "no public browse of profiles"). noindex is the
  // authoritative signal — the page stays crawlable so Google can read it.
  const robots = { index: false, follow: false } as const;
  const profile = await loadPublicProfile(params.id, "public");
  if (!profile) return { title: "Profile", robots };
  const name = profile.kind === "company" ? profile.name : profile.fullName;
  return {
    title: name,
    description: profile.kind === "individual" ? profile.headline : profile.about?.slice(0, 160),
    robots,
  };
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const ctx = viewerContext(params.id, user?.id ?? null);

  const profile = await loadPublicProfile(params.id, ctx);
  if (!profile) notFound();

  return (
    <div className="min-h-screen" style={{ background: "#f3f2ef", color: C.ink }}>
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b" style={{ borderColor: C.cardBorder, background: "rgba(243,242,239,0.86)", backdropFilter: "blur(10px)" }}>
        <div className="mx-auto max-w-[760px] px-5 sm:px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="font-serif font-bold text-[20px]" style={{ fontFamily: SERIF, color: C.ink }}>Sahan<span style={{ color: C.blue }}>.</span></Link>
          {ctx === "owner" ? (
            <Link href="/profile" className="text-[12.5px] font-semibold rounded-full border bg-white px-4 py-2" style={{ color: "#46506a", borderColor: "#d7d3cc" }}>Edit your profile</Link>
          ) : ctx === "registered" ? (
            <Link href="/home" className="text-[12.5px] font-semibold rounded-full border bg-white px-4 py-2" style={{ color: "#46506a", borderColor: "#d7d3cc" }}>Your home →</Link>
          ) : (
            <Link href="/signup" className="text-[12.5px] font-semibold rounded-full px-4 py-2 text-white" style={{ background: C.blue }}>Join Sahan</Link>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-[760px] px-5 sm:px-6 pb-20">
        {profile.kind === "individual" ? <IndividualProfile p={profile} /> : <CompanyProfile p={profile} />}

        {/* CTA */}
        {ctx !== "owner" ? (
          <div className="mt-[30px] rounded-[18px] p-8 sm:p-9 text-center" style={{ background: "#15171c" }}>
            <div className="text-[11px] font-semibold tracking-[0.2em]" style={{ color: "#8a93a6" }}>VERIFIED ON SAHAN</div>
            <div className="font-serif font-semibold text-[22px] sm:text-[24px] text-white mt-3 leading-[1.3] max-w-[440px] mx-auto" style={{ fontFamily: SERIF }}>
              Build your own verified profile and share it with a single link.
            </div>
            <p className="mt-3 text-[13.5px] leading-[1.55] max-w-[420px] mx-auto" style={{ color: "#aeb4bf" }}>
              Free, on any phone. Generate a recruiter-ready CV or company profile in minutes.
            </p>
            <Link href="/signup" className="inline-block mt-[22px] text-white text-[14px] font-semibold rounded-[10px] px-7 py-3" style={{ background: C.blue }}>Join Sahan — it&apos;s free</Link>
          </div>
        ) : (
          <p className="mt-6 text-center text-[12.5px]" style={{ color: C.muted }}>
            This is your public profile — others see it exactly like this. <Link href="/profile" className="font-medium hover:underline" style={{ color: C.blue }}>Edit →</Link>
          </p>
        )}

        <div className="mt-[26px] flex items-center justify-between flex-wrap gap-2.5">
          <Link href="/" className="font-serif font-bold text-[16px]" style={{ fontFamily: SERIF, color: C.ink }}>Sahan<span style={{ color: C.blue }}>.</span></Link>
          <div className="text-[11.5px]" style={{ color: C.soft }}>Free CV &amp; company-profile maker for East Africa</div>
        </div>
      </div>
    </div>
  );
}

// ── Individual ──
function IndividualProfile({ p }: { p: Extract<Awaited<ReturnType<typeof loadPublicProfile>>, { kind: "individual" }> }) {
  const verified =
    p.experiences.filter((x) => x.verified).length +
    p.educations.filter((x) => x.verified).length +
    p.certifications.filter((x) => x.verified).length;
  const latestOrg = p.experiences[0]?.organization || "";
  const showOrg = latestOrg && (!p.headline || !p.headline.includes(latestOrg));
  const topCert = p.certifications.find((c) => c.verified) || p.certifications[0];
  const stats = ([
    ["Roles", p.experiences.length, C.ink],
    ["Verified", verified, C.green],
    ["Skills", p.skills.length, C.ink],
    ["Languages", p.languages.length, C.ink],
  ] as [string, number, string][]).filter(([, n]) => n > 0);

  return (
    <article>
      {/* Header card */}
      <header className="relative mt-[26px] bg-white rounded-[20px] overflow-hidden border shadow-sm" style={{ borderColor: C.cardBorder }}>
        <div className="h-[108px]" style={{ background: "linear-gradient(120deg,#20304d 0%,#2d4a86 100%)" }} />
        <div className="px-6 sm:px-8 pb-7">
          <div className="flex items-end justify-between gap-4 -mt-[46px]">
            <Avatar src={p.photoUrl} name={p.fullName} round />
            <ContactActions name={p.fullName} headline={p.headline} email={p.email} phone={p.phone} org="" />
          </div>

          <div className="flex items-center gap-2.5 mt-4">
            <h1 className="font-serif font-semibold text-[26px] sm:text-[29px] tracking-[-0.01em] leading-[1.1] break-words" style={{ fontFamily: SERIF, color: C.ink }}>{p.fullName}</h1>
            {verified > 0 && <VerifiedCheck title="Verified credentials" />}
          </div>
          {p.headline && <div className="mt-1.5 text-[14.5px] font-medium" style={{ color: C.blue }}>{p.headline}</div>}
          {showOrg && <div className="text-[13.5px]" style={{ color: C.muted }}>{latestOrg}</div>}

          <div className="flex flex-wrap gap-2 mt-4">
            {p.location && <Chip icon={<span style={{ color: "#9a9a92" }}>⌖</span>}>{p.location}</Chip>}
            {topCert?.verified && <Chip icon={<span style={{ color: C.green }}>✦</span>}>{[topCert.name, topCert.issuer].filter(Boolean).join(" — ")}</Chip>}
          </div>

          {p.summary && <ReadMore text={p.summary} className="mt-5 text-[14px] leading-[1.65]" lines={6} style={{ color: C.body }} />}

          {stats.length > 1 && (
            <div className="flex gap-[18px] mt-[22px] pt-5 border-t" style={{ borderColor: C.hair }}>
              {stats.map(([label, n, color], i) => (
                <div key={label} className="flex gap-[18px]">
                  {i > 0 && <div className="w-px self-stretch" style={{ background: C.hair }} />}
                  <div>
                    <div className="font-serif font-semibold text-[22px]" style={{ fontFamily: SERIF, color }}>{n}</div>
                    <div className="text-[11.5px] mt-px" style={{ color: C.faint2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Experience */}
      {p.experiences.length > 0 && (
        <section className="mt-4">
          <SectionCard title="Experience" meta={`${p.experiences.length} ${p.experiences.length === 1 ? "role" : "roles"}`} bodyClass="px-6 sm:px-7">
            {p.experiences.map((e, i) => (
              <TimelineItem key={e.id} first={i === 0} last={i === p.experiences.length - 1} verified={e.verified}
                title={e.title} date={e.dateRange}
                meta={[e.organization, e.location].filter(Boolean).join(" · ")} note={e.verifiedNote}
                description={e.description} />
            ))}
          </SectionCard>
        </section>
      )}

      {/* Education + Certifications */}
      {(p.educations.length > 0 || p.certifications.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {p.educations.length > 0 && (
            <SectionCard title="Education" bodyClass="px-6 sm:px-7 py-5 flex flex-col gap-4">
              <ListItems items={p.educations.map((e) => ({
                key: e.id, title: e.qualification + (e.field ? `, ${e.field}` : ""), sub: e.institution, meta: e.dateRange, verified: e.verified,
              }))} />
            </SectionCard>
          )}
          {p.certifications.length > 0 && (
            <SectionCard title="Certifications" bodyClass="px-6 sm:px-7 py-5 flex flex-col gap-4">
              <ListItems items={p.certifications.map((c) => ({
                key: c.id, title: c.name, sub: c.issuer, meta: c.year, verified: c.verified,
              }))} />
            </SectionCard>
          )}
        </div>
      )}

      {/* Skills + Languages */}
      {(p.skills.length > 0 || p.languages.length > 0) && (
        <div className="grid sm:grid-cols-[1.4fr_1fr] gap-4 mt-4">
          {p.skills.length > 0 && (
            <SectionCard title="Skills" bodyClass="px-6 sm:px-7 py-5 flex flex-wrap gap-1.5">
              {p.skills.map((s) => (
                <span key={s.id} className="rounded-full px-3 py-1 text-[12px] border" style={{ borderColor: C.chipBorder, background: C.chipBg, color: "#3a3a34" }}>{s.name}</span>
              ))}
            </SectionCard>
          )}
          {p.languages.length > 0 && (
            <SectionCard title="Languages" bodyClass="px-6 sm:px-7 py-5 flex flex-col gap-3">
              {p.languages.map((l, i) => {
                const { name, level } = splitLang(l);
                return (
                  <div key={i}>
                    {i > 0 && <div className="h-px -mt-1.5 mb-3" style={{ background: C.line }} />}
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px]" style={{ color: C.ink }}>{name}</span>
                      {level && <span className="text-[12px]" style={{ color: C.faint }}>{level}</span>}
                    </div>
                  </div>
                );
              })}
            </SectionCard>
          )}
        </div>
      )}
    </article>
  );
}

// ── Company ──
function CompanyProfile({ p }: { p: Extract<Awaited<ReturnType<typeof loadPublicProfile>>, { kind: "company" }> }) {
  const verified = p.projects.filter((x) => x.verified).length + p.certifications.filter((x) => x.verified).length;
  const blueLine = p.tagline || p.sectors.slice(0, 3).join(" · ");
  const stats = ([
    ["Projects", p.projects.length, C.ink],
    ["Verified", verified, C.green],
    ["Clients", p.publicClients.length, C.ink],
    ["Sectors", p.sectors.length, C.ink],
  ] as [string, number, string][]).filter(([, n]) => n > 0);

  return (
    <article>
      <header className="relative mt-[26px] bg-white rounded-[20px] overflow-hidden border shadow-sm" style={{ borderColor: C.cardBorder }}>
        <div className="h-[108px]" style={{ background: "linear-gradient(120deg,#20304d 0%,#2d4a86 100%)" }} />
        <div className="px-6 sm:px-8 pb-7">
          <div className="flex items-end justify-between gap-4 -mt-[46px]">
            <Avatar src={p.logoUrl} name={p.name} />
            <ContactActions name={p.name} headline={blueLine} email={p.email} phone={p.phone} org={p.name} />
          </div>

          <div className="flex items-center gap-2.5 mt-4">
            <h1 className="font-serif font-semibold text-[26px] sm:text-[29px] tracking-[-0.01em] leading-[1.1] break-words" style={{ fontFamily: SERIF, color: C.ink }}>{p.name}</h1>
            {verified > 0 && <VerifiedCheck title="Verified credentials" />}
          </div>
          {blueLine && <div className="mt-1.5 text-[14.5px] font-medium" style={{ color: C.blue }}>{blueLine}</div>}

          <div className="flex flex-wrap gap-2 mt-4">
            {p.country && <Chip icon={<span style={{ color: "#9a9a92" }}>⌖</span>}>{p.country}</Chip>}
            {p.foundedYear && <Chip>Founded {p.foundedYear}</Chip>}
            {p.website && <Chip icon={<span style={{ color: "#9a9a92" }}>◐</span>}>{p.website.replace(/^https?:\/\//, "")}</Chip>}
          </div>

          {p.about && <ReadMore text={p.about} className="mt-5 text-[14px] leading-[1.65]" lines={6} style={{ color: C.body }} />}

          {stats.length > 1 && (
            <div className="flex gap-[18px] mt-[22px] pt-5 border-t" style={{ borderColor: C.hair }}>
              {stats.map(([label, n, color], i) => (
                <div key={label} className="flex gap-[18px]">
                  {i > 0 && <div className="w-px self-stretch" style={{ background: C.hair }} />}
                  <div>
                    <div className="font-serif font-semibold text-[22px]" style={{ fontFamily: SERIF, color }}>{n}</div>
                    <div className="text-[11.5px] mt-px" style={{ color: C.faint2 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {(p.mission || p.vision) && (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {p.mission && <MvCard label="Mission" text={p.mission} />}
          {p.vision && <MvCard label="Vision" text={p.vision} dark />}
        </div>
      )}

      {p.ceo && (p.ceo.message || p.ceo.quote) && (
        <section className="mt-4">
          <SectionCard title="CEO message" bodyClass="px-6 sm:px-7 py-6 flex gap-5 sm:gap-6">
            <div className="flex-none text-center w-[74px]">
              <CeoCircle ceo={p.ceo} size={74} />
              {p.ceo.name && <div className="font-semibold text-[12.5px] mt-2.5 leading-tight" style={{ color: C.ink }}>{p.ceo.name}</div>}
              {p.ceo.title && <div className="text-[11px] mt-0.5" style={{ color: C.muted }}>{p.ceo.title}</div>}
            </div>
            <div className="flex-1 min-w-0 pl-5 sm:pl-6" style={{ borderLeft: "2px solid #e0e6f2" }}>
              {p.ceo.quote && <div className="font-serif font-semibold text-[17px] leading-snug" style={{ fontFamily: SERIF, color: C.ink }}>{p.ceo.quote}</div>}
              {p.ceo.message && <ReadMore text={p.ceo.message} className={`text-[13.5px] leading-[1.6] ${p.ceo.quote ? "mt-2.5" : ""}`} lines={4} style={{ color: "#52524c" }} />}
            </div>
          </SectionCard>
        </section>
      )}

      {p.projects.length > 0 && (
        <section className="mt-4">
          <SectionCard title="Selected projects" meta={`${p.projects.length}`} bodyClass="px-6 sm:px-7">
            {p.projects.map((proj, i) => (
              <TimelineItem key={proj.id} first={i === 0} last={i === p.projects.length - 1} verified={proj.verified}
                title={proj.project_name} date={proj.dateRange}
                meta={[proj.client_name, proj.sector].filter(Boolean).join(" · ")} note={proj.verifiedNote}
                description={proj.scope} descriptionAsList />
            ))}
          </SectionCard>
        </section>
      )}

      {p.projects.some((proj) => proj.media.length > 0) && (
        <section className="mt-4">
          <SectionCard title="Project gallery" bodyClass="px-6 sm:px-7 py-6">
            <div className="space-y-7">
              {p.projects.filter((proj) => proj.media.length > 0).map((proj) => (
                <div key={proj.id}>
                  <h3 className="font-serif font-semibold text-[15px] tracking-tightish" style={{ fontFamily: SERIF, color: C.ink }}>{proj.project_name}</h3>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {proj.media.map((m, i) => (
                      <figure key={i} className="min-w-0">
                        <div className="rounded-[10px] overflow-hidden border" style={{ borderColor: C.cardBorder }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.url} alt={m.caption || proj.project_name} className="w-full aspect-[4/3] object-cover block" loading="lazy" />
                        </div>
                        {m.caption && <figcaption className="mt-1.5 text-[11.5px] leading-snug" style={{ color: C.muted }}>{m.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      )}

      {p.sectors.length > 0 && (
        <section className="mt-4">
          <SectionCard title="Sectors" bodyClass="px-6 sm:px-7 py-5"><TagRow items={p.sectors} /></SectionCard>
        </section>
      )}

      {p.servicesFull.length > 0 && (
        <section className="mt-4">
          <SectionCard title="What we do" bodyClass="px-6 sm:px-7 py-6"><ServicesGrid items={p.servicesFull} /></SectionCard>
        </section>
      )}

      {(p.team.length > 0 || p.ceo?.name) && (
        <section className="mt-4">
          <SectionCard title="Key personnel" meta={p.team.length ? `${p.team.length}` : undefined} bodyClass="px-6 sm:px-7 py-7">
            <Organogram ceo={p.ceo} team={p.team} />
          </SectionCard>
        </section>
      )}

      {p.certifications.length > 0 && (
        <section className="mt-4">
          <SectionCard title="Accreditations" bodyClass="px-6 sm:px-7 py-5 flex flex-col gap-4">
            <ListItems items={p.certifications.map((c) => ({ key: c.id, title: c.name, sub: c.issuer, meta: c.year, verified: c.verified }))} />
          </SectionCard>
        </section>
      )}

      {p.publicClients.length > 0 && (
        <section className="mt-4">
          <SectionCard title="Selected clients" bodyClass="px-6 sm:px-7 py-5 flex flex-wrap items-center gap-3">
            {p.publicClients.map((c, i) => (
              c.logoUrl ? (
                <span key={i} className="inline-flex items-center justify-center h-[52px] px-3.5 rounded-lg border bg-white" style={{ borderColor: C.chipBorder }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logoUrl} alt={c.name} className="max-h-9 max-w-[130px] object-contain block" />
                </span>
              ) : (
                <span key={i} className="inline-flex items-center h-[52px] rounded-full px-[15px] text-[12.5px] border" style={{ borderColor: C.chipBorder, background: C.chipBg, color: "#3a3a34" }}>{c.name}</span>
              )
            ))}
          </SectionCard>
        </section>
      )}
    </article>
  );
}

// ── shared pieces ──
function Avatar({ src, name, round }: { src: string | null; name: string; round?: boolean }) {
  const cls = round ? "rounded-full object-cover" : "rounded-2xl object-contain bg-white p-1.5";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`w-[104px] h-[104px] ${cls} border-4 border-white shrink-0`} style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.14)" }} />;
  }
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "·";
  return (
    <div className={`w-[104px] h-[104px] ${round ? "rounded-full" : "rounded-2xl"} border-4 border-white shrink-0 flex items-center justify-center font-serif text-[36px] text-white`}
      style={{ fontFamily: SERIF, background: "linear-gradient(120deg,#20304d,#2d4a86)", boxShadow: "0 4px 14px rgba(0,0,0,0.14)" }}>{initials}</div>
  );
}

function VerifiedCheck({ title }: { title: string }) {
  return (
    <span title={title} className="shrink-0 inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-white text-[12px]" style={{ background: C.green }}>✓</span>
  );
}

function Chip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[7px] rounded-full border px-[13px] py-[7px] text-[12.5px]" style={{ borderColor: C.chipBorder, color: "#4a4a44" }}>
      {icon}{children}
    </span>
  );
}

// vCard "Save contact" + (owner aside) — server-rendered data URI, no JS.
function ContactActions({ name, headline, email, phone, org }: { name: string; headline: string; email: string | null; phone: string | null; org: string }) {
  if (!email && !phone) return <div className="mb-2" />;
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(name)}`];
  if (org) lines.push(`ORG:${esc(org)}`);
  if (headline) lines.push(`TITLE:${esc(headline)}`);
  if (email) lines.push(`EMAIL:${esc(email)}`);
  if (phone) lines.push(`TEL:${esc(phone)}`);
  lines.push("END:VCARD");
  const href = `data:text/vcard;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
  return (
    <a href={href} download={`${name}.vcf`} className="mb-2 inline-flex items-center gap-[7px] text-white text-[13px] font-semibold rounded-[9px] px-[17px] py-2.5 shrink-0" style={{ background: "#15171c" }}>
      <span>⤓</span>Save contact
    </a>
  );
}

// A self-contained section card: the header sits INSIDE the card, at the top,
// above a hairline divider. This keeps the spacing between sections to a small,
// even card-to-card margin (rather than the title floating in the gap).
function SectionCard({ title, meta, bodyClass, children }: {
  title: string; meta?: string; bodyClass?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: C.cardBorder }}>
      <div className="flex items-baseline gap-2.5 px-6 sm:px-7 pt-[18px] pb-3.5 border-b" style={{ borderColor: C.line }}>
        <h2 className="font-serif font-semibold text-[18px]" style={{ fontFamily: SERIF, color: C.ink }}>{title}</h2>
        {meta && <span className="text-[12px]" style={{ color: C.soft }}>{meta}</span>}
      </div>
      <div className={bodyClass ?? "px-6 sm:px-7 py-5"}>{children}</div>
    </div>
  );
}

function TimelineItem({ first, last, verified, title, date, meta, note, description, descriptionAsList }: {
  first: boolean; last: boolean; verified: boolean; title: string; date?: string; meta?: string; note?: string; description?: string; descriptionAsList?: boolean;
}) {
  return (
    <div className="flex gap-4 py-5" style={!first ? { borderTop: `1px solid ${C.line}` } : undefined}>
      <div className="flex-none w-[10px] flex flex-col items-center pt-[5px]">
        <span className="w-[9px] h-[9px] rounded-full" style={{ background: verified ? C.blue : C.dotIdle }} />
        {!last && <span className="flex-1 w-[1.5px] mt-1.5" style={{ background: C.connector }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3.5">
          <div className="font-serif font-semibold text-[16px]" style={{ fontFamily: SERIF, color: C.ink }}>{title}</div>
          {date && <div className="text-[12px] whitespace-nowrap" style={{ color: C.faint }}>{date}</div>}
        </div>
        <div className="flex items-center gap-2 mt-[3px] flex-wrap">
          {meta && <span className="text-[13px]" style={{ color: "#52524c" }}>{meta}</span>}
          {verified && <VerifiedTag note={note} />}
        </div>
        {description && (descriptionAsList
          ? <CollapsibleScope text={description} dotColor={C.blue} className="mt-2 text-[12.5px] leading-[1.55]" style={{ color: C.muted }} />
          : <ReadMore text={description} className="mt-2 text-[12.5px] leading-[1.55]" lines={4} style={{ color: C.muted }} />
        )}
      </div>
    </div>
  );
}

function VerifiedTag(_props: { note?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5" style={{ background: C.greenSoft, color: C.green }}>
      <span className="inline-flex items-center justify-center w-3 h-3 rounded-full text-white text-[7px]" style={{ background: C.green }}>✓</span>
      Verified
    </span>
  );
}

// Body-only list (no card wrapper) — rendered inside a SectionCard whose body
// supplies the padding + `flex flex-col gap-4`.
function ListItems({ items }: { items: Array<{ key: string; title: string; sub?: string; meta?: string; verified?: boolean }> }) {
  return (
    <>
      {items.map((it) => (
        <div key={it.key}>
          <div className="flex items-center gap-[7px]">
            <div className="font-serif font-semibold text-[14.5px]" style={{ fontFamily: SERIF, color: C.ink }}>{it.title}</div>
            {it.verified && <span className="inline-flex items-center justify-center w-[15px] h-[15px] rounded-full text-white text-[9px]" style={{ background: C.green }}>✓</span>}
          </div>
          {it.sub && <div className="text-[13px] mt-0.5" style={{ color: "#52524c" }}>{it.sub}</div>}
          {it.meta && <div className="text-[12px] mt-px" style={{ color: C.faint }}>{it.meta}</div>}
        </div>
      ))}
    </>
  );
}

function MvCard({ label, text, dark }: { label: string; text: string; dark?: boolean }) {
  return (
    <div className="rounded-2xl border shadow-sm p-5" style={dark ? { background: C.ink, borderColor: C.ink } : { background: "#fff", borderColor: C.cardBorder }}>
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em]" style={{ color: dark ? "#8a93a6" : C.blue }}>{label}</div>
      <p className="mt-2 font-serif italic text-[15px] leading-snug" style={{ fontFamily: SERIF, color: dark ? "#fff" : C.ink }}>&ldquo;{text}&rdquo;</p>
    </div>
  );
}

// Accent-dot row: tags flow horizontally (each prefixed with a small accent
// dot) and only wrap to a new line when the row's width is exhausted.
function TagRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2.5">
      {items.map((s) => (
        <span key={s} className="inline-flex items-center gap-2 text-[13.5px]" style={{ color: "#3a3a34" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-none" style={{ background: C.blue }} />
          {s}
        </span>
      ))}
    </div>
  );
}

// Services as a compact two-column "Name — description" grid.
function ServicesGrid({ items }: { items: Array<{ name: string; description: string }> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-10 gap-y-3.5">
      {items.map((s, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="mt-[7px] w-[7px] h-[7px] rounded-full flex-none" style={{ background: C.blue }} aria-hidden />
          <p className="flex-1 min-w-0 text-[13.5px] leading-snug" style={{ color: C.muted }}>
            <span className="font-serif font-semibold text-[15px]" style={{ fontFamily: SERIF, color: C.ink }}>{s.name}</span>
            {s.description && <> — {s.description}</>}
          </p>
        </div>
      ))}
    </div>
  );
}

function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "·";
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// CEO avatar — uploaded photo, else initials in a blue gradient circle.
function CeoCircle({ ceo, size }: { ceo: { name: string; photoUrl: string | null }; size: number }) {
  if (ceo.photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={ceo.photoUrl} alt="" className="rounded-full object-cover mx-auto" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-full mx-auto flex items-center justify-center font-serif font-semibold text-white"
      style={{ width: size, height: size, fontFamily: SERIF, fontSize: Math.round(size * 0.34), background: "linear-gradient(135deg,#3a64cf,#1c3f9e)" }}>
      {personInitials(ceo.name)}
    </div>
  );
}

// Organogram: CEO at the top (dark card) with reporting lines down to the team
// cards. Falls back to a plain card grid when there's no CEO. Responsive:
// 1 col on phones, up to 3 across on wider screens.
function Organogram({ ceo, team }: {
  ceo: { name: string; title: string; photoUrl: string | null } | null;
  team: Array<{ id: string; person_name: string; role: string }>;
}) {
  const hasCeo = Boolean(ceo?.name);
  const gridCls = team.length === 1 ? "grid-cols-1"
    : team.length === 2 ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  return (
    <div className="flex flex-col items-center">
      {hasCeo && ceo && (
        <>
          <div className="w-[230px] max-w-full rounded-xl px-[18px] py-[15px] text-center text-white" style={{ background: "#15171c" }}>
            <CeoCircle ceo={ceo} size={42} />
            <div className="font-serif font-semibold text-[15.5px] mt-2.5 leading-tight" style={{ fontFamily: SERIF }}>{ceo.name}</div>
            <div className="text-[10px] tracking-[0.16em] uppercase mt-[3px]" style={{ color: "#8a93a6" }}>{ceo.title || "Chief Executive Officer"}</div>
          </div>
          {team.length > 0 && <div className="w-[1.5px] h-5" style={{ background: C.connector }} />}
        </>
      )}
      {team.length > 0 && (
        <div className={`grid gap-4 w-full ${gridCls}`}>
          {team.map((m) => (
            <div key={m.id} className="flex flex-col items-center">
              {hasCeo && <div className="w-[1.5px] h-4" style={{ background: C.connector }} />}
              <div className="w-full rounded-xl border p-4 text-center" style={{ borderColor: C.cardBorder }}>
                <div className="w-[38px] h-[38px] mx-auto rounded-full flex items-center justify-center font-serif font-semibold text-[14px]" style={{ background: "#eef1f6", color: "#46506a", fontFamily: SERIF }}>{personInitials(m.person_name)}</div>
                <div className="font-serif font-semibold text-[14.5px] mt-2.5 leading-tight" style={{ fontFamily: SERIF, color: C.ink }}>{m.person_name}</div>
                {m.role && <div className="text-[12px] mt-1" style={{ color: C.blue }}>{m.role}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function splitLang(s: string): { name: string; level: string } {
  const m = /^(.*?)\s*[([（]\s*(.+?)\s*[)\]）]\s*$/.exec(s.trim());
  return m ? { name: m[1].trim(), level: m[2].trim() } : { name: s.trim(), level: "" };
}
