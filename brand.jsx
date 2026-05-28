// Shared brand tokens, helpers, sample data for Sahan
// Warm editorial direction — cream, ink, sienna accent, deep verified-green

// Cool professional palette — LinkedIn-adjacent (distinct shades, not a recreation).
// Keys named "sienna/siennaSoft" preserved for low blast radius; they now hold blues.
const COLORS = {
  cream: '#f3f2ef',        // cool neutral grey — page bg
  paper: '#ffffff',        // pure white cards
  ink: '#1c1c1c',
  inkSoft: '#3a3a3d',
  muted: '#5e6166',
  mutedSoft: '#8d9197',
  border: '#e0e0e0',
  borderSoft: '#f0f0f0',
  sienna: '#0a5cad',       // primary blue (was sienna)
  siennaSoft: '#d6e4f2',   // soft blue tint (was warm sand)
  verified: '#067a5e',     // confident green for verified
  verifiedSoft: '#d8eee5',
  ochre: '#073563',        // deep navy (kept name for compat)
  shadow: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)',
};

// Brand wordmark
function SahanMark({ size = 18, color = COLORS.ink, withDot = true }) {
  return (
    <span style={{
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '-0.015em',
      color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      fontFeatureSettings: '"ss01"',
    }}>
      Sahan
      {withDot && <span style={{ color: COLORS.sienna }}>.</span>}
    </span>
  );
}

// Photo placeholder — subtly striped, monospace label
function PhotoSlot({ w = 80, h = 80, label = 'photo', radius = '50%', stripeColor = '#d4d8de', bg = '#e6eaf0' }) {
  const id = 'stripe-' + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={w} height={h} style={{ borderRadius: radius, display: 'block', flexShrink: 0 }}>
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <rect width="6" height="6" fill={bg} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={stripeColor} strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        fontFamily="ui-monospace, monospace" fontSize="9" fill="#6b6457">
        {label}
      </text>
    </svg>
  );
}

// Verified badge — inline, tasteful
function VerifiedBadge({ note, size = 11 }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'Source Sans 3, system-ui, sans-serif',
      fontSize: size,
      fontWeight: 500,
      color: COLORS.verified,
      background: COLORS.verifiedSoft,
      padding: '2px 8px 2px 6px',
      borderRadius: 999,
      letterSpacing: '-0.005em',
      whiteSpace: 'nowrap',
    }}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <circle cx="5.5" cy="5.5" r="5.5" fill={COLORS.verified} />
        <path d="M3 5.5 L4.7 7.2 L8 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      {note}
    </span>
  );
}

// Sample data — Somali humanitarian / engineering context
const SAMPLE_INDIVIDUAL = {
  full_name: 'Ifrah Hassan Abdi',
  headline: 'Senior Health Coordinator — Maternal & Child Health',
  location: 'Mogadishu, Somalia',
  email: 'ifrah.abdi@example.so',
  phone: '+252 61 555 0184',
  languages: ['Somali (native)', 'English (fluent)', 'Arabic (working)'],
  summary: 'Public health practitioner with eleven years coordinating maternal, newborn and child health programmes across south-central Somalia. Designed and led the regional cold-chain expansion for Banadir under UNICEF, raising routine immunisation coverage from 41% to 73% in twenty-two months.',
  experiences: [
    {
      org: 'UNICEF Somalia',
      title: 'Senior Health Coordinator',
      loc: 'Mogadishu',
      start: 'Mar 2021', end: 'Present',
      desc: 'Lead a team of fourteen across Banadir, Lower Shabelle and Middle Shabelle. Designed the cold-chain expansion that brought routine immunisation to 64 previously unreached settlements. Manage a $4.3M annual portfolio across three donor lines.',
      verified: true, verifier: 'UNICEF Somalia',
    },
    {
      org: 'Save the Children International',
      title: 'MNCH Programme Manager',
      loc: 'Baidoa',
      start: 'Aug 2017', end: 'Feb 2021',
      desc: 'Managed antenatal and obstetric-emergency programming across Bay region. Built the referral protocol now used by five MoH facilities; trained 96 community midwives.',
      verified: true, verifier: 'Save the Children',
    },
    {
      org: 'Somali Red Crescent Society',
      title: 'Field Health Officer',
      loc: 'Galkayo',
      start: 'Jun 2014', end: 'Jul 2017',
      desc: 'Front-line clinical and outreach work during the 2017 drought response. Co-authored the SRCS rapid-assessment toolkit.',
      verified: false,
    },
  ],
  educations: [
    { inst: 'London School of Hygiene & Tropical Medicine', qual: 'MSc Public Health for Development', field: '', years: '2019 – 2020', verified: true },
    { inst: 'Benadir University', qual: 'BSc Nursing & Midwifery', field: 'First-class honours', years: '2010 – 2014', verified: false },
  ],
  skills: ['Programme design', 'Cold-chain logistics', 'Donor reporting (BHA, ECHO, FCDO)', 'KoboToolbox / DHIS2', 'Cluster coordination', 'Budget management', 'Field security'],
  certifications: [
    { name: 'Humanitarian Logistics (Fritz Institute)', issuer: 'Fritz Institute', year: 2022, verified: true },
    { name: 'PMD Pro Level 1', issuer: 'PM4NGOs', year: 2020, verified: false },
  ],
};

const SAMPLE_COMPANY = {
  name: 'Wadani Engineering Group',
  tagline: 'Civil infrastructure for the Horn of Africa.',
  about: 'Wadani Engineering Group is a Somali civil-engineering and project-management firm founded in 2012. We deliver donor-funded infrastructure — roads, water, healthcare and education facilities — across south-central Somalia and the Federal Member States.',
  mission: 'To build infrastructure that withstands the climate, the politics, and the next generation.',
  vision: 'A Horn of Africa where every region\u2019s public infrastructure is built and maintained by its own people.',
  country: 'Somalia',
  reg: 'MOG-2012-04419',
  founded: 2012,
  website: 'wadani-eg.so',
  sectors: ['Roads & bridges', 'Water & sanitation', 'Health facilities', 'Education facilities', 'Renewable energy'],
  services: ['Design & feasibility studies', 'Construction supervision', 'Turnkey delivery', 'Climate-resilient retrofits', 'Community engagement'],
  projects: [
    { name: 'Banadir Rural Road Programme — Phase II', client: 'World Bank / Federal Government of Somalia', sector: 'Roads', value: '$8.2M', years: '2022 – 2024', scope: 'Rehabilitation of 47km of feeder roads connecting nine villages to the Afgooye corridor; community-employment model delivered 312 jobs.', verified: true, verifier: 'World Bank Mogadishu Office' },
    { name: 'Hirshabelle Health Posts (12 facilities)', client: 'UNICEF Somalia', sector: 'Health', value: '$3.6M', years: '2021 – 2023', scope: 'Design and construction of twelve climate-resilient primary-health posts across Middle Shabelle and Hiran, including solar power and water-harvesting systems.', verified: true, verifier: 'UNICEF Somalia' },
    { name: 'Galmudug Boreholes (24 sites)', client: 'UNHCR', sector: 'Water', value: '$2.1M', years: '2020 – 2022', scope: 'Solar-pumped boreholes serving displaced and host populations; full O&M handover to the Galmudug Ministry of Water.', verified: false },
    { name: 'Baidoa University Library', client: 'AfDB / Ministry of Education', sector: 'Education', value: '$1.4M', years: '2019 – 2020', scope: 'Design–build delivery of a 980m² library and study centre.', verified: false },
  ],
  clients: ['World Bank', 'UNICEF', 'UNHCR', 'African Development Bank', 'FCDO', 'Federal Government of Somalia', 'EU Delegation to Somalia', 'GIZ'],
  team: [
    { name: 'Eng. Abdirahman Yusuf', role: 'Managing Director', reports: null },
    { name: 'Eng. Hodan Mohamed', role: 'Director of Operations', reports: 0 },
    { name: 'Eng. Mohamed Ali Farah', role: 'Director of Engineering', reports: 0 },
    { name: 'Khadija Abdullahi', role: 'Head of Finance', reports: 0 },
    { name: 'Eng. Said Hussein', role: 'Roads Lead', reports: 2 },
    { name: 'Eng. Fatima Warsame', role: 'Water Lead', reports: 2 },
  ],
  certifications: [
    { name: 'ISO 9001:2015', issuer: 'Bureau Veritas', year: 2023, verified: true },
    { name: 'FIDIC Member Firm', issuer: 'FIDIC', year: 2021, verified: true },
  ],
};

Object.assign(window, { COLORS, SahanMark, PhotoSlot, VerifiedBadge, SAMPLE_INDIVIDUAL, SAMPLE_COMPANY });
