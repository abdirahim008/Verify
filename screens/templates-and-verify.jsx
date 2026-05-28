// Template picker — the moment a user chooses how their CV will look.

function TemplatesPicker() {
  return (
    <div style={{ ...uiBase, width: 1440, height: 980 }}>
      <TopNav active="templates" />
      <div style={{ padding: '40px 56px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <SectionLabel accent={COLORS.sienna}>Templates</SectionLabel>
            <h1 style={{ ...serif, fontSize: 44, fontWeight: 400, letterSpacing: '-0.025em', margin: '8px 0 6px', maxWidth: 720 }}>
              Three CVs, designed with intent.
            </h1>
            <p style={{ color: COLORS.muted, fontSize: 15, maxWidth: 600, marginTop: 0 }}>
              Each template uses the same structured data — pick a register, switch any time. Verified claims always render with a green check.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 4, background: COLORS.borderSoft, borderRadius: 999 }}>
            {['Individual', 'Company'].map((t, i) => (
              <span key={t} style={{
                padding: '8px 18px', fontSize: 13, fontWeight: 500, borderRadius: 999, cursor: 'pointer',
                background: i === 0 ? COLORS.paper : 'transparent',
                color: i === 0 ? COLORS.ink : COLORS.muted,
                boxShadow: i === 0 ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 28, marginTop: 32 }}>
          {/* Featured — Editorial */}
          <TemplateCard
            featured
            name="Editorial"
            tagline="Magazine register. Drop cap. Cream paper."
            pairing="Fraunces · Newsreader"
            bg="#f6f2ea"
            preview={<EditorialMini />}
          />
          <TemplateCard
            name="Sidebar"
            tagline="Two columns. Built for executives."
            pairing="Archivo · IBM Plex Sans"
            bg="#0f3a3a"
            preview={<SidebarMini />}
          />
          <TemplateCard
            name="Mono"
            tagline="Minimalist, technical, single accent."
            pairing="Space Grotesk · Plex Sans"
            bg="#fafaf7"
            preview={<MonoMini />}
          />
        </div>

        {/* Bottom row — comparison strip */}
        <div style={{ marginTop: 36, padding: '24px 28px', background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 28 }}>
          {[
            { l: 'A4, embed-safe', s: 'Fonts embedded. Prints clean on any device.' },
            { l: 'Long content handled', s: 'Twelve experiences or two — layout doesn\u2019t break.' },
            { l: 'Verified inline', s: 'Green check next to each specific verified claim.' },
            { l: 'Free to download', s: 'No watermark, no upsell. Verification is the upgrade.' },
          ].map((b, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <svg width="14" height="14" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verified}/><path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round"/></svg>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{b.l}</div>
              </div>
              <div style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5 }}>{b.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ name, tagline, pairing, preview, featured, bg }) {
  return (
    <div style={{
      background: COLORS.paper, border: `1px solid ${featured ? COLORS.ink : COLORS.border}`,
      borderRadius: 12, padding: 22, position: 'relative', boxShadow: featured ? COLORS.shadow : 'none',
    }}>
      {featured && (
        <div style={{
          position: 'absolute', top: -10, left: 22, padding: '3px 10px',
          background: COLORS.ink, color: COLORS.paper, borderRadius: 999,
          fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        }}>Most downloaded</div>
      )}
      <div style={{ aspectRatio: '0.71', background: bg, borderRadius: 6, overflow: 'hidden', marginBottom: 18, position: 'relative' }}>
        {preview}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ ...serif, fontSize: 24, fontWeight: 450, letterSpacing: '-0.015em' }}>{name}</div>
          <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>{pairing}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 10, marginBottom: 14, lineHeight: 1.5 }}>{tagline}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn kind={featured ? 'primary' : 'secondary'} size="md" style={{ flex: 1, justifyContent: 'center' }}>
          Use template
        </Btn>
        <Btn kind="ghost" size="md" style={{ color: COLORS.muted }}>Preview</Btn>
      </div>
    </div>
  );
}

// — mini previews for the cards —
function EditorialMini() {
  return (
    <div style={{ padding: '18px 18px', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", color: '#1a1a17', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 17, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
        Ifrah Hassan<br />Abdi
      </div>
      <div style={{ fontSize: 7.5, color: '#0d3b66', fontStyle: 'italic', marginTop: 4, letterSpacing: '0.02em' }}>Senior Health Coordinator</div>
      <div style={{ height: 1, background: '#dcd6c8', margin: '10px 0' }} />
      <div style={{ fontSize: 7, lineHeight: 1.55 }}>
        <span style={{ float: 'left', fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 22, lineHeight: 0.85, marginRight: 3, color: '#0d3b66' }}>P</span>
        ublic health practitioner with eleven years coordinating maternal, newborn and child health.
      </div>
      <div style={{ clear: 'both', height: 8 }} />
      <div style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 7, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0d3b66', marginTop: 8 }}>Experience</div>
      {[1, 2].map(i => (
        <div key={i} style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <span style={{ fontFamily: "'Source Serif 4', 'Source Serif Pro', Georgia, serif", fontSize: 8.5, fontWeight: 500 }}>Senior Health Coordinator</span>
            <svg width="6" height="6" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d"/></svg>
          </div>
          <div style={{ fontSize: 6.5, color: '#6e7480', fontStyle: 'italic' }}>UNICEF Somalia · 2021–Present</div>
        </div>
      ))}
    </div>
  );
}

function SidebarMini() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '38% 1fr', height: '100%', color: '#e6ecf3' }}>
      <div style={{ background: '#091e36', padding: '14px 10px' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#b6c4d6', marginBottom: 10 }} />
        <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 9, lineHeight: 1.1, letterSpacing: '-0.005em' }}>IFRAH<br />HASSAN<br />ABDI</div>
        <div style={{ fontSize: 6, color: '#9aa6b3', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contact</div>
        <div style={{ fontSize: 6, marginTop: 4, lineHeight: 1.4 }}>Mogadishu, SO<br />+252 61 555 0184</div>
        <div style={{ fontSize: 6, color: '#9aa6b3', marginTop: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Skills</div>
        <div style={{ fontSize: 6, marginTop: 4, lineHeight: 1.5 }}>Programme design<br/>Cold-chain logistics<br/>DHIS2 · Kobo</div>
      </div>
      <div style={{ background: '#0e2a4a', padding: '14px 12px' }}>
        <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 7.5, letterSpacing: '0.14em', color: '#b6c4d6', textTransform: 'uppercase' }}>Profile</div>
        <div style={{ fontSize: 6.5, lineHeight: 1.55, marginTop: 4 }}>Public health practitioner with eleven years coordinating MCH programmes.</div>
        <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 700, fontSize: 7.5, letterSpacing: '0.14em', color: '#b6c4d6', textTransform: 'uppercase', marginTop: 10 }}>Experience</div>
        {[1, 2].map(i => (
          <div key={i} style={{ marginTop: 5 }}>
            <div style={{ fontFamily: "'Public Sans', 'Source Sans 3', system-ui, sans-serif", fontSize: 7.5, fontWeight: 600, display: 'flex', gap: 3, alignItems: 'center' }}>
              Senior Health Coord. <svg width="5" height="5" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d"/></svg>
            </div>
            <div style={{ fontSize: 6, color: '#9aa6b3' }}>UNICEF · 2021–Present</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonoMini() {
  return (
    <div style={{ padding: '16px 14px', fontFamily: 'IBM Plex Sans, sans-serif', color: '#111', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 500, fontSize: 16, letterSpacing: '-0.025em', lineHeight: 1 }}>
        Ifrah H. Abdi
      </div>
      <div style={{ fontSize: 7, color: '#666', marginTop: 4 }}>Senior Health Coordinator · Mogadishu</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <div style={{ width: 2, background: '#e85d28' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'IBM Plex Sans', 'Source Sans 3', system-ui, sans-serif", fontWeight: 500, fontSize: 7, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Experience</div>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 600, fontSize: 7.5, display: 'flex', gap: 3, alignItems: 'center' }}>
                  Senior Health Coord. <svg width="5" height="5" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="5.5" fill="#1f6b4d"/></svg>
                </div>
                <div style={{ fontSize: 6, fontFamily: 'IBM Plex Mono, monospace', color: '#666' }}>2021—</div>
              </div>
              <div style={{ fontSize: 6.5, color: '#666' }}>UNICEF Somalia</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————————————————————————————
// Verification flow — request modal moment
// ————————————————————————————————————————————————————
function VerificationFlow() {
  return (
    <div style={{ ...uiBase, width: 1440, height: 980, position: 'relative' }}>
      {/* faded background — the company builder behind */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, filter: 'blur(2px)', pointerEvents: 'none' }}>
        <TopNav active="verification" />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,23,0.45)' }} />

      {/* Modal */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 880, background: COLORS.paper, borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4)',
        display: 'grid', gridTemplateColumns: '1.2fr 1fr',
      }}>
        {/* LEFT — the claim */}
        <div style={{ padding: '36px 36px 32px' }}>
          <SectionLabel accent={COLORS.sienna}>Request verification</SectionLabel>
          <h2 style={{ ...serif, fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em', margin: '8px 0 6px', lineHeight: 1.1 }}>
            One claim. One badge.
          </h2>
          <p style={{ fontSize: 13.5, color: COLORS.muted, marginTop: 6, marginBottom: 20, lineHeight: 1.5 }}>
            We contact the client or referee you nominate. Once they confirm, the green check appears on your profile and every PDF you generate.
          </p>

          <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '14px 16px', background: COLORS.cream }}>
            <div style={{ fontSize: 11.5, color: COLORS.muted, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>Verifying — project</div>
            <div style={{ ...serif, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 6 }}>Galmudug Boreholes (24 sites)</div>
            <div style={{ fontSize: 12.5, color: COLORS.inkSoft, marginTop: 4 }}>UNHCR · 2020–2022 · $2.1M</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 4 }}>Who can confirm this?</div>
            <input defaultValue="Mariam Ibrahim, UNHCR Galmudug Sub-Office" style={{
              width: '100%', padding: '10px 12px', fontSize: 13.5, fontFamily: 'inherit',
              border: `1px solid ${COLORS.border}`, borderRadius: 6, background: COLORS.paper,
              boxSizing: 'border-box', outline: 'none', color: COLORS.ink,
            }} />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11.5, color: COLORS.muted, marginBottom: 4 }}>Upload evidence (private — only our verification team sees this)</div>
            <div style={{
              border: `1.5px dashed ${COLORS.border}`, borderRadius: 7, padding: '14px 14px',
              fontSize: 12.5, color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ width: 28, height: 36, background: COLORS.borderSoft, borderRadius: 3, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, background: COLORS.paper, borderBottomLeftRadius: 2 }} />
              </div>
              <div>
                <div style={{ color: COLORS.ink, fontSize: 13, fontWeight: 500 }}>UNHCR_Galmudug_Completion.pdf</div>
                <div style={{ fontSize: 11.5 }}>2.4 MB · uploaded</div>
              </div>
              <Btn kind="ghost" size="sm" style={{ marginLeft: 'auto', color: COLORS.muted }}>+ add</Btn>
            </div>
          </div>
        </div>

        {/* RIGHT — payment + summary */}
        <div style={{ background: COLORS.ink, color: COLORS.paper, padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
          <SectionLabel accent={COLORS.siennaSoft}>Order summary</SectionLabel>
          <div style={{ marginTop: 18, paddingBottom: 16, borderBottom: '1px solid #2a2a25' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
              <span>Verify 1 project claim</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>$95.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 8, color: '#9aa0a8' }}>
              <span>Concierge handling</span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>included</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
            <span style={{ fontSize: 13, color: '#d4d8de' }}>Total</span>
            <span style={{ ...serif, fontSize: 28, fontWeight: 400, fontFamily: 'Source Sans 3, system-ui, sans-serif' }}>$95.00</span>
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#1d1f24', borderRadius: 7, fontSize: 12, color: '#d4d8de', lineHeight: 1.5 }}>
            Turnaround: 3–7 working days. We refund in full if we can't reach your nominated verifier.
          </div>
          <div style={{ flex: 1 }} />
          <Btn kind="sienna" size="lg" style={{ marginTop: 22, justifyContent: 'center', width: '100%' }}>
            Pay & start verification →
          </Btn>
          <div style={{ fontSize: 11, color: '#9aa0a8', textAlign: 'center', marginTop: 10 }}>
            Payment stub for MVP — no card charged.
          </div>
        </div>
      </div>
    </div>
  );
}

window.TemplatesPicker = TemplatesPicker;
window.VerificationFlow = VerificationFlow;
