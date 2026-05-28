// Company profile builder — focused on the Projects section (the paid-verification target)

function CompanyBuilder() {
  const c = SAMPLE_COMPANY;

  return (
    <div style={{ ...uiBase, width: 1440, height: 980 }}>
      <TopNav active="profile" user={c} />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 360px', height: 'calc(100% - 73px)' }}>
        {/* LEFT */}
        <aside style={{ padding: '32px 24px', borderRight: `1px solid ${COLORS.border}`, background: COLORS.paper }}>
          <SectionLabel>Company profile</SectionLabel>
          <h3 style={{ ...serif, fontSize: 22, fontWeight: 450, letterSpacing: '-0.015em', margin: '6px 0 22px' }}>
            {c.name}
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {[
              { id: 'basics', label: 'About the company', done: true, count: 0 },
              { id: 'mission', label: 'Mission & vision', done: true, count: 0 },
              { id: 'sectors', label: 'Sectors & services', done: true, count: 10 },
              { id: 'projects', label: 'Selected projects', done: true, count: 4, active: true },
              { id: 'clients', label: 'Clients', done: true, count: 8 },
              { id: 'team', label: 'Key personnel', done: true, count: 6 },
              { id: 'certs', label: 'Certifications', done: true, count: 2 },
              { id: 'contact', label: 'Contact & registration', done: true, count: 0 },
            ].map((s, i) => (
              <li key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 12px', margin: '0 -12px 2px',
                borderRadius: 7, cursor: 'pointer',
                background: s.active ? COLORS.cream : 'transparent',
                color: s.active ? COLORS.ink : COLORS.inkSoft,
                fontWeight: s.active ? 500 : 400, fontSize: 13.5,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `1.5px solid ${s.done ? COLORS.verified : COLORS.border}`,
                  background: s.done ? COLORS.verified : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', flexShrink: 0,
                }}>{s.done && '✓'}</div>
                <span style={{ flex: 1 }}>{s.label}</span>
                {s.count > 0 && <span style={{ fontSize: 11.5, color: COLORS.muted }}>{s.count}</span>}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 24, padding: 14, background: COLORS.ink, color: COLORS.paper, borderRadius: 8 }}>
            <SectionLabel accent={COLORS.siennaSoft}>Verification</SectionLabel>
            <div style={{ ...serif, fontSize: 17, fontWeight: 450, marginTop: 6, color: COLORS.paper, letterSpacing: '-0.01em' }}>
              2 of 4 projects verified
            </div>
            <div style={{ fontSize: 12, color: '#d4d8de', marginTop: 4, lineHeight: 1.5 }}>
              Verified projects carry a green check on your company profile PDF.
            </div>
          </div>
        </aside>

        {/* CENTER — projects */}
        <main style={{ padding: '32px 48px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <SectionLabel accent={COLORS.sienna}>Section 4 of 8</SectionLabel>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Auto-saved 14:32</div>
          </div>
          <h1 style={{ ...serif, fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em', margin: '6px 0 6px' }}>
            Selected projects
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, marginBottom: 24, maxWidth: 620 }}>
            The work you put forward in bids. Each project can be independently verified — verified projects appear with a green check on your downloadable profile.
          </p>

          {/* projects table */}
          <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 0.8fr 1fr 1.1fr',
              padding: '12px 22px', background: COLORS.borderSoft + '70',
              fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.muted, fontWeight: 600,
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div>Project</div><div>Client</div><div>Value</div><div>Years</div><div style={{ textAlign: 'right' }}>Status</div>
            </div>
            {c.projects.map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 0.8fr 1fr 1.1fr',
                padding: '18px 22px', alignItems: 'center', gap: 12,
                borderBottom: i < c.projects.length - 1 ? `1px solid ${COLORS.borderSoft}` : 'none',
              }}>
                <div>
                  <div style={{ ...serif, fontSize: 15.5, fontWeight: 500, letterSpacing: '-0.005em', lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{p.sector}</div>
                </div>
                <div style={{ fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.35 }}>{p.client}</div>
                <div style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', color: COLORS.inkSoft }}>{p.value}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>{p.years}</div>
                <div style={{ textAlign: 'right' }}>
                  {p.verified
                    ? <VerifiedBadge note={`Verified · ${p.verifier.split(' ').slice(0, 2).join(' ')}`} />
                    : <Btn kind="quiet" size="sm">Request verification →</Btn>}
                </div>
              </div>
            ))}
          </div>

          {/* Expanded project being edited */}
          <div style={{ marginTop: 18, background: COLORS.paper, border: `1px solid ${COLORS.ink}`, borderRadius: 10, padding: '24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <SectionLabel accent={COLORS.sienna}>Editing — {c.projects[2].name}</SectionLabel>
              <Btn kind="ghost" size="sm" style={{ color: COLORS.muted, padding: '2px 6px' }}>✕</Btn>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Project name" v={c.projects[2].name} />
              <Field label="Client" v={c.projects[2].client} />
              <Field label="Sector" v={c.projects[2].sector} />
              <Field label="Contract value" v={c.projects[2].value} />
            </div>
            <div style={{ marginTop: 12 }}>
              <Field label="Scope" v={c.projects[2].scope} multi />
            </div>
            <div style={{ marginTop: 16, padding: '12px 14px', background: COLORS.verifiedSoft, borderRadius: 7, fontSize: 12.5, color: COLORS.verified, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><b>Ready for verification?</b> Upload contract + completion certificate.</span>
              <Btn kind="sienna" size="sm">Start verification →</Btn>
            </div>
          </div>
        </main>

        {/* RIGHT — preview */}
        <aside style={{ background: COLORS.cream, borderLeft: `1px solid ${COLORS.border}`, padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <SectionLabel>Company profile</SectionLabel>
            <span style={{ fontSize: 11.5, color: COLORS.muted }}>Cover page</span>
          </div>
          <div style={{
            aspectRatio: '0.71', background: '#0e2a4a', borderRadius: 4, overflow: 'hidden',
            boxShadow: '0 8px 32px -12px rgba(26,26,23,0.25)', position: 'relative',
            color: '#e6ecf3', padding: '22px 22px', display: 'flex', flexDirection: 'column',
            backgroundImage: 'radial-gradient(circle at 80% 20%, #0d3b6640, transparent 60%)',
          }}>
            <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b6c4d6' }}>
              Company profile · 2026
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.025em' }}>
              Wadani<br />Engineering<br /><span style={{ fontStyle: 'italic', color: '#b6c4d6' }}>Group.</span>
            </div>
            <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontSize: 9, color: '#9aa6b3', marginTop: 8, letterSpacing: '0.04em' }}>
              Civil infrastructure for the Horn of Africa
            </div>
            <div style={{ borderTop: '1px solid #2a4a4a', marginTop: 14, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 7.5, color: '#9aa6b3', letterSpacing: '0.04em' }}>
              <span>EST. 2012</span><span>MOG-2012-04419</span>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: COLORS.muted }}>
            Cover, about, projects, clients & team — eight pages total.
          </div>
          <Btn kind="primary" size="md" style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}>
            Download company profile →
          </Btn>
          <Btn kind="ghost" size="sm" style={{ marginTop: 6, justifyContent: 'center', width: '100%', color: COLORS.muted }}>
            Change template
          </Btn>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, v, multi }) {
  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
    border: `1px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.paper,
    boxSizing: 'border-box', outline: 'none', color: COLORS.ink, resize: 'vertical',
  };
  return (
    <div>
      <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 4 }}>{label}</div>
      {multi
        ? <textarea rows={3} defaultValue={v} style={inputStyle} />
        : <input defaultValue={v} style={inputStyle} />}
    </div>
  );
}

window.CompanyBuilder = CompanyBuilder;
