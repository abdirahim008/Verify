// Company Profile — Template 3: "Minimalist / Architectural"
// White space, hairlines, massive type, single restrained accent.
// Cover + interior

function CompanyCoverMinimal() {
  const c = SAMPLE_COMPANY;
  const ink = '#0e1116';
  const accent = '#0a5cad';
  const muted = '#6e7480';
  const rule = '#e3e6eb';
  const bg = '#fafafa';

  return (
    <div style={{
      width: 794, height: 1123, background: bg, color: ink,
      fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
      padding: '64px 64px 56px', boxSizing: 'border-box',
    }}>
      {/* Top corners — meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontWeight: 600 }}>
        <span>Wadani Engineering Group</span>
        <span>Profile · MMXXVI</span>
      </div>

      {/* Tiny serif monogram lockup top-left */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 400,
          letterSpacing: '-0.02em', fontStyle: 'italic', color: accent,
        }}>W.E.G</span>
        <span style={{ width: 18, height: 1, background: ink }} />
        <span style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, fontWeight: 600 }}>Est. 2012</span>
      </div>

      {/* Massive serif statement, anchored low */}
      <div style={{ position: 'absolute', left: 64, right: 64, top: 280 }}>
        <div style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 168, fontWeight: 200,
          letterSpacing: '-0.05em', lineHeight: 0.86, color: ink,
        }}>
          We<br />build<br />
          <span style={{ fontStyle: 'italic', color: accent, fontWeight: 250 }}>Somalia.</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 12, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, maxWidth: 420, lineHeight: 1.6 }}>
          Civil infrastructure — designed, supervised, and maintained by Somali engineers, across south-central Somalia and the Federal Member States.
        </div>
      </div>

      {/* Bottom hairline grid */}
      <div style={{
        position: 'absolute', bottom: 56, left: 64, right: 64,
        paddingTop: 18, borderTop: `2px solid ${ink}`,
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, alignItems: 'baseline',
      }}>
        {[
          ['Founded', '2012'],
          ['Reg.', 'MOG-2012-04419'],
          ['HQ', 'Mogadishu'],
          ['Staff', '64'],
          ['Sectors', '5'],
          ['Web', 'wadani-eg.so'],
        ].map(([k, v], i) => (
          <div key={i}>
            <div style={{ fontSize: 8.5, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>{k}</div>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 15, marginTop: 4, fontWeight: 400, letterSpacing: '-0.005em' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Small verified mark — subtle, like a publisher's colophon */}
      <div style={{
        position: 'absolute', bottom: 20, right: 64,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 8.5, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
      }}>
        <svg width="9" height="9" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill={accent}/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        Verified · Sahan
      </div>

      {/* A very subtle texture / paper grain hint */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(10,92,173,0.04), transparent 40%)',
      }} />
    </div>
  );
}

function CompanyAboutMinimal() {
  const c = SAMPLE_COMPANY;
  const ink = '#0e1116';
  const accent = '#0a5cad';
  const muted = '#6e7480';
  const rule = '#e3e6eb';
  const bg = '#fafafa';

  return (
    <div style={{
      width: 794, height: 1123, background: bg, color: ink,
      fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif",
      padding: '64px 80px 60px', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Running head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: muted, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
        <span>Wadani Engineering Group</span>
        <span>02 / 08</span>
      </div>

      {/* Section opener */}
      <div style={{ marginTop: 72 }}>
        <div style={{ fontSize: 10, color: accent, letterSpacing: '0.24em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 18 }}>
          Chapter 01 — The firm
        </div>
        <h1 style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 88, fontWeight: 250,
          letterSpacing: '-0.04em', lineHeight: 0.94, margin: 0, maxWidth: 580,
        }}>
          We deliver work that has to <span style={{ fontStyle: 'italic', color: accent }}>last.</span>
        </h1>
      </div>

      {/* Lede */}
      <p style={{
        marginTop: 44, fontSize: 16, lineHeight: 1.65, color: ink, maxWidth: 540, fontWeight: 400,
      }}>
        Wadani Engineering Group is a Somali civil-engineering and project-management firm founded in 2012. We deliver donor-funded infrastructure — roads, water, healthcare and education facilities — across south-central Somalia and the Federal Member States.
      </p>

      {/* Hairline divider */}
      <div style={{ height: 1, background: ink, marginTop: 56, width: 60 }} />

      {/* Mission + Vision — pulled quotes, no boxes */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '110px 1fr', gap: 32, alignItems: 'start' }}>
        <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, paddingTop: 8 }}>Mission</div>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, lineHeight: 1.35, fontStyle: 'italic',
          margin: 0, fontWeight: 400, color: ink, letterSpacing: '-0.01em',
        }}>
          To build infrastructure that withstands the climate, the politics, and the next generation.
        </p>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '110px 1fr', gap: 32, alignItems: 'start' }}>
        <div style={{ fontSize: 9.5, color: muted, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, paddingTop: 8 }}>Vision</div>
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, lineHeight: 1.35, fontStyle: 'italic',
          margin: 0, fontWeight: 400, color: ink, letterSpacing: '-0.01em',
        }}>
          A Horn of Africa where every region's public infrastructure is built and maintained by its own people.
        </p>
      </div>

      {/* Sectors / services as flat lists */}
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        {[
          { label: 'Sectors', items: c.sectors },
          { label: 'Services', items: c.services },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, color: accent, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, paddingBottom: 14, borderBottom: `1px solid ${ink}` }}>
              {col.label}
            </div>
            {col.items.map((s, j) => (
              <div key={j} style={{
                fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, fontWeight: 400,
                padding: '12px 0', borderBottom: j < col.items.length - 1 ? `1px solid ${rule}` : 'none',
                letterSpacing: '-0.005em',
              }}>{s}</div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 28, left: 80, right: 80,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase',
        fontWeight: 700, paddingTop: 12, borderTop: `1px solid ${rule}`,
      }}>
        <span>Wadani Engineering Group</span>
        <span style={{ color: accent }}>Sahan · Verified</span>
        <span>02</span>
      </div>
    </div>
  );
}

window.CompanyCoverMinimal = CompanyCoverMinimal;
window.CompanyAboutMinimal = CompanyAboutMinimal;
