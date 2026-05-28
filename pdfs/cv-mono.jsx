// CV Mono — A4 portrait, minimalist/technical timeline
// Space Grotesk display + IBM Plex Sans body, signal-orange accent

function CVMono() {
  const d = SAMPLE_INDIVIDUAL;
  const bg = '#fafaf7';
  const ink = '#111111';
  const sub = '#555';
  const muted = '#888';
  const rule = '#e3e0d8';
  const orange = '#0a5cad';

  return (
    <div style={{
      width: 794, height: 1123, background: bg, color: ink,
      fontFamily: 'IBM Plex Sans, sans-serif', position: 'relative',
      padding: '64px 64px 56px', boxSizing: 'border-box',
    }}>
      {/* TOP — meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: muted, letterSpacing: '0.04em' }}>
          <div style={{ width: 8, height: 8, background: orange }} />
          <span>cv / abdi-i / 2026.05 →</span>
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: muted }}>
          MOG · SOM · ENG/SOM/ARA
        </div>
      </div>

      {/* Name block */}
      <div style={{ marginTop: 36 }}>
        <h1 style={{
          fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontSize: 56, fontWeight: 500,
          letterSpacing: '-0.04em', lineHeight: 0.95, margin: 0,
        }}>
          Ifrah H. Abdi<span style={{ color: orange }}>.</span>
        </h1>
        <div style={{ marginTop: 12, fontSize: 13, color: ink, fontWeight: 500 }}>
          Senior Health Coordinator — Maternal &amp; Child Health
        </div>
        <div style={{ marginTop: 4, fontSize: 11.5, color: sub, fontFamily: 'IBM Plex Mono, monospace' }}>
          ifrah.abdi@example.so · +252 61 555 0184 · mogadishu, so
        </div>
      </div>

      {/* Rule */}
      <div style={{ height: 1, background: rule, marginTop: 28 }} />

      {/* Profile */}
      <div style={{
        marginTop: 22, display: 'grid', gridTemplateColumns: '90px 1fr', gap: 24,
      }}>
        <div style={{ fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: sub, marginTop: 3 }}>
          About
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.65, color: ink, margin: 0 }}>
          Public health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia. Designed and led the regional cold-chain expansion for Banadir under UNICEF, raising routine immunisation coverage from <span style={{ color: orange, fontFamily: 'IBM Plex Mono, monospace' }}>41% → 73%</span> in twenty-two months.
        </p>
      </div>

      {/* Experience — timeline */}
      <MonoSection label="Experience" sub={sub} orange={orange} />
      <div style={{ display: 'grid', gridTemplateColumns: '90px 8px 1fr', gap: 16, position: 'relative' }}>
        {/* timeline accent rail */}
        <div style={{ gridColumn: 2, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 6, bottom: 6, left: 3, width: 2, background: rule }} />
        </div>
        {d.experiences.map((e, i) => (
          <React.Fragment key={i}>
            <div style={{
              gridColumn: 1, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: sub,
              paddingTop: 4, lineHeight: 1.45,
            }}>
              {e.start.split(' ')[1]}<br/>
              <span style={{ color: muted }}>{e.end === 'Present' ? 'now' : e.end.split(' ')[1]}</span>
            </div>
            <div style={{ gridColumn: 2, paddingTop: 6, position: 'relative' }}>
              <div style={{ width: 8, height: 8, background: e.verified ? orange : '#c8c4b8', borderRadius: 99 }} />
            </div>
            <div style={{ gridColumn: 3, paddingBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, fontSize: 14.5, letterSpacing: '-0.015em' }}>{e.title}</span>
                <span style={{ fontSize: 11.5, color: sub }}>@ <span style={{ color: ink, fontWeight: 500 }}>{e.org}</span></span>
                {e.verified && <MonoVerified note={`Verified · ${e.verifier}`} orange={orange} />}
              </div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: muted, marginTop: 2 }}>
                {e.loc.toLowerCase()}
              </div>
              <p style={{ fontSize: 11.5, lineHeight: 1.6, color: ink, margin: '7px 0 0' }}>{e.desc}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Education + Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 12 }}>
        <div>
          <MonoSection label="Education" sub={sub} orange={orange} />
          {d.educations.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, fontSize: 12 }}>{e.qual}</span>
                {e.verified && <MonoTick orange={orange} />}
              </div>
              <div style={{ fontSize: 11, color: sub, marginTop: 1 }}>{e.inst}</div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: muted, marginTop: 1 }}>{e.years.toLowerCase()}</div>
            </div>
          ))}
        </div>
        <div>
          <MonoSection label="Skills" sub={sub} orange={orange} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
            {d.skills.map((s, i) => (
              <span key={i} style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: ink,
                border: `1px solid ${rule}`, padding: '3px 8px', borderRadius: 2, background: '#fff',
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 32, left: 64, right: 64,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: muted, letterSpacing: '0.04em',
        paddingTop: 12, borderTop: `1px solid ${rule}`,
      }}>
        <span>↳ abdi-i / 2026</span>
        <span style={{ color: orange }}>verified on sahan</span>
        <span>01 / 01</span>
      </div>
    </div>
  );
}

function MonoSection({ label, sub, orange }) {
  return (
    <div style={{ marginTop: 28, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 8, height: 8, background: orange }} />
      <span style={{
        fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 600, fontSize: 11,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: sub,
      }}>{label}</span>
    </div>
  );
}
function MonoVerified({ note, orange }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fontWeight: 500,
      color: '#1f6b4d', background: '#e2efe7',
      padding: '1px 6px', borderRadius: 2, letterSpacing: '0.01em',
    }}>
      <MonoTick small />
      {note}
    </span>
  );
}
function MonoTick({ small }) {
  return (
    <svg width={small ? 8 : 9} height={small ? 8 : 9} viewBox="0 0 11 11">
      <circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d" />
      <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

window.CVMono = CVMono;
