// App UI screens — using cream/ink/sienna warm editorial system
// Tone: Professional + restrained, LinkedIn-adjacent but warmer.

const uiBase = {
  fontFamily: 'Source Sans 3, system-ui, sans-serif',
  color: COLORS.ink,
  background: COLORS.cream,
  fontSize: 14,
  lineHeight: 1.5,
};

const serif = { fontFamily: 'Source Sans 3, system-ui, sans-serif', fontFeatureSettings: '"ss01"' };

// — shared chrome —
function TopNav({ active = 'home', user = SAMPLE_INDIVIDUAL }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'profile', label: 'My profile' },
    { id: 'templates', label: 'Templates' },
    { id: 'verification', label: 'Verification' },
  ];
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 40px', borderBottom: `1px solid ${COLORS.border}`,
      background: COLORS.paper,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
        <SahanMark size={22} />
        <nav style={{ display: 'flex', gap: 28 }}>
          {items.map(it => (
            <a key={it.id} style={{
              fontSize: 13.5, color: active === it.id ? COLORS.ink : COLORS.muted,
              fontWeight: active === it.id ? 600 : 450,
              borderBottom: active === it.id ? `1.5px solid ${COLORS.sienna}` : '1.5px solid transparent',
              paddingBottom: 2, textDecoration: 'none',
            }}>{it.label}</a>
          ))}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 12.5, color: COLORS.muted }}>Profile 82% complete</span>
        <PhotoSlot w={32} h={32} label="" />
      </div>
    </header>
  );
}

function Btn({ children, kind = 'primary', size = 'md', ...rest }) {
  const styles = {
    primary: { background: COLORS.ink, color: COLORS.paper, border: `1px solid ${COLORS.ink}` },
    secondary: { background: 'transparent', color: COLORS.ink, border: `1px solid ${COLORS.ink}` },
    ghost: { background: 'transparent', color: COLORS.ink, border: '1px solid transparent' },
    sienna: { background: COLORS.sienna, color: '#fff', border: `1px solid ${COLORS.sienna}` },
    quiet: { background: COLORS.borderSoft, color: COLORS.ink, border: `1px solid ${COLORS.border}` },
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12.5, borderRadius: 6 },
    md: { padding: '9px 16px', fontSize: 13.5, borderRadius: 7 },
    lg: { padding: '13px 22px', fontSize: 14.5, borderRadius: 8 },
  };
  return (
    <button {...rest} style={{
      ...styles[kind], ...sizes[size],
      fontFamily: 'Source Sans 3, system-ui, sans-serif', fontWeight: 500,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
      letterSpacing: '-0.005em', ...rest.style,
    }}>{children}</button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COLORS.paper, border: `1px solid ${COLORS.border}`,
      borderRadius: 10, padding: 24, ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children, accent }) {
  return (
    <div style={{
      fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: accent || COLORS.muted, fontWeight: 600,
    }}>{children}</div>
  );
}

// ————————————————————————————————————————————————————
// 1. SIGNUP — pick individual vs company
// ————————————————————————————————————————————————————
function Signup() {
  return (
    <div style={{ ...uiBase, width: 1280, height: 820, display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
      {/* left — editorial side */}
      <div style={{
        background: COLORS.ink, color: COLORS.paper, padding: '56px 64px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        backgroundImage: `radial-gradient(circle at 80% 10%, ${COLORS.sienna}26, transparent 50%)`,
      }}>
        <SahanMark size={26} color={COLORS.paper} />
        <div>
          <div style={{ ...serif, fontSize: 56, fontWeight: 350, lineHeight: 1.04, letterSpacing: '-0.025em', maxWidth: 560 }}>
            A professional record<br />
            <span style={{ fontStyle: 'italic', color: COLORS.siennaSoft }}>worth standing on.</span>
          </div>
          <p style={{ marginTop: 28, fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, color: '#d4d8de' }}>
            Build a structured profile, download an elegant CV or company profile in seconds, and — when it matters — have specific claims independently verified.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 36, fontSize: 12.5, color: '#9aa0a8' }}>
          <div><div style={{ ...serif, fontSize: 22, color: COLORS.paper }}>2,140</div>profiles built</div>
          <div><div style={{ ...serif, fontSize: 22, color: COLORS.paper }}>4,803</div>claims verified</div>
          <div><div style={{ ...serif, fontSize: 22, color: COLORS.paper }}>17</div>countries</div>
        </div>
      </div>
      {/* right — form */}
      <div style={{ background: COLORS.cream, padding: '64px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <SectionLabel accent={COLORS.sienna}>Create your account</SectionLabel>
        <h2 style={{ ...serif, fontSize: 34, fontWeight: 400, margin: '14px 0 8px', letterSpacing: '-0.02em' }}>
          Who are you building a profile for?
        </h2>
        <p style={{ color: COLORS.muted, fontSize: 14, marginBottom: 28 }}>
          You can switch later, but this changes the sections we ask about.
        </p>

        {[
          { id: 'individual', title: 'I\u2019m an individual', sub: 'A CV, your experience, education, referees.', selected: true },
          { id: 'company', title: 'I\u2019m a company or organisation', sub: 'A bid-ready company profile with projects, clients, team.', selected: false },
        ].map(opt => (
          <label key={opt.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '18px 20px', marginBottom: 12, cursor: 'pointer',
            background: opt.selected ? COLORS.paper : 'transparent',
            border: `1px solid ${opt.selected ? COLORS.ink : COLORS.border}`,
            borderRadius: 10,
            boxShadow: opt.selected ? COLORS.shadow : 'none',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', marginTop: 3,
              border: `1.5px solid ${opt.selected ? COLORS.ink : COLORS.muted}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: COLORS.paper,
            }}>
              {opt.selected && <div style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS.ink }} />}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>{opt.title}</div>
              <div style={{ color: COLORS.muted, fontSize: 13 }}>{opt.sub}</div>
            </div>
          </label>
        ))}

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12.5, color: COLORS.muted, marginBottom: 6 }}>Work email</div>
          <input defaultValue="ifrah.abdi@example.so" style={{
            width: '100%', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit',
            border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.paper,
            color: COLORS.ink, outline: 'none',
          }} />
        </div>

        <Btn kind="primary" size="lg" style={{ marginTop: 18, justifyContent: 'center', width: '100%' }}>
          Continue with email
          <span style={{ marginLeft: 4 }}>→</span>
        </Btn>
        <Btn kind="secondary" size="lg" style={{ marginTop: 10, justifyContent: 'center', width: '100%' }}>
          Email me a magic link instead
        </Btn>
        <div style={{ marginTop: 18, fontSize: 12.5, color: COLORS.muted, textAlign: 'center' }}>
          By continuing you agree to our terms. Contact details are private by default.
        </div>
      </div>
    </div>
  );
}

window.Signup = Signup;
window.uiBase = uiBase;
window.serif = serif;
window.Btn = Btn;
window.Card = Card;
window.SectionLabel = SectionLabel;
window.TopNav = TopNav;
