// Illustrated demo images for the template previews (scripts/render-
// thumbnails.mjs). Flat SVG illustrations rather than photos: no real
// person's likeness, no licensing, and tiny. Returned as data: URIs so the
// templates' <img src> works unchanged. Not imported by the app itself.

const uri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString("base64")}`;

/** Demo CV photo: a professional woman in a hijab and navy blazer. */
export function portraitWoman(): string {
  return uri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#e3ddd2"/><stop offset="1" stop-color="#c3bba9"/>
    </linearGradient>
    <linearGradient id="scarf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2f5d62"/><stop offset="1" stop-color="#23474b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="330" cy="70" r="120" fill="#ffffff" opacity="0.18"/>
  <!-- blazer and shoulders -->
  <path d="M40 400 C 52 318, 118 288, 200 282 C 282 288, 348 318, 360 400 Z" fill="#1f2d45"/>
  <path d="M168 300 L200 372 L232 300 Z" fill="#e9e4da"/>
  <path d="M150 292 L200 372 L176 300 Z M250 292 L200 372 L224 300 Z" fill="#17233a"/>
  <!-- scarf drape behind the face -->
  <path d="M200 58 C 122 58, 96 124, 100 196 C 103 250, 120 292, 152 316 C 176 332, 224 332, 248 316 C 280 292, 297 250, 300 196 C 304 124, 278 58, 200 58 Z" fill="url(#scarf)"/>
  <!-- face -->
  <path d="M200 110 C 160 110, 146 146, 146 182 C 146 228, 170 262, 200 262 C 230 262, 254 228, 254 182 C 254 146, 240 110, 200 110 Z" fill="#a0694a"/>
  <!-- scarf band framing the face -->
  <path d="M138 196 C 132 136, 160 100, 200 100 C 240 100, 268 136, 262 196 C 258 150, 236 124, 200 124 C 164 124, 142 150, 138 196 Z" fill="#26504f"/>
  <path d="M146 222 C 160 268, 180 284, 200 284 C 220 284, 240 268, 254 222 C 250 280, 228 300, 200 300 C 172 300, 150 280, 146 222 Z" fill="#26504f"/>
  <!-- features -->
  <path d="M166 172 q 12 -7 24 0" stroke="#4a2c1f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M210 172 q 12 -7 24 0" stroke="#4a2c1f" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="178" cy="187" rx="5.5" ry="6.5" fill="#2b1a12"/>
  <ellipse cx="222" cy="187" rx="5.5" ry="6.5" fill="#2b1a12"/>
  <path d="M198 196 q -6 18 2 22" stroke="#86533a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M182 232 q 18 12 36 0" stroke="#6e3a2a" stroke-width="4.5" fill="none" stroke-linecap="round"/>
</svg>`);
}

/** Demo CEO photo: a man with a short beard in a navy suit. */
export function portraitMan(): string {
  return uri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#dde3e6"/><stop offset="1" stop-color="#b5c0c6"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <circle cx="80" cy="60" r="110" fill="#ffffff" opacity="0.2"/>
  <!-- suit -->
  <path d="M36 400 C 50 316, 116 286, 200 280 C 284 286, 350 316, 364 400 Z" fill="#1d2a40"/>
  <path d="M164 290 L200 360 L236 290 Z" fill="#f4f2ee"/>
  <path d="M192 300 L208 300 L214 372 L200 392 L186 372 Z" fill="#8a2f38"/>
  <path d="M146 288 L200 380 L170 296 Z M254 288 L200 380 L230 296 Z" fill="#15203a"/>
  <!-- neck -->
  <path d="M176 240 L224 240 L226 294 C 212 304, 188 304, 174 294 Z" fill="#83533a"/>
  <!-- head -->
  <path d="M200 88 C 156 88, 138 124, 140 168 C 142 222, 168 258, 200 258 C 232 258, 258 222, 260 168 C 262 124, 244 88, 200 88 Z" fill="#8f5c40"/>
  <ellipse cx="139" cy="178" rx="10" ry="18" fill="#83533a"/>
  <ellipse cx="261" cy="178" rx="10" ry="18" fill="#83533a"/>
  <!-- hair -->
  <path d="M140 160 C 134 104, 166 76, 204 78 C 244 80, 268 108, 260 160 C 254 128, 238 112, 200 112 C 166 112, 146 128, 140 160 Z" fill="#1c1411"/>
  <!-- beard -->
  <path d="M146 196 C 150 244, 174 268, 200 268 C 226 268, 250 244, 254 196 C 246 222, 234 232, 222 234 C 214 222, 186 222, 178 234 C 166 232, 154 222, 146 196 Z" fill="#231915"/>
  <!-- features -->
  <path d="M164 160 q 13 -6 26 0" stroke="#1c1411" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M210 160 q 13 -6 26 0" stroke="#1c1411" stroke-width="5" fill="none" stroke-linecap="round"/>
  <ellipse cx="177" cy="176" rx="5.5" ry="6" fill="#20140e"/>
  <ellipse cx="223" cy="176" rx="5.5" ry="6" fill="#20140e"/>
  <path d="M198 184 q -6 18 2 22" stroke="#734631" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M186 232 q 14 7 28 0" stroke="#d9b8a4" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`);
}

/** Demo company logo: a water-drop mark over a skyline, with a wordmark. */
export function companyLogo(): string {
  return uri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96">
  <rect x="4" y="8" width="80" height="80" rx="18" fill="#0f5c63"/>
  <path d="M44 22 C 34 38, 26 48, 26 60 A 18 18 0 0 0 62 60 C 62 48, 54 38, 44 22 Z" fill="#ffffff"/>
  <path d="M30 64 h8 v-8 h6 v12 h6 v-16 h6 v12 h6" stroke="#0f5c63" stroke-width="3.5" fill="none" stroke-linejoin="round"/>
  <text x="100" y="50" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="#10252b">Horn Build</text>
  <text x="101" y="76" font-family="Arial, Helvetica, sans-serif" font-size="15" letter-spacing="4" fill="#0f5c63">&amp; WATER SERVICES</text>
</svg>`);
}

/** Flat illustrated "project photos" for the gallery pages. */
export function projectScene(kind: "water" | "school" | "road"): string {
  const sky = { water: ["#bfe0e8", "#eef6f3"], school: ["#f3d9b8", "#fbf1e2"], road: ["#c9d7e6", "#f1f4f7"] }[kind];
  const ground = { water: "#c9a978", school: "#b99a6c", road: "#a88f68" }[kind];
  const subject = {
    water: `
      <rect x="470" y="150" width="130" height="92" rx="10" fill="#e8eef0" stroke="#55707a" stroke-width="5"/>
      <path d="M470 176 h130 M470 206 h130" stroke="#9fb5bd" stroke-width="4"/>
      <path d="M490 242 L470 400 M580 242 L600 400 M480 320 h110 M476 360 h118" stroke="#55707a" stroke-width="7"/>
      <path d="M535 400 v-40 h-160 v40" stroke="#3d6d8a" stroke-width="9" fill="none"/>
      <rect x="352" y="382" width="44" height="30" rx="4" fill="#3d6d8a"/>
      <circle cx="170" cy="350" r="34" fill="#6f8f5c"/><rect x="164" y="370" width="12" height="40" fill="#6b4f35"/>`,
    school: `
      <path d="M250 250 L400 170 L550 250 Z" fill="#9c4a3a"/>
      <rect x="270" y="250" width="260" height="150" fill="#f1e6d2" stroke="#8a6f52" stroke-width="4"/>
      <rect x="380" y="320" width="40" height="80" fill="#6e4b33"/>
      <rect x="296" y="286" width="54" height="40" fill="#8cb4c4"/><rect x="450" y="286" width="54" height="40" fill="#8cb4c4"/>
      <rect x="396" y="112" width="4" height="60" fill="#5b5b5b"/><path d="M400 114 h44 v26 h-44 Z" fill="#2f7fb8"/>
      <circle cx="640" cy="340" r="44" fill="#7a9960"/><rect x="633" y="370" width="14" height="40" fill="#6b4f35"/>`,
    road: `
      <path d="M330 500 L380 250 L420 250 L560 500 Z" fill="#5d6166"/>
      <path d="M398 262 L402 262 L410 300 L402 300 Z M404 320 L412 320 L424 380 L412 380 Z M418 410 L430 410 L448 500 L432 500 Z" fill="#f2d25c"/>
      <path d="M178 370 L184 300 M184 318 L160 296 M184 312 L206 292" stroke="#6b4f35" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="184" cy="290" rx="74" ry="16" fill="#6f8f5c"/>
      <path d="M736 320 L740 266 M740 280 L722 262" stroke="#6b4f35" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="738" cy="256" rx="52" ry="12" fill="#7a9960"/>
      <rect x="600" y="330" width="90" height="12" fill="#e2a33b"/><rect x="610" y="342" width="8" height="40" fill="#555"/><rect x="672" y="342" width="8" height="40" fill="#555"/>`,
  }[kind];
  return uri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
  <rect width="800" height="500" fill="url(#s)"/>
  <circle cx="660" cy="90" r="42" fill="#fff4cf" opacity="0.9"/>
  <path d="M0 330 Q 200 290 400 320 T 800 310 V 500 H 0 Z" fill="#d8c29b"/>
  <path d="M0 400 Q 250 370 520 395 T 800 390 V 500 H 0 Z" fill="${ground}"/>
  ${subject}
</svg>`);
}

/** Wordmark-style logo for a fictional client. */
export function clientLogo(name: string, color: string, shape: "circle" | "diamond" | "bars"): string {
  const mark = {
    circle: `<circle cx="30" cy="36" r="20" fill="${color}"/><circle cx="30" cy="36" r="9" fill="#fff"/>`,
    diamond: `<path d="M30 14 L52 36 L30 58 L8 36 Z" fill="${color}"/><path d="M30 26 L40 36 L30 46 L20 36 Z" fill="#fff"/>`,
    bars: `<rect x="10" y="30" width="9" height="24" fill="${color}"/><rect x="24" y="20" width="9" height="34" fill="${color}"/><rect x="38" y="12" width="9" height="42" fill="${color}"/>`,
  }[shape];
  const safe = name.replace(/&/g, "&amp;");
  return uri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 72">
  ${mark}
  <text x="66" y="44" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="#23262b">${safe}</text>
</svg>`);
}
