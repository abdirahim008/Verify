// CV Sidebar — A4 portrait, two-column dark-teal executive CV
// Archivo display + IBM Plex Sans body

function CVSidebar() {
  const d = SAMPLE_INDIVIDUAL;
  const teal = '#0e2a4a';
  const tealDark = '#091e36';
  const cream = '#e6ecf3';
  const dim = '#9aa6b3';
  const sand = '#bfcad6';
  const verified = '#6fcf9c';

  return (
    <div style={{
      width: 794, height: 1123, color: cream,
      fontFamily: 'IBM Plex Sans, sans-serif', display: 'grid',
      gridTemplateColumns: '300px 1fr', position: 'relative',
    }}>
      {/* LEFT sidebar */}
      <aside style={{ background: tealDark, padding: '54px 30px 40px', color: cream }}>
        {/* Monogram */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: sand, color: tealDark,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em',
          marginBottom: 20,
        }}>IA</div>

        <div style={{
          fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 26,
          lineHeight: 1, letterSpacing: '-0.015em', color: cream,
        }}>
          IFRAH<br />HASSAN<br />ABDI
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: dim, letterSpacing: '0.04em', lineHeight: 1.5 }}>
          Senior Health Coordinator<br />Maternal &amp; Child Health
        </div>

        <SbHead>Contact</SbHead>
        <SbField l="Location" v="Mogadishu, Somalia" />
        <SbField l="Email" v="ifrah.abdi@example.so" />
        <SbField l="Phone" v="+252 61 555 0184" />

        <SbHead>Languages</SbHead>
        {d.languages.map((l, i) => (
          <div key={i} style={{ fontSize: 11, color: cream, marginBottom: 4 }}>{l}</div>
        ))}

        <SbHead>Skills</SbHead>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {d.skills.slice(0, 6).map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: cream, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: 99, background: sand, flexShrink: 0 }} />
              {s}
            </div>
          ))}
        </div>

        <SbHead>Certifications</SbHead>
        {d.certifications.map((c, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10.5, color: cream, fontWeight: 500, display: 'flex', gap: 4, alignItems: 'center' }}>
              {c.name}
              {c.verified && <SbCheck color={verified} />}
            </div>
            <div style={{ fontSize: 10, color: dim }}>{c.issuer} · {c.year}</div>
          </div>
        ))}

        <div style={{ position: 'absolute', bottom: 24, left: 30, fontSize: 9, color: dim, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Verified on Sahan
        </div>
      </aside>

      {/* RIGHT main */}
      <main style={{ background: teal, padding: '54px 40px 40px',
        backgroundImage: `radial-gradient(circle at 90% 0%, #0a5cad22, transparent 50%)`,
      }}>
        <SbMainHead>Profile</SbMainHead>
        <p style={{ fontSize: 11.5, lineHeight: 1.65, color: cream, marginTop: 0, marginBottom: 24 }}>
          Public health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia. Designed the regional cold-chain expansion for Banadir, raising routine immunisation coverage from 41% to 73% in twenty-two months.
        </p>

        <SbMainHead>Experience</SbMainHead>
        {d.experiences.map((e, i) => (
          <div key={i} style={{ marginBottom: 18, position: 'relative' }}>
            <div style={{
              position: 'absolute', left: -16, top: 6, width: 6, height: 6, borderRadius: '50%',
              background: sand,
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <div style={{
                fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, fontSize: 13.5,
                color: cream, letterSpacing: '-0.005em', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
              }}>
                {e.title}
                {e.verified && <SbVerified note={`Verified · ${e.verifier}`} verified={verified} />}
              </div>
              <div style={{ fontSize: 9.5, color: dim, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {e.start} — {e.end}
              </div>
            </div>
            <div style={{ fontSize: 11, color: sand, fontWeight: 500, marginTop: 1, letterSpacing: '0.01em' }}>
              {e.org} · {e.loc}
            </div>
            <p style={{ fontSize: 10.5, lineHeight: 1.6, color: cream, marginTop: 5, marginBottom: 0 }}>{e.desc}</p>
          </div>
        ))}

        <SbMainHead>Education</SbMainHead>
        {d.educations.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, fontSize: 12, color: cream, display: 'flex', alignItems: 'center', gap: 5 }}>
                {e.qual}
                {e.verified && <SbCheck color={verified} />}
              </span>
              <span style={{ fontSize: 9.5, color: dim, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{e.years}</span>
            </div>
            <div style={{ fontSize: 10.5, color: sand, marginTop: 1 }}>{e.inst}</div>
          </div>
        ))}
      </main>
    </div>
  );
}

function SbHead({ children }) {
  return (
    <div style={{
      fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 9.5,
      letterSpacing: '0.18em', color: '#bfcad6', textTransform: 'uppercase',
      marginTop: 22, marginBottom: 8,
    }}>{children}</div>
  );
}
function SbMainHead({ children }) {
  return (
    <div style={{
      fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 11,
      letterSpacing: '0.2em', color: '#bfcad6', textTransform: 'uppercase',
      marginTop: 18, marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #2a4a4a',
    }}>{children}</div>
  );
}
function SbField({ l, v }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 8.5, color: '#9aa6b3', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{l}</div>
      <div style={{ fontSize: 11, color: '#e6ecf3', marginTop: 1 }}>{v}</div>
    </div>
  );
}
function SbCheck({ color }) {
  return (
    <svg width="9" height="9" viewBox="0 0 11 11">
      <circle cx="5.5" cy="5.5" r="5.5" fill={color} />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#0a2a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
function SbVerified({ note, verified }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 8.5, fontWeight: 500, color: verified,
      border: `1px solid ${verified}55`, padding: '1px 6px 1px 4px',
      borderRadius: 99, letterSpacing: '0.01em', whiteSpace: 'nowrap',
    }}>
      <SbCheck color={verified} />
      {note}
    </span>
  );
}

window.CVSidebar = CVSidebar;
