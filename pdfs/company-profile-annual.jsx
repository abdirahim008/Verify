// Company Profile — Template 2: "Annual Report"
// White & navy. Big building photo. Annual-report register.
// Cover + interior

function CompanyCoverAnnual() {
  const c = SAMPLE_COMPANY;
  const navy = '#0d3b66';
  const navyDeep = '#072044';
  const cream = '#fafaf7';
  const ink = '#101418';
  const muted = '#5e6166';
  const rule = '#d8dde3';

  return (
    <div style={{
      width: 794, height: 1123, background: cream, color: ink,
      fontFamily: "'Source Sans 3', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top navy banner */}
      <div style={{
        height: 240, background: `linear-gradient(180deg, ${navy} 0%, ${navyDeep} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle architectural lines */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.18 }} width="794" height="240">
          <g stroke="#fff" strokeWidth="0.6" fill="none">
            <line x1="120" y1="0" x2="120" y2="240" />
            <line x1="320" y1="0" x2="320" y2="240" />
            <line x1="520" y1="0" x2="520" y2="240" />
            <line x1="720" y1="0" x2="720" y2="240" />
            <line x1="0" y1="80" x2="794" y2="80" />
            <line x1="0" y1="160" x2="794" y2="160" />
          </g>
        </svg>

        <div style={{ position: 'absolute', top: 56, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cfd6e0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
            <span style={{ width: 30, height: 1, background: '#cfd6e0' }} />
            Company Profile
          </div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 600 }}>
            Edition · MMXXVI
          </div>
        </div>

        {/* Big serif title in the band */}
        <div style={{ position: 'absolute', bottom: 36, left: 64, right: 64 }}>
          <h1 style={{
            fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 76, fontWeight: 350,
            letterSpacing: '-0.025em', lineHeight: 1, margin: 0, color: '#fff',
          }}>
            Wadani Engineering<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#b6c4d6' }}>Group.</span>
          </h1>
        </div>
      </div>

      {/* Photo placeholder strip */}
      <div style={{ margin: '0 64px', marginTop: -42, position: 'relative', zIndex: 2 }}>
        <div style={{
          height: 240, background: '#dde3eb',
          border: `1px solid ${rule}`, borderRadius: 4, position: 'relative', overflow: 'hidden',
          backgroundImage: 'repeating-linear-gradient(45deg, #ced5df 0px, #ced5df 1px, #e0e6ed 1px, #e0e6ed 12px)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4,
            color: muted, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: '0.06em',
          }}>
            <div style={{ width: 36, height: 36, border: `1.5px solid ${muted}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>+</div>
            <div>signature site photograph · 16:9 · ≥ 2400px</div>
          </div>
        </div>
      </div>

      {/* Tagline & key facts */}
      <div style={{ padding: '36px 64px 0' }}>
        <div style={{ fontSize: 10.5, color: navy, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 700 }}>
          Established Mogadishu, 2012
        </div>
        <h2 style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, fontWeight: 400,
          letterSpacing: '-0.015em', lineHeight: 1.2, margin: '14px 0 0', maxWidth: 580,
          fontStyle: 'italic', color: navyDeep,
        }}>
          Civil infrastructure for the Horn of Africa — built, supervised, and maintained by Somali engineers.
        </h2>
      </div>

      {/* Bottom facts grid */}
      <div style={{
        position: 'absolute', bottom: 56, left: 64, right: 64,
        paddingTop: 22, borderTop: `1px solid ${rule}`,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14,
      }}>
        {[
          ['14', 'Years', 'Operating'],
          ['$22M+', 'Delivered', 'Project value'],
          ['64', 'Staff', 'In-house'],
          ['9', 'Donors', 'Active partnerships'],
        ].map(([n, l, s], i) => (
          <div key={i} style={{ borderLeft: i > 0 ? `1px solid ${rule}` : 'none', paddingLeft: i > 0 ? 18 : 0 }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 38, fontWeight: 400, color: navyDeep, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {n}
            </div>
            <div style={{ fontSize: 10, color: navy, marginTop: 8, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, fontFamily: "'Public Sans', sans-serif" }}>{l}</div>
            <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Tiny verified seal bottom right */}
      <div style={{
        position: 'absolute', bottom: 16, right: 16,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 9, color: muted, fontFamily: "'Public Sans', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
      }}>
        <svg width="11" height="11" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill={navy}/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
        Verified on Sahan
      </div>
    </div>
  );
}

function CompanyAboutAnnual() {
  const c = SAMPLE_COMPANY;
  const navy = '#0d3b66';
  const navyDeep = '#072044';
  const cream = '#fafaf7';
  const ink = '#101418';
  const muted = '#5e6166';
  const rule = '#d8dde3';

  return (
    <div style={{
      width: 794, height: 1123, background: cream, color: ink,
      fontFamily: "'Source Sans 3', system-ui, sans-serif", padding: '54px 64px 60px',
      position: 'relative', boxSizing: 'border-box',
    }}>
      {/* Running head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 600, paddingBottom: 10, borderBottom: `1px solid ${rule}` }}>
        <span>Wadani Engineering Group</span>
        <span>Company Profile · 02</span>
      </div>

      {/* Section heading */}
      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 10, color: navy, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 700, marginBottom: 14 }}>§ 01 · About the firm</div>
        <h1 style={{
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 48, fontWeight: 350,
          letterSpacing: '-0.025em', lineHeight: 1.02, margin: 0, maxWidth: 560,
        }}>
          Fourteen years of <span style={{ fontStyle: 'italic', color: navy }}>building Somalia</span>.
        </h1>
      </div>

      {/* Two-column lead */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, marginTop: 32 }}>
        <p style={{ fontSize: 12.5, lineHeight: 1.7, color: ink, margin: 0, columnCount: 1 }}>
          Wadani Engineering Group is a Somali civil-engineering and project-management firm founded in 2012. We deliver donor-funded infrastructure — roads, water, healthcare and education facilities — across south-central Somalia and the Federal Member States.
        </p>
        <p style={{ fontSize: 12.5, lineHeight: 1.7, color: ink, margin: 0 }}>
          Our staff are Somali engineers, surveyors and community-engagement specialists who live and work in the regions we serve. We design with the climate, the soil and the supply chain that actually exist.
        </p>
      </div>

      {/* Mission / Vision side-by-side */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { label: 'Mission', body: 'To build infrastructure that withstands the climate, the politics, and the next generation.' },
          { label: 'Vision', body: 'A Horn of Africa where every region\u2019s public infrastructure is built and maintained by its own people.' },
        ].map((m, i) => (
          <div key={i} style={{
            background: i === 1 ? navy : '#fff', color: i === 1 ? '#fff' : ink,
            border: i === 1 ? 'none' : `1px solid ${rule}`,
            padding: '24px 26px', borderRadius: 4, position: 'relative',
          }}>
            <div style={{ fontSize: 9.5, color: i === 1 ? '#b6c4d6' : navy, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 700 }}>{m.label}</div>
            <p style={{
              fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, lineHeight: 1.4,
              fontStyle: 'italic', margin: '12px 0 0', fontWeight: 400, letterSpacing: '-0.005em',
            }}>"{m.body}"</p>
          </div>
        ))}
      </div>

      {/* Sectors + services in a tight 2-column table */}
      <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        {[
          { label: 'Sectors', items: c.sectors },
          { label: 'Services', items: c.services },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontSize: 10, color: navy, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', sans-serif", fontWeight: 700, paddingBottom: 8, borderBottom: `1px solid ${navyDeep}` }}>
              § 0{i + 2} · {col.label}
            </div>
            {col.items.map((s, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '10px 0', borderBottom: j < col.items.length - 1 ? `1px solid ${rule}` : 'none' }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: muted, width: 22 }}>0{j + 1}.</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 28, left: 64, right: 64,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase',
        fontFamily: "'Public Sans', sans-serif", fontWeight: 600,
        paddingTop: 12, borderTop: `1px solid ${rule}`,
      }}>
        <span>wadani-eg.so</span>
        <span style={{ color: navy }}>Verified on Sahan</span>
        <span>Page 02 / 08</span>
      </div>
    </div>
  );
}

window.CompanyCoverAnnual = CompanyCoverAnnual;
window.CompanyAboutAnnual = CompanyAboutAnnual;
