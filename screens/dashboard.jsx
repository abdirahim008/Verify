// Logged-in homepage — own activity + curated humanitarian feed

function Dashboard() {
  const feedItems = [
    {
      source: 'ReliefWeb', when: '2h',
      title: 'Somalia: Humanitarian Bulletin, May 2026',
      snippet: 'OCHA reports modest improvement in food security across Bay and Bakool, though Hirshabelle and Galmudug remain in IPC Phase 3.',
      tag: 'Humanitarian',
    },
    {
      source: 'World Bank Somalia', when: '1d',
      title: 'New financing approved for Somalia Urban Resilience Project — Phase III',
      snippet: '$95M IDA grant will extend road, drainage and market infrastructure across six secondary cities, including Baidoa and Kismayo.',
      tag: 'Infrastructure',
    },
    {
      source: 'UNICEF Somalia', when: '2d',
      title: 'Routine immunisation drive launched in Lower Shabelle',
      snippet: 'Joint Federal Ministry of Health–UNICEF campaign targets 142,000 children under five across 64 settlements.',
      tag: 'Health',
    },
    {
      source: 'FAO SWALIM', when: '3d',
      title: 'Gu rains end with above-average performance in central regions',
      snippet: 'Cumulative rainfall in Galmudug and parts of Hirshabelle was 110–135% of long-term average, easing drought conditions.',
      tag: 'Climate',
    },
  ];

  return (
    <div style={{ ...uiBase, width: 1440, height: 920 }}>
      <TopNav active="home" />
      <div style={{ padding: '36px 40px 60px', display: 'grid', gridTemplateColumns: '300px 1fr 320px', gap: 32 }}>

        {/* LEFT — profile sidebar */}
        <aside>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ height: 64, background: `linear-gradient(135deg, #0a5cad 0%, #073563 100%)` }} />
            <div style={{ padding: '0 22px 22px', marginTop: -34 }}>
              <PhotoSlot w={68} h={68} label="photo" />
              <div style={{ ...serif, fontSize: 19, fontWeight: 500, marginTop: 12, letterSpacing: '-0.01em' }}>
                Ifrah H. Abdi
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2, lineHeight: 1.4 }}>
                Senior Health Coordinator<br />UNICEF Somalia · Mogadishu
              </div>
              <div style={{ marginTop: 14, padding: '10px 12px', background: COLORS.verifiedSoft, borderRadius: 6, fontSize: 12, color: COLORS.verified, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verified}/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
                2 verified claims
              </div>
            </div>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <SectionLabel>Profile completeness</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
              <span style={{ ...serif, fontSize: 32, fontWeight: 400 }}>82</span>
              <span style={{ color: COLORS.muted, fontSize: 13 }}>%</span>
            </div>
            <div style={{ height: 4, background: COLORS.borderSoft, borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', background: COLORS.ink }} />
            </div>
            <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none', fontSize: 12.5 }}>
              {[
                { txt: 'Add 2 referees', done: false },
                { txt: 'Upload a profile photo', done: true },
                { txt: 'Request verification for 1 more claim', done: false },
              ].map((it, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                  color: it.done ? COLORS.muted : COLORS.ink,
                  textDecoration: it.done ? 'line-through' : 'none',
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `1.5px solid ${it.done ? COLORS.verified : COLORS.muted}`,
                    background: it.done ? COLORS.verified : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{it.done && <span style={{ color: '#fff', fontSize: 8 }}>✓</span>}</div>
                  {it.txt}
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        {/* MIDDLE — main column */}
        <main>
          {/* Hero — your activity */}
          <div style={{
            background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 28,
            backgroundImage: `radial-gradient(circle at 95% 0%, ${COLORS.sienna}12, transparent 40%)`,
          }}>
            <SectionLabel accent={COLORS.sienna}>This week — your record</SectionLabel>
            <h1 style={{ ...serif, fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', margin: '10px 0 4px', maxWidth: 680 }}>
              Your verification request for the Hirshabelle Health Posts project was <span style={{ color: COLORS.verified, fontStyle: 'italic' }}>approved.</span>
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 14, marginTop: 6 }}>
              UNICEF Somalia confirmed your role on this engagement. The badge now appears on your profile and any CV you generate.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Btn kind="primary">Download updated CV</Btn>
              <Btn kind="secondary">View on profile</Btn>
            </div>
          </div>

          {/* Activity strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 18 }}>
            {[
              { n: '17', l: 'Profile views', s: 'past 7 days' },
              { n: '3', l: 'Employers viewed', s: 'past 7 days' },
              { n: '2', l: 'CVs downloaded', s: 'lifetime' },
            ].map((s, i) => (
              <Card key={i} style={{ padding: 18 }}>
                <div style={{ ...serif, fontSize: 28, fontWeight: 400, letterSpacing: '-0.01em' }}>{s.n}</div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.l}</div>
                <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 1 }}>{s.s}</div>
              </Card>
            ))}
          </div>

          {/* Feed */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ ...serif, fontSize: 22, fontWeight: 450, letterSpacing: '-0.015em', margin: 0 }}>
                Across the sector
              </h2>
              <div style={{ fontSize: 12, color: COLORS.muted }}>
                Curated from ReliefWeb, World Bank, UNICEF & FAO SWALIM
              </div>
            </div>
            {feedItems.map((f, i) => (
              <div key={i} style={{
                padding: '20px 0',
                borderTop: i === 0 ? `1px solid ${COLORS.border}` : 'none',
                borderBottom: `1px solid ${COLORS.border}`,
                display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 24, alignItems: 'start',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.sienna, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{f.tag}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{f.source}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.mutedSoft, marginTop: 1 }}>{f.when} ago</div>
                </div>
                <div>
                  <div style={{ ...serif, fontSize: 18, fontWeight: 450, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{f.title}</div>
                  <p style={{ fontSize: 13.5, color: COLORS.inkSoft, marginTop: 6, lineHeight: 1.55, maxWidth: 560 }}>{f.snippet}</p>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>Read on <span style={{ color: COLORS.sienna, textDecoration: 'underline', textUnderlineOffset: 2 }}>{f.source} ↗</span></div>
                </div>
                <div style={{ width: 80, height: 80, background: COLORS.borderSoft, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.mutedSoft, fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>
                  source<br/>thumb
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT — prompts */}
        <aside>
          <Card>
            <SectionLabel accent={COLORS.sienna}>Suggested next step</SectionLabel>
            <h3 style={{ ...serif, fontSize: 19, fontWeight: 450, margin: '10px 0 6px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              Have another claim verified
            </h3>
            <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5, margin: 0 }}>
              You have <b style={{ color: COLORS.ink, fontWeight: 600 }}>3 unverified experiences</b>. Verified entries appear with a green check on every CV you download and on your public profile.
            </p>
            <Btn kind="sienna" size="md" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}>
              Request verification
            </Btn>
          </Card>

          <Card style={{ marginTop: 16, background: COLORS.ink, color: COLORS.paper, border: 'none' }}>
            <SectionLabel accent={COLORS.siennaSoft}>Templates</SectionLabel>
            <h3 style={{ ...serif, fontSize: 19, fontWeight: 400, margin: '8px 0 8px', letterSpacing: '-0.01em', color: COLORS.paper }}>
              Three CV templates, none of them generic.
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
              {['#f6f2ea', '#0e2a4a', '#fafaf7'].map((c, i) => (
                <div key={i} style={{ aspectRatio: '0.71', background: c, borderRadius: 4, padding: 4 }}>
                  <div style={{ height: 3, width: '60%', background: i === 1 ? '#e6ecf3' : i === 2 ? '#e85d28' : '#1a1a17', borderRadius: 1 }} />
                  <div style={{ height: 1.5, width: '80%', background: i === 1 ? '#9aa6b3' : '#999', marginTop: 4, borderRadius: 1 }} />
                  <div style={{ height: 1.5, width: '40%', background: i === 1 ? '#9aa6b3' : '#999', marginTop: 2, borderRadius: 1 }} />
                </div>
              ))}
            </div>
            <Btn kind="secondary" size="sm" style={{ marginTop: 14, color: COLORS.paper, borderColor: COLORS.paper, width: '100%', justifyContent: 'center' }}>
              Browse templates
            </Btn>
          </Card>

          <div style={{ marginTop: 16, padding: 18, fontSize: 12, color: COLORS.muted, lineHeight: 1.55 }}>
            <SectionLabel>Privacy</SectionLabel>
            <div style={{ marginTop: 8 }}>Your contact details and referees are private by default. Sahan never exposes them in the public feed.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
