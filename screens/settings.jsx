// Settings — privacy & visibility, the hard rules from §10

function PrivacySettings() {
  const rows = [
    { sec: 'Headline & summary', def: 'public', locked: false },
    { sec: 'Experience', def: 'public', locked: false },
    { sec: 'Education', def: 'public', locked: false },
    { sec: 'Skills', def: 'public', locked: false },
    { sec: 'Languages', def: 'public', locked: false },
    { sec: 'Location (precise)', def: 'registered_only', locked: false, sensitive: true },
    { sec: 'Email', def: 'registered_only', locked: false, sensitive: true },
    { sec: 'Phone number', def: 'private', locked: false, sensitive: true },
    { sec: 'Referees (names & contact)', def: 'private', locked: true, sensitive: true, note: 'Always private — third-party data' },
    { sec: 'Verification evidence', def: 'private', locked: true, sensitive: true, note: 'Always private — admin-only' },
  ];

  return (
    <div style={{ ...uiBase, width: 1440, height: 980 }}>
      <TopNav active="profile" />
      <div style={{ padding: '40px 56px 60px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 56 }}>
        {/* nav */}
        <aside>
          <SectionLabel>Settings</SectionLabel>
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0 }}>
            {['Account', 'Privacy & visibility', 'Notifications', 'Payment & billing', 'Danger zone'].map((s, i) => (
              <li key={s} style={{
                padding: '11px 14px', margin: '0 -14px',
                borderRadius: 7, fontSize: 13.5,
                background: i === 1 ? COLORS.cream : 'transparent',
                color: i === 1 ? COLORS.ink : COLORS.inkSoft,
                fontWeight: i === 1 ? 500 : 400, cursor: 'pointer',
                borderLeft: i === 1 ? `2px solid ${COLORS.sienna}` : '2px solid transparent',
              }}>{s}</li>
            ))}
          </ul>
        </aside>

        <main>
          <SectionLabel accent={COLORS.sienna}>Privacy & visibility</SectionLabel>
          <h1 style={{ ...serif, fontSize: 38, fontWeight: 400, letterSpacing: '-0.02em', margin: '8px 0 6px' }}>
            What strangers can see.
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, maxWidth: 640, marginBottom: 28, lineHeight: 1.55 }}>
            Three audiences see three different versions of your profile. Your downloadable CV is separate — you choose every time you share it.
          </p>

          {/* Audience preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 32 }}>
            {[
              { l: 'You (owner)', c: 'Everything + edit controls', icon: '●' },
              { l: 'Registered users', c: 'Public + registered-only', icon: '◐' },
              { l: 'Public link', c: 'Public sections only', icon: '○' },
            ].map((a, i) => (
              <div key={i} style={{
                padding: '16px 18px', background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 9,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: COLORS.sienna, fontSize: 18 }}>{a.icon}</span>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{a.l}</div>
                </div>
                <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 6 }}>{a.c}</div>
              </div>
            ))}
          </div>

          {/* Visibility rows */}
          <div style={{ background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              padding: '12px 24px', background: COLORS.borderSoft + '70',
              fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: COLORS.muted, fontWeight: 600,
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div>Section</div>
              <div style={{ textAlign: 'center' }}>Public</div>
              <div style={{ textAlign: 'center' }}>Registered only</div>
              <div style={{ textAlign: 'center' }}>Private</div>
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                padding: '14px 24px', alignItems: 'center', gap: 8,
                borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.borderSoft}` : 'none',
                background: r.locked ? COLORS.borderSoft + '40' : 'transparent',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: r.sensitive ? 500 : 400, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.sec}
                    {r.locked && (
                      <span title="Locked" style={{ color: COLORS.muted, fontSize: 11 }}>
                        🔒
                      </span>
                    )}
                  </div>
                  {r.note && <div style={{ fontSize: 11.5, color: COLORS.muted, marginTop: 2 }}>{r.note}</div>}
                </div>
                {['public', 'registered_only', 'private'].map(level => (
                  <div key={level} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Pill selected={r.def === level} disabled={r.locked} level={level} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, padding: '16px 18px', background: COLORS.ink, color: COLORS.paper, borderRadius: 9, fontSize: 13, lineHeight: 1.6, display: 'flex', gap: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.sienna, color: COLORS.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 600 }}>!</div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>Our hard rules</div>
              <div style={{ color: '#d4d8de', fontSize: 12.5 }}>
                Referee details and verification evidence are <b style={{ color: COLORS.paper }}>always private</b>. We never default contact information to public. We never expose any registered-only field through public APIs.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Pill({ level, selected, disabled }) {
  const colors = {
    public: { bg: COLORS.verifiedSoft, ink: COLORS.verified },
    registered_only: { bg: '#dbe5f0', ink: '#0d3b66' },
    private: { bg: '#e3e6eb', ink: '#5e6166' },
  }[level];
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      border: `1.5px solid ${selected ? colors.ink : COLORS.border}`,
      background: selected ? colors.ink : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled && !selected ? 0.3 : 1,
    }}>
      {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.paper }} />}
    </div>
  );
}

window.PrivacySettings = PrivacySettings;
