// Mobile views — three small artboards showing dashboard + builder + CV preview
// 390px wide (iPhone). Show responsive thinking.

function MobileDashboard() {
  return (
    <div style={{ width: 390, height: 780, background: COLORS.cream, color: COLORS.ink, fontFamily: 'Source Sans 3, system-ui, sans-serif', fontSize: 14, overflow: 'hidden', position: 'relative', borderRadius: 28, border: `1px solid ${COLORS.border}` }}>
      <MobileStatusBar />

      {/* Top bar */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SahanMark size={20} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Bell />
          <PhotoSlot w={30} h={30} label="" />
        </div>
      </div>

      {/* Hero */}
      <div style={{ margin: '8px 16px 0', padding: '20px 20px 22px', background: COLORS.ink, color: COLORS.paper, borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: `${COLORS.sienna}30` }} />
        <div style={{ fontSize: 10.5, color: COLORS.siennaSoft, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Your record</div>
        <div style={{ ...serif, fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8, position: 'relative' }}>
          Your verification was <span style={{ fontStyle: 'italic', color: COLORS.siennaSoft }}>approved.</span>
        </div>
        <Btn kind="sienna" size="sm" style={{ marginTop: 14 }}>Download CV →</Btn>
      </div>

      {/* Stats strip */}
      <div style={{ margin: '14px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[['17', 'views'], ['3', 'employers'], ['82%', 'complete']].map((s, i) => (
          <div key={i} style={{ background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ ...serif, fontSize: 20, fontWeight: 400, letterSpacing: '-0.01em' }}>{s[0]}</div>
            <div style={{ fontSize: 10.5, color: COLORS.muted }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ margin: '22px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ ...serif, fontSize: 18, fontWeight: 450, letterSpacing: '-0.01em' }}>Across the sector</div>
          <span style={{ fontSize: 11, color: COLORS.muted }}>4 new</span>
        </div>
        {[
          { tag: 'Humanitarian', src: 'ReliefWeb', title: 'Somalia: Humanitarian Bulletin, May 2026' },
          { tag: 'Infrastructure', src: 'World Bank', title: 'New financing for Urban Resilience Phase III' },
        ].map((f, i) => (
          <div key={i} style={{ padding: '14px 0', borderBottom: `1px solid ${COLORS.border}`, display: 'grid', gridTemplateColumns: '1fr 56px', gap: 14 }}>
            <div>
              <div style={{ fontSize: 9.5, color: COLORS.sienna, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{f.tag} · {f.src}</div>
              <div style={{ ...serif, fontSize: 14, fontWeight: 450, marginTop: 4, lineHeight: 1.25, letterSpacing: '-0.005em' }}>{f.title}</div>
            </div>
            <div style={{ width: 56, height: 56, background: COLORS.borderSoft, borderRadius: 6 }} />
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 24px 22px', background: COLORS.paper, borderTop: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-around' }}>
        {[
          { l: 'Home', a: true }, { l: 'Profile' }, { l: 'Templates' }, { l: 'Settings' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 10.5, color: t.a ? COLORS.ink : COLORS.muted, fontWeight: t.a ? 600 : 400 }}>
            <div style={{ width: 6, height: 6, borderRadius: 99, background: t.a ? COLORS.sienna : 'transparent' }} />
            {t.l}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileBuilder() {
  return (
    <div style={{ width: 390, height: 780, background: COLORS.cream, color: COLORS.ink, fontFamily: 'Source Sans 3, system-ui, sans-serif', fontSize: 14, overflow: 'hidden', position: 'relative', borderRadius: 28, border: `1px solid ${COLORS.border}` }}>
      <MobileStatusBar />

      <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLORS.muted, fontSize: 13 }}>
          ← Back
        </div>
        <div style={{ fontSize: 11.5, color: COLORS.muted }}>2 / 8 · saved</div>
      </div>

      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{ fontSize: 10.5, color: COLORS.sienna, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Experience</div>
        <h2 style={{ ...serif, fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em', margin: '6px 0 4px' }}>
          Add a role.
        </h2>
        <p style={{ fontSize: 12.5, color: COLORS.muted, margin: 0, lineHeight: 1.5 }}>
          One entry per role. You can request verification after saving.
        </p>
      </div>

      {/* Existing experience card */}
      <div style={{ margin: '14px 16px 0', padding: '14px 16px', background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ ...serif, fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em' }}>Senior Health Coordinator</div>
            <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>UNICEF Somalia · 2021–Present</div>
          </div>
          <VerifiedBadge note="Verified" size={9.5} />
        </div>
      </div>

      {/* New entry form */}
      <div style={{ margin: '12px 16px 0', padding: '18px 16px', background: COLORS.paper, border: `1.5px dashed ${COLORS.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 10.5, color: COLORS.sienna, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>New experience</div>
        {[
          { l: 'Job title', ph: 'Public Health Specialist' },
          { l: 'Organisation', ph: 'WHO Somalia' },
          { l: 'Dates', ph: 'Jan 2024 – Present' },
        ].map((f, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, color: COLORS.muted, marginBottom: 3 }}>{f.l}</div>
            <input placeholder={f.ph} style={{
              width: '100%', padding: '10px 12px', fontSize: 13, fontFamily: 'inherit',
              border: `1px solid ${COLORS.border}`, borderRadius: 7, background: COLORS.paper, boxSizing: 'border-box', outline: 'none',
            }} />
          </div>
        ))}
        <textarea rows={3} placeholder="What did you actually do?" style={{
          width: '100%', padding: '10px 12px', fontSize: 13, fontFamily: 'inherit',
          border: `1px solid ${COLORS.border}`, borderRadius: 7, background: COLORS.paper, boxSizing: 'border-box', outline: 'none', resize: 'none',
        }} />
      </div>

      {/* Sticky CTA */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 22px', background: COLORS.paper, borderTop: `1px solid ${COLORS.border}`, display: 'flex', gap: 10 }}>
        <Btn kind="secondary" size="md" style={{ flex: 1, justifyContent: 'center' }}>Skip</Btn>
        <Btn kind="primary" size="md" style={{ flex: 2, justifyContent: 'center' }}>Save & continue</Btn>
      </div>
    </div>
  );
}

function MobileCVPreview() {
  return (
    <div style={{ width: 390, height: 780, background: COLORS.ink, color: COLORS.paper, fontFamily: 'Source Sans 3, system-ui, sans-serif', fontSize: 14, overflow: 'hidden', position: 'relative', borderRadius: 28, border: `1px solid ${COLORS.border}` }}>
      <MobileStatusBar color={COLORS.paper} />

      <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: COLORS.paper }}>✕</div>
        <div style={{ fontSize: 11.5, color: '#9aa0a8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Preview · Editorial</div>
        <div style={{ fontSize: 13, color: COLORS.paper }}>⋯</div>
      </div>

      {/* CV thumbnail centered */}
      <div style={{ padding: '24px 36px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 280, height: 396, background: '#f6f2ea', borderRadius: 6, color: '#1a1a17',
          padding: '20px 22px', boxShadow: '0 18px 60px -16px rgba(0,0,0,0.55)', position: 'relative',
          fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 9, lineHeight: 1.55,
        }}>
          <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, fontWeight: 350, letterSpacing: '-0.03em', lineHeight: 0.95 }}>
            Ifrah Hassan<br /><span style={{ fontStyle: 'italic', color: '#0d3b66' }}>Abdi.</span>
          </div>
          <div style={{ fontSize: 7, color: '#6e7480', fontStyle: 'italic', marginTop: 6 }}>Senior Health Coordinator</div>
          <div style={{ height: 1, background: '#dcd6c8', margin: '12px 0' }} />
          <div style={{ fontSize: 7.5, lineHeight: 1.55, color: '#3a3a3d' }}>
            <span style={{ float: 'left', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, lineHeight: 0.85, marginRight: 3, color: '#0d3b66' }}>P</span>
            ublic health practitioner with eleven years coordinating MCH programmes across south-central Somalia.
          </div>
          <div style={{ clear: 'both', height: 8 }} />
          <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 6.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#0d3b66', marginBottom: 4 }}>Experience</div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ marginTop: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 8.5, fontWeight: 500 }}>Senior Health Coordinator</span>
                <svg width="6" height="6" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d"/></svg>
              </div>
              <div style={{ fontSize: 6.5, color: '#6e7480', fontStyle: 'italic' }}>UNICEF Somalia · 2021–Present</div>
            </div>
          ))}
        </div>
      </div>

      {/* Template swatch row */}
      <div style={{ padding: '24px 24px 0', display: 'flex', gap: 10, justifyContent: 'center' }}>
        {[
          { c: '#f6f2ea', l: 'Editorial', sel: true },
          { c: '#0e2a4a', l: 'Sidebar' },
          { c: '#fafaf7', l: 'Mono' },
        ].map((t, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 78, background: t.c, borderRadius: 4,
              border: t.sel ? `2px solid ${COLORS.sienna}` : '2px solid transparent',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }} />
            <div style={{ fontSize: 10.5, color: t.sel ? COLORS.paper : '#9aa0a8', marginTop: 6, fontWeight: t.sel ? 600 : 400 }}>{t.l}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 22px', display: 'flex', gap: 10 }}>
        <Btn kind="secondary" size="md" style={{ flex: 1, justifyContent: 'center', color: COLORS.paper, borderColor: COLORS.paper, background: 'transparent' }}>Share link</Btn>
        <Btn kind="sienna" size="md" style={{ flex: 2, justifyContent: 'center' }}>Download PDF</Btn>
      </div>
    </div>
  );
}

function MobileStatusBar({ color = COLORS.ink }) {
  return (
    <div style={{ padding: '10px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, color }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10 }}>●●●●</span>
        <span style={{ fontSize: 10 }}>≡</span>
        <span style={{ fontSize: 10, border: `1px solid ${color}`, padding: '1px 4px', borderRadius: 3 }}>87</span>
      </div>
    </div>
  );
}

function Bell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.ink} strokeWidth="1.6">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

window.MobileDashboard = MobileDashboard;
window.MobileBuilder = MobileBuilder;
window.MobileCVPreview = MobileCVPreview;
