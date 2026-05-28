// Company Profile PDF — A4 portrait
// COVER + interior pages, side-by-side as a spread
// Cover must feel elegant — this is the wow moment for companies

function CompanyProfileSpread() {
  return (
    <div style={{ display: 'flex', gap: 28 }}>
      <CompanyCover />
      <CompanyAbout />
      <CompanyProjects />
    </div>
  );
}

// — Page 1: Cover —
function CompanyCover() {
  const c = SAMPLE_COMPANY;
  const teal = '#0e2a4a';
  const tealDark = '#0a1a2e';
  const cream = '#e8edf3';
  const sand = '#bfcad6';
  const sand2 = '#c8d2dc';

  return (
    <div style={{
      width: 794, height: 1123, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(165deg, ${tealDark} 0%, ${teal} 55%, #0c1f38 100%)`,
      color: cream, fontFamily: 'IBM Plex Sans, sans-serif',
    }}>
      {/* Subtle radial warmth */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 78% 22%, rgba(180,200,224,0.32), transparent 55%)`,
      }} />
      {/* Topographic rule lines */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }} width="794" height="1123">
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i}
            d={`M -50 ${200 + i * 60} Q 200 ${140 + i * 60}, 400 ${220 + i * 60} T 850 ${190 + i * 60}`}
            stroke={cream} strokeWidth="0.7" fill="none"
          />
        ))}
      </svg>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 56, left: 64, right: 64,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: sand2, fontWeight: 600, fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif",
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 26, height: 1, background: sand2 }} />
          Company Profile
        </span>
        <span>Edition 2026 · I</span>
      </div>

      {/* Wordmark monogram */}
      <div style={{
        position: 'absolute', top: 130, left: 64,
        width: 78, height: 78, borderRadius: '50%',
        border: `1px solid ${sand}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 28, fontWeight: 350, color: sand2,
        letterSpacing: '-0.02em',
      }}>
        WE<span style={{ fontStyle: 'italic' }}>.</span>
      </div>

      {/* Main title block — anchored to a low optical centre */}
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 280 }}>
        <div style={{
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 14, fontStyle: 'italic',
          color: sand2, letterSpacing: '0.02em', marginBottom: 22,
        }}>
          Established Mogadishu, MMXII
        </div>
        <h1 style={{
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 102, fontWeight: 300,
          letterSpacing: '-0.04em', lineHeight: 0.88, margin: 0, color: cream,
          fontFeatureSettings: '"ss01"',
        }}>
          Wadani<br />
          Engineering<br />
          <span style={{ fontStyle: 'italic', color: sand2, fontWeight: 250 }}>Group.</span>
        </h1>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ width: 56, height: 2, background: sand }} />
          <div style={{
            fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 500, fontSize: 13,
            letterSpacing: '0.04em', color: cream, textTransform: 'uppercase',
          }}>
            Civil infrastructure for the Horn of Africa
          </div>
        </div>
      </div>

      {/* Bottom meta strip */}
      <div style={{
        position: 'absolute', bottom: 56, left: 64, right: 64,
        paddingTop: 18, borderTop: `1px solid ${cream}33`,
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 22,
      }}>
        {[
          ['Founded', '2012'],
          ['Registration', 'MOG-2012-04419'],
          ['Headquarters', 'Mogadishu, SO'],
          ['Website', 'wadani-eg.so'],
        ].map(([k, v], i) => (
          <div key={i}>
            <div style={{ fontSize: 8.5, color: sand2, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>{k}</div>
            <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 14, fontWeight: 400, color: cream, marginTop: 4, letterSpacing: '-0.005em' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Small verified mark — like a wax seal */}
      <div style={{
        position: 'absolute', top: 150, right: 64,
        width: 74, height: 74, borderRadius: '50%',
        border: `1.5px solid ${sand}`, color: sand2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", textAlign: 'center', lineHeight: 1.2,
      }}>
        <svg width="16" height="16" viewBox="0 0 11 11" style={{ marginBottom: 2 }}>
          <circle cx="5.5" cy="5.5" r="5.5" fill={sand2} />
          <path d="M3 5.5 L4.7 7.2 L8 4" stroke={teal} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ fontSize: 7, letterSpacing: '0.18em', fontWeight: 700 }}>SAHAN</div>
        <div style={{ fontSize: 6.5, letterSpacing: '0.12em', color: '#9aa6b3' }}>VERIFIED</div>
      </div>
    </div>
  );
}

// — Page 2: About / Mission / Vision / Sectors —
function CompanyAbout() {
  const c = SAMPLE_COMPANY;
  const cream = '#f6f2ea';
  const ink = '#1a1a17';
  const inkSoft = '#3a3a3d';
  const sienna = '#0d3b66';
  const teal = '#0e2a4a';
  const muted = '#6e7480';
  const rule = '#dcd6c8';

  return (
    <div style={{
      width: 794, height: 1123, background: cream, color: ink,
      fontFamily: 'IBM Plex Sans, sans-serif', padding: '64px 64px 56px', boxSizing: 'border-box',
      position: 'relative',
    }}>
      {/* Running head */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>
        <span>Wadani Engineering Group · Company Profile</span>
        <span>02</span>
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 10, color: sienna, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>
          About the firm
        </div>
        <h2 style={{
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 52, fontWeight: 350,
          letterSpacing: '-0.03em', lineHeight: 0.95, margin: '12px 0 0', maxWidth: 540,
          fontFeatureSettings: '"ss01"',
        }}>
          Fourteen years of <span style={{ fontStyle: 'italic', color: sienna }}>building&nbsp;Somalia</span>.
        </h2>
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: inkSoft, marginTop: 22, maxWidth: 600, textAlign: 'justify' }}>
          Wadani Engineering Group is a Somali civil-engineering and project-management firm founded in 2012. We deliver donor-funded infrastructure — roads, water, healthcare and education facilities — across south-central Somalia and the Federal Member States. Our staff are Somali engineers, surveyors and community-engagement specialists who live and work in the regions we serve.
        </p>
      </div>

      {/* Mission + Vision cards */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ background: '#fff', border: `1px solid ${rule}`, borderRadius: 10, padding: '20px 22px', position: 'relative' }}>
          <div style={{ fontSize: 9.5, color: sienna, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>Mission</div>
          <p style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, lineHeight: 1.35, fontStyle: 'italic', color: ink, margin: '10px 0 0', fontWeight: 400, letterSpacing: '-0.005em' }}>
            "To build infrastructure that withstands the climate, the politics, and the next generation."
          </p>
        </div>
        <div style={{ background: teal, color: '#e6ecf3', borderRadius: 10, padding: '20px 22px' }}>
          <div style={{ fontSize: 9.5, color: '#bfcad6', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>Vision</div>
          <p style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, lineHeight: 1.35, fontStyle: 'italic', margin: '10px 0 0', fontWeight: 400, letterSpacing: '-0.005em' }}>
            "A Horn of Africa where every region's public infrastructure is built and maintained by its own people."
          </p>
        </div>
      </div>

      {/* Sectors + services */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
        <div>
          <div style={{ fontSize: 10, color: sienna, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, marginBottom: 14 }}>Sectors</div>
          {c.sectors.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: i < c.sectors.length - 1 ? `1px solid ${rule}` : 'none' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: muted, width: 18 }}>0{i + 1}</span>
              <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 15, fontWeight: 450, letterSpacing: '-0.005em' }}>{s}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, color: sienna, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, marginBottom: 14 }}>Core services</div>
          {c.services.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: i < c.services.length - 1 ? `1px solid ${rule}` : 'none' }}>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: muted, width: 18 }}>0{i + 1}</span>
              <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 15, fontWeight: 450, letterSpacing: '-0.005em' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats footer */}
      <div style={{
        position: 'absolute', bottom: 56, left: 64, right: 64,
        background: ink, color: cream, borderRadius: 10, padding: '20px 26px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20,
      }}>
        {[
          ['14', 'Years of operation'],
          ['$22M+', 'Delivered project value'],
          ['9', 'Donor partners'],
          ['64', 'In-house staff'],
        ].map(([n, l], i) => (
          <div key={i} style={{ borderLeft: i === 0 ? 'none' : `1px solid ${cream}22`, paddingLeft: i === 0 ? 0 : 18 }}>
            <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 10, color: '#a8a193', marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// — Page 3: Selected Projects (where verified badges shine) —
function CompanyProjects() {
  const c = SAMPLE_COMPANY;
  const cream = '#f6f2ea';
  const ink = '#1a1a17';
  const inkSoft = '#3a3a3d';
  const sienna = '#0d3b66';
  const muted = '#6e7480';
  const rule = '#dcd6c8';

  return (
    <div style={{
      width: 794, height: 1123, background: cream, color: ink,
      fontFamily: 'IBM Plex Sans, sans-serif', padding: '64px 64px 56px', boxSizing: 'border-box',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>
        <span>Wadani Engineering Group · Company Profile</span>
        <span>03</span>
      </div>

      <div style={{ marginTop: 36 }}>
        <div style={{ fontSize: 10, color: sienna, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600 }}>
          Selected projects
        </div>
        <h2 style={{
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 48, fontWeight: 350,
          letterSpacing: '-0.03em', lineHeight: 0.95, margin: '12px 0 8px', maxWidth: 600,
        }}>
          The work, on the <span style={{ fontStyle: 'italic', color: sienna }}>record.</span>
        </h2>
        <p style={{ fontSize: 13, color: muted, maxWidth: 540, marginBottom: 28, lineHeight: 1.55 }}>
          Verified entries are independently confirmed by the named client or donor. Unverified entries are listed but not vouched for.
        </p>
      </div>

      {/* Project cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {c.projects.map((p, i) => (
          <div key={i} style={{
            background: '#fff', border: `1px solid ${rule}`, borderRadius: 10,
            padding: '18px 22px', display: 'grid', gridTemplateColumns: '64px 1fr 110px', gap: 18, alignItems: 'flex-start',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 6, background: cream,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${rule}`,
            }}>
              <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, fontWeight: 400, color: ink, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 8, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4, fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif" }}>
                {p.sector}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.name}</span>
                {p.verified && <CVVerified note={`Verified · ${p.verifier}`} small />}
              </div>
              <div style={{ fontSize: 11.5, color: sienna, marginTop: 2, fontStyle: 'italic', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}>
                {p.client} · {p.years}
              </div>
              <p style={{ fontSize: 11.5, lineHeight: 1.55, color: inkSoft, margin: '8px 0 0', maxWidth: 460 }}>{p.scope}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif" }}>Value</div>
              <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, fontWeight: 400, marginTop: 2, letterSpacing: '-0.01em' }}>{p.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 36, left: 64, right: 64,
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase',
        fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", paddingTop: 12, borderTop: `1px solid ${rule}`,
      }}>
        <span>wadani-eg.so</span>
        <span style={{ color: sienna }}>Verified on Sahan</span>
        <span>Page 03 / 08</span>
      </div>
    </div>
  );
}

window.CompanyProfileSpread = CompanyProfileSpread;
window.CompanyCover = CompanyCover;
window.CompanyAbout = CompanyAbout;
window.CompanyProjects = CompanyProjects;
