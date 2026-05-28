// Individual profile builder — structured sections with the "minimum core" fast path

function IndividualBuilder() {
  const sections = [
    { id: 'basics', label: 'Basics', done: true, required: true },
    { id: 'experience', label: 'Experience', done: true, required: true, count: 3 },
    { id: 'education', label: 'Education', done: true, required: true, count: 2 },
    { id: 'skills', label: 'Skills', done: true, required: true, count: 7 },
    { id: 'certifications', label: 'Certifications', done: false, required: false, count: 2 },
    { id: 'referees', label: 'Referees', done: false, required: false, count: 0 },
    { id: 'languages', label: 'Languages', done: true, required: false, count: 3 },
    { id: 'privacy', label: 'Privacy & visibility', done: true, required: false },
  ];

  return (
    <div style={{ ...uiBase, width: 1440, height: 980 }}>
      <TopNav active="profile" />
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 360px', height: 'calc(100% - 73px)' }}>
        {/* LEFT — section nav */}
        <aside style={{ padding: '32px 24px', borderRight: `1px solid ${COLORS.border}`, background: COLORS.paper }}>
          <SectionLabel>Your profile</SectionLabel>
          <h3 style={{ ...serif, fontSize: 22, fontWeight: 450, letterSpacing: '-0.015em', margin: '6px 0 22px' }}>
            Profile builder
          </h3>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {sections.map((s, i) => (
              <li key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 12px', margin: '0 -12px 2px',
                borderRadius: 7, cursor: 'pointer',
                background: s.id === 'experience' ? COLORS.cream : 'transparent',
                color: s.id === 'experience' ? COLORS.ink : COLORS.inkSoft,
                fontWeight: s.id === 'experience' ? 500 : 400,
                fontSize: 13.5,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `1.5px solid ${s.done ? COLORS.verified : COLORS.border}`,
                  background: s.done ? COLORS.verified : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', flexShrink: 0,
                }}>
                  {s.done ? '✓' : <span style={{ color: COLORS.muted, fontWeight: 600 }}>{i + 1}</span>}
                </div>
                <span style={{ flex: 1 }}>{s.label}</span>
                {s.count > 0 && <span style={{ fontSize: 11.5, color: COLORS.muted }}>{s.count}</span>}
                {s.required && <span style={{ width: 4, height: 4, borderRadius: 99, background: COLORS.sienna }} />}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 28, padding: 16, background: COLORS.cream, borderRadius: 8, fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>
            <SectionLabel accent={COLORS.sienna}>Minimum core</SectionLabel>
            <div style={{ marginTop: 6, color: COLORS.inkSoft }}>
              You've passed the minimum — your CV is ready to download.
            </div>
          </div>
        </aside>

        {/* CENTER — section editor */}
        <main style={{ padding: '32px 48px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
            <SectionLabel accent={COLORS.sienna}>Section 2 of 8</SectionLabel>
            <div style={{ fontSize: 12, color: COLORS.muted }}>Auto-saved 14:32</div>
          </div>
          <h1 style={{ ...serif, fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em', margin: '6px 0 6px' }}>
            Experience
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, marginBottom: 28, maxWidth: 580 }}>
            One entry per role. Verified entries get a green check on your CV — request verification once you've added the basics.
          </p>

          {/* Experience entries */}
          {SAMPLE_INDIVIDUAL.experiences.map((e, i) => (
            <div key={i} style={{
              background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 10,
              padding: '22px 24px', marginBottom: 14, position: 'relative',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ ...serif, fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em' }}>{e.title}</div>
                    {e.verified && <VerifiedBadge note={`Verified · ${e.verifier}`} />}
                  </div>
                  <div style={{ fontSize: 13.5, color: COLORS.inkSoft }}>
                    {e.org} · {e.loc} · <span style={{ color: COLORS.muted }}>{e.start} – {e.end}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: COLORS.inkSoft, lineHeight: 1.55, marginTop: 10, marginBottom: 0, maxWidth: 620 }}>{e.desc}</p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn kind="ghost" size="sm" style={{ color: COLORS.muted }}>Edit</Btn>
                  {!e.verified && <Btn kind="quiet" size="sm">Verify</Btn>}
                </div>
              </div>
            </div>
          ))}

          {/* Add new entry — expanded */}
          <div style={{
            border: `1.5px dashed ${COLORS.border}`, borderRadius: 10, padding: '28px 24px',
            background: COLORS.borderSoft + '55',
          }}>
            <SectionLabel accent={COLORS.sienna}>New experience</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              {[
                { l: 'Job title', ph: 'e.g. Public Health Specialist' },
                { l: 'Organisation', ph: 'e.g. WHO Somalia' },
                { l: 'Location', ph: 'e.g. Mogadishu' },
                { l: 'Start date – end date', ph: 'Jan 2024 – Present' },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 4, letterSpacing: '0.01em' }}>{f.l}</div>
                  <input placeholder={f.ph} style={{
                    width: '100%', padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
                    border: `1px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.paper,
                    boxSizing: 'border-box', outline: 'none', color: COLORS.ink,
                  }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 4 }}>Description</div>
              <textarea rows={3} placeholder="What did you actually do? Quantify where you can." style={{
                width: '100%', padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
                border: `1px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.paper,
                boxSizing: 'border-box', outline: 'none', resize: 'vertical', color: COLORS.ink,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 12, color: COLORS.muted }}>You can request verification after saving.</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn kind="ghost" size="md">Cancel</Btn>
                <Btn kind="primary" size="md">Save experience</Btn>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT — live preview */}
        <aside style={{ background: COLORS.cream, borderLeft: `1px solid ${COLORS.border}`, padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <SectionLabel>Live preview</SectionLabel>
            <select style={{ fontSize: 11.5, fontFamily: 'inherit', border: `1px solid ${COLORS.border}`, padding: '3px 8px', borderRadius: 4, background: COLORS.paper, color: COLORS.inkSoft }}>
              <option>Editorial</option><option>Sidebar</option><option>Mono</option>
            </select>
          </div>

          {/* miniature CV preview */}
          <div style={{
            background: '#f6f2ea', boxShadow: '0 8px 32px -12px rgba(26,26,23,0.18)',
            borderRadius: 4, padding: '24px 26px', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", color: '#1a1a17',
            flex: 1, overflow: 'hidden',
          }}>
            <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Ifrah Hassan<br />Abdi
            </div>
            <div style={{ fontSize: 9, color: '#0d3b66', marginTop: 6, fontStyle: 'italic', letterSpacing: '0.02em' }}>
              Senior Health Coordinator
            </div>
            <div style={{ height: 1, background: '#dcd6c8', margin: '14px 0' }} />
            <div style={{ fontSize: 10.5, lineHeight: 1.55, color: '#3a3a3d' }}>
              <span style={{ float: 'left', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 28, lineHeight: 0.85, marginRight: 4, marginTop: 2, color: '#0d3b66' }}>P</span>
              ublic health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia.
            </div>
            <div style={{ clear: 'both' }} />
            <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0d3b66', marginTop: 18, marginBottom: 8 }}>
              Experience
            </div>
            {SAMPLE_INDIVIDUAL.experiences.slice(0, 2).map((e, i) => (
              <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i === 0 ? '1px solid #e3ddd0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 11, fontWeight: 500 }}>{e.title}</span>
                  {e.verified && <svg width="8" height="8" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d"/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>}
                </div>
                <div style={{ fontSize: 8.5, color: '#6e7480', fontStyle: 'italic' }}>{e.org} · {e.start}–{e.end}</div>
              </div>
            ))}
          </div>

          <Btn kind="primary" size="md" style={{ marginTop: 16, justifyContent: 'center' }}>
            Download CV (PDF) →
          </Btn>
        </aside>
      </div>
    </div>
  );
}

window.IndividualBuilder = IndividualBuilder;
