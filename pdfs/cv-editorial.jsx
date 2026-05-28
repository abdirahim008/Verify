// CV Editorial — A4 portrait, magazine register
// Fraunces display + Newsreader body. Cream ink-on-paper. Drop cap. Single column.
// A4 = 794 × 1123 px at 96dpi

function CVEditorial() {
  const d = SAMPLE_INDIVIDUAL;
  const cream = '#f6f2ea';
  const ink = '#1a1a17';
  const inkSoft = '#3a3a3d';
  const sienna = '#0d3b66';
  const muted = '#6e7480';
  const rule = '#dcd6c8';

  return (
    <div style={{
      width: 794, height: 1123, background: cream, color: ink,
      fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", position: 'relative',
      padding: '72px 78px 64px', boxSizing: 'border-box',
      fontFeatureSettings: '"ss01", "onum"',
    }}>
      {/* Folio header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 10, color: muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'IBM Plex Sans, sans-serif' }}>
        <span>Curriculum vitae</span>
        <span>Mogadishu · 2026</span>
      </div>

      {/* Name + headline */}
      <div style={{ marginTop: 28 }}>
        <h1 style={{
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 72, fontWeight: 350, letterSpacing: '-0.035em',
          lineHeight: 0.92, margin: 0, fontFeatureSettings: '"ss01"',
        }}>
          Ifrah Hassan<br />
          <span style={{ fontStyle: 'italic', color: sienna, fontWeight: 300 }}>Abdi.</span>
        </h1>
        <div style={{ marginTop: 14, fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, fontStyle: 'italic', color: inkSoft, letterSpacing: '0.005em' }}>
          Senior Health Coordinator — Maternal &amp; Child Health
        </div>
        <div style={{ marginTop: 6, fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 11, color: muted, letterSpacing: '0.04em' }}>
          Mogadishu, Somalia · ifrah.abdi@example.so · +252 61 555 0184
        </div>
      </div>

      {/* Top rule */}
      <div style={{ height: 1, background: rule, margin: '32px 0 26px' }} />

      {/* Profile — drop cap */}
      <div style={{ fontSize: 13.5, lineHeight: 1.65, color: inkSoft, textAlign: 'justify', hyphens: 'auto' }}>
        <span style={{
          float: 'left', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 66, fontWeight: 300,
          lineHeight: 0.85, marginRight: 8, marginTop: 4, color: sienna, fontStyle: 'italic',
        }}>P</span>
        ublic health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia. Designed and led the regional cold-chain expansion for Banadir under UNICEF, raising routine immunisation coverage from 41% to 73% in twenty-two months. Comfortable across donor lines (BHA, ECHO, FCDO) and at home in the field.
      </div>
      <div style={{ clear: 'both' }} />

      {/* Experience */}
      <SectionHead label="Experience" sienna={sienna} rule={rule} />
      {d.experiences.map((e, i) => (
        <div key={i} style={{ marginBottom: 18, breakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em' }}>
                {e.title}
              </span>
              <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, fontStyle: 'italic', color: sienna, fontWeight: 400 }}>
                · {e.org}
              </span>
              {e.verified && <CVVerified note={`Verified · ${e.verifier}`} />}
            </div>
            <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 10.5, color: muted, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              {e.start.toUpperCase()} — {e.end.toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize: 11, color: muted, marginTop: 1, fontStyle: 'italic' }}>{e.loc}</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.6, color: inkSoft, marginTop: 6, marginBottom: 0, textAlign: 'justify' }}>{e.desc}</p>
        </div>
      ))}

      {/* Education + Skills two-up */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, marginTop: 4 }}>
        <div>
          <SectionHead label="Education" sienna={sienna} rule={rule} />
          {d.educations.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 14, fontWeight: 500, letterSpacing: '-0.01em' }}>
                  {e.qual}
                </span>
                <span style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 10, color: muted, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {e.years}
                </span>
              </div>
              <div style={{ fontSize: 12, color: inkSoft, fontStyle: 'italic', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {e.inst}
                {e.verified && <CVVerified note="Verified" small />}
              </div>
              {e.field && <div style={{ fontSize: 11, color: muted, marginTop: 1 }}>{e.field}</div>}
            </div>
          ))}

          <SectionHead label="Certifications" sienna={sienna} rule={rule} />
          {d.certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12.5, color: inkSoft, marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: muted, fontStyle: 'italic' }}>· {c.issuer}, {c.year}</span>
              {c.verified && <CVVerified note="Verified" small />}
            </div>
          ))}
        </div>

        <div>
          <SectionHead label="Skills" sienna={sienna} rule={rule} />
          <div style={{ fontSize: 12.5, color: inkSoft, lineHeight: 1.85, fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" }}>
            {d.skills.map((s, i) => (
              <span key={i}>
                {s}{i < d.skills.length - 1 && <span style={{ color: sienna, margin: '0 6px' }}>·</span>}
              </span>
            ))}
          </div>

          <SectionHead label="Languages" sienna={sienna} rule={rule} />
          <div style={{ fontSize: 12.5, color: inkSoft, lineHeight: 1.7 }}>
            {d.languages.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 36, left: 78, right: 78,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 9.5, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase',
        paddingTop: 14, borderTop: `1px solid ${rule}`,
      }}>
        <span>Ifrah H. Abdi · Curriculum Vitae</span>
        <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, fontSize: 11, color: sienna }}>Verified on Sahan</span>
        <span>Page 1 / 1</span>
      </div>
    </div>
  );
}

function SectionHead({ label, sienna, rule }) {
  return (
    <div style={{ marginTop: 26, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{
        fontFamily: 'IBM Plex Sans, sans-serif', fontSize: 10, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: sienna, fontWeight: 600,
      }}>{label}</span>
      <span style={{ flex: 1, height: 1, background: rule }} />
    </div>
  );
}

function CVVerified({ note, small }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'IBM Plex Sans, sans-serif', fontSize: small ? 9 : 9.5,
      fontWeight: 500, color: '#1f6b4d', background: '#d8e5dd',
      padding: '1.5px 6px 1.5px 4px', borderRadius: 99,
      letterSpacing: '0.01em', whiteSpace: 'nowrap', fontStyle: 'normal',
    }}>
      <svg width="9" height="9" viewBox="0 0 11 11">
        <circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d" />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
      {note}
    </span>
  );
}

window.CVEditorial = CVEditorial;
window.CVVerified = CVVerified;
window.SectionHead = SectionHead;
