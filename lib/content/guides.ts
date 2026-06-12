// Long-tail SEO landing pages — the content engine.
//
// Strategy (see the market analysis): Sahan does NOT fight Canva/Zety for
// head terms like "resume builder". Instead each page below targets a
// specific, rankable long-tail query the giants ignore — humanitarian /
// NGO / East-Africa / tender intent — where genuinely useful, specific
// content can rank within 6–18 months and convert because it speaks the
// reader's exact context.
//
// Pure data, no CMS. Rendered by app/guides/[slug]/page.tsx. Keep the
// writing specific and accurate to the sector — that specificity is the
// moat. Generic filler would read like every other doorway page and
// rank for nothing.

export interface GuideSection {
  heading: string;
  body: string[];           // paragraphs
  bullets?: string[];       // optional list after the paragraphs
}

export interface Guide {
  slug: string;
  category: "cv" | "company";
  /** Primary long-tail keyword this page targets. */
  keyword: string;
  /** <title>. Keep ≤ ~60 chars where possible. */
  title: string;
  h1: string;
  metaDescription: string;  // ≤ ~155 chars
  /** Short label for breadcrumbs / cards. */
  shortLabel: string;
  intro: string[];          // 1–2 opening paragraphs
  sections: GuideSection[];
  /** "What to include" style checklist, rendered as a styled card. */
  checklist?: { title: string; items: string[] };
  faq: { q: string; a: string }[];
  related: string[];        // slugs
  cta: { title: string; body: string; href: string; label: string };
  updated: string;          // ISO date — drives Article schema
}

const UPDATED = "2026-06-01";

export const GUIDES: Guide[] = [
  // ─────────────────────────────────────────────────────────────────
  {
    slug: "humanitarian-cv-template",
    category: "cv",
    keyword: "humanitarian CV template",
    title: "Humanitarian CV Template (Free) — Built for Aid & NGO Jobs",
    h1: "The humanitarian CV template that actually fits aid work",
    shortLabel: "Humanitarian CV",
    metaDescription:
      "A free humanitarian CV template designed for aid and NGO roles in Somalia and East Africa. Structured, recruiter-ready, and downloadable on your phone in minutes.",
    intro: [
      "A humanitarian CV is not a corporate résumé with the word \"refugee\" added. Recruiters at UN agencies, INGOs and national NGOs are scanning for very specific signals: which donors you've delivered against, which clusters you've coordinated, how you performed in insecure or hard-to-reach areas, and whether your results are quantified. A generic template from a design tool buries all of that.",
      "Sahan's humanitarian CV template is structured around exactly those signals. You fill in plain fields — experience, education, skills, referees — and it generates a clean, A4, recruiter-ready PDF. It works entirely in your phone's browser, and the layout never breaks, even with the very long organisation names common in this sector.",
    ],
    sections: [
      {
        heading: "What makes a humanitarian CV different",
        body: [
          "Humanitarian recruiters read fast and skim for fit against a specific Terms of Reference. Your CV has to make the match obvious in the first few lines. That means leading with your sector and the donors or mechanisms you've worked under, not a vague \"motivated professional\" summary.",
          "It also means treating field and security experience as a first-class qualification. Time in a hard duty station, surge deployments, or work during an active response is exactly what distinguishes candidates here — so it belongs in the body of each role, not hidden.",
        ],
        bullets: [
          "Lead with sector + donor lines (BHA, ECHO, FCDO, GFFO, OFDA legacy, etc.)",
          "Quantify outcomes: coverage %, beneficiaries reached, budget managed",
          "Name the clusters or working groups you coordinated",
          "Make field / hard-duty-station experience explicit",
          "Keep it to two pages — recruiters won't read more",
        ],
      },
      {
        heading: "Structure that works for aid roles",
        body: [
          "Open with a two-to-four line professional summary that states your sector, years of experience, and your single strongest, quantified achievement. Then list experience in reverse-chronological order, each role with one line of context and two to four quantified bullet points.",
          "Education and certifications matter in this sector — PMD Pro, Sphere, HEAT, and donor-specific compliance training all signal readiness. Languages belong near the top: working Somali, Arabic, Swahili or French can be decisive for a regional role.",
        ],
      },
      {
        heading: "Why generic CV makers fail humanitarian candidates",
        body: [
          "Design-first tools optimise for visual flourish, not the structured, scannable layout aid recruiters expect — and many produce files that mangle long NGO names or break across pages. They also have no concept of verification, which is increasingly what separates a credible claim from an unprovable one.",
          "Sahan is the opposite: structured data first, a small set of genuinely elegant templates, and the option to add a verified badge to a specific role once an admin has confirmed it with the employer. The result looks designed, reads clearly, and carries proof where it counts.",
        ],
      },
    ],
    checklist: {
      title: "What to include in a humanitarian CV",
      items: [
        "Contact details + languages (with proficiency)",
        "A 2–4 line summary leading with sector and a quantified result",
        "Experience with donor lines and measurable outcomes",
        "Cluster / working-group coordination roles",
        "Field and hard-duty-station experience, stated plainly",
        "Sector training: PMD Pro, Sphere, HEAT, safeguarding",
        "Two referees attached to the roles they can speak to",
      ],
    },
    faq: [
      {
        q: "How long should a humanitarian CV be?",
        a: "Two pages is the norm. Recruiters screen against a Terms of Reference and rarely read past page two. Sahan's templates are built to keep even a long career to two clean pages.",
      },
      {
        q: "Is Sahan's humanitarian CV template really free?",
        a: "Yes. Building your profile and downloading your CV is free. Optional paid verification adds an admin-confirmed badge to specific claims — but the CV itself costs nothing.",
      },
      {
        q: "Can I make my humanitarian CV on my phone?",
        a: "Yes. Sahan runs entirely in the mobile browser — fill in your profile, preview the PDF, and download, all on a phone.",
      },
    ],
    related: ["ngo-cv-template", "monitoring-evaluation-cv", "cv-format-somalia"],
    cta: {
      title: "Build your humanitarian CV now",
      body: "Fill in a few fields and download a recruiter-ready PDF in minutes — free, on any phone.",
      href: "/signup?type=individual",
      label: "Start your CV — free",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "ngo-cv-template",
    category: "cv",
    keyword: "NGO CV template",
    title: "NGO CV Template & Format (Free, Mobile-Friendly)",
    h1: "NGO CV template and format that gets you shortlisted",
    shortLabel: "NGO CV",
    metaDescription:
      "Free NGO CV template and format for jobs at INGOs, UN agencies and national NGOs. Structured, ATS-friendly and downloadable on your phone.",
    intro: [
      "NGOs hire against structured criteria, and their shortlisting is often done by a panel scoring each CV against the same checklist. The candidates who get through are the ones whose CV maps cleanly onto that checklist — programme area, donor experience, results, qualifications — without making the panel hunt for it.",
      "This template gives you that structure by default. You enter your details once; Sahan formats them into a clean, consistent CV you can update and re-download any time a new vacancy opens.",
    ],
    sections: [
      {
        heading: "The NGO CV format, section by section",
        body: [
          "A strong NGO CV follows a predictable order so a panel can score it quickly: header and contact, a short professional summary, work experience, education, certifications, skills, languages, and referees. Predictability is a feature here, not a weakness — it makes you easy to score.",
          "Within experience, each role should carry the organisation, your title, location, dates, and two to four bullet points that each state an action and a measurable result. Avoid responsibility lists; panels reward delivery, not duties.",
        ],
      },
      {
        heading: "Make it ATS- and panel-friendly",
        body: [
          "Larger INGOs increasingly run CVs through applicant-tracking systems before a human sees them. Clean, single-column-friendly structure and real text (not text trapped inside images) is what passes. Sahan generates selectable, embedded-font PDFs — never a flattened image — so both software and people can read every word.",
          "Mirror the vocabulary of the vacancy. If the advert says \"monitoring, evaluation, accountability and learning (MEAL)\", use that phrase where it's true of you, rather than a synonym the system won't match.",
        ],
      },
    ],
    checklist: {
      title: "NGO CV checklist",
      items: [
        "Header with phone, email, location and languages",
        "2–4 line summary tied to the programme area you're applying for",
        "Experience as action + measurable result, not duty lists",
        "Donor and grant context where relevant",
        "Certifications: PMD Pro, MEAL, finance, safeguarding",
        "Referees who can speak to specific roles",
      ],
    },
    faq: [
      {
        q: "What format do NGOs prefer for CVs?",
        a: "A clean, reverse-chronological, two-page PDF with real selectable text. Some agencies also ask for a UN-style P11 or a personal-history form, but a strong PDF CV is the universal starting point.",
      },
      {
        q: "Does Sahan's NGO CV pass applicant-tracking systems?",
        a: "Yes. Sahan produces structured PDFs with embedded fonts and selectable text, which is what ATS software needs to parse your experience correctly.",
      },
    ],
    related: ["humanitarian-cv-template", "monitoring-evaluation-cv", "cv-format-kenya"],
    cta: {
      title: "Create your NGO CV",
      body: "One structured profile, re-usable for every vacancy. Build it free and download in minutes.",
      href: "/signup?type=individual",
      label: "Build my NGO CV",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "monitoring-evaluation-cv",
    category: "cv",
    keyword: "monitoring and evaluation CV",
    title: "Monitoring & Evaluation (M&E) CV Template — Free",
    h1: "Monitoring & Evaluation (M&E) CV that proves you can measure impact",
    shortLabel: "M&E CV",
    metaDescription:
      "Free M&E / MEAL CV template for monitoring and evaluation jobs in the humanitarian and development sector. Show the tools, frameworks and results that get you hired.",
    intro: [
      "Monitoring and evaluation is one of the most in-demand functions in the sector, and one of the easiest to under-sell on a CV. An M&E recruiter wants to see, fast, which frameworks you've built, which tools you've run, and what your data actually changed.",
      "This template is structured so those proof points sit where they belong — quantified, specific, and tied to the programmes they served.",
    ],
    sections: [
      {
        heading: "Lead with frameworks, tools and indicators",
        body: [
          "Name the frameworks you've worked inside — logframes, theories of change, results frameworks — and the indicators you owned. Then name your tools concretely: KoboToolbox, ODK, DHIS2, Power BI, SPSS, Stata, or R. Vague \"data analysis\" lines lose to candidates who name the stack.",
          "Crucially, close the loop. Don't just say you ran a survey; say what the finding changed — a targeting decision, a budget reallocation, a programme redesign. M&E that influenced a decision is worth more than M&E that filled a report.",
        ],
        bullets: [
          "Frameworks: logframe, theory of change, results framework",
          "Data tools: KoboToolbox, ODK, DHIS2, Power BI, SPSS, Stata, R",
          "Methods: baseline/endline, PDM, third-party monitoring, RCTs",
          "Always state the decision your data informed",
        ],
      },
      {
        heading: "Show donor reporting fluency",
        body: [
          "M&E lives next to donor compliance. Demonstrating that you've reported against BHA, ECHO, FCDO or GFFO indicator sets — and survived an audit or evaluation — signals you can be trusted with the parts of the job that protect funding.",
        ],
      },
    ],
    checklist: {
      title: "M&E CV must-haves",
      items: [
        "Named frameworks and the indicators you owned",
        "Specific data tools, not generic 'data analysis'",
        "Survey methods (baseline, endline, PDM, TPM)",
        "The decision each piece of analysis informed",
        "Donor reporting and evaluation experience",
        "Relevant training: IPC, MEAL, statistics",
      ],
    },
    faq: [
      {
        q: "What tools should an M&E CV mention?",
        a: "Name the ones you've actually used — typically KoboToolbox or ODK for collection, DHIS2 for health data, and Power BI, SPSS, Stata or R for analysis. Specific tools beat generic phrasing every time.",
      },
      {
        q: "How do I show impact on an M&E CV?",
        a: "For each result, state what the data changed: a targeting decision, a reallocation, a redesign. M&E that influenced a decision reads far stronger than M&E that produced a report.",
      },
    ],
    related: ["humanitarian-cv-template", "ngo-cv-template", "cv-format-somalia"],
    cta: {
      title: "Build your M&E CV",
      body: "Put your frameworks, tools and results in a clean, recruiter-ready format — free.",
      href: "/signup?type=individual",
      label: "Start my M&E CV",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "cv-format-somalia",
    category: "cv",
    keyword: "CV format for jobs in Somalia",
    title: "CV Format for Jobs in Somalia (Free Template)",
    h1: "The right CV format for jobs in Somalia",
    shortLabel: "CV format · Somalia",
    metaDescription:
      "The CV format that works for jobs in Somalia — NGO, government, engineering and private sector. Free, mobile-friendly, and built for the Somali job market.",
    intro: [
      "The Somali job market is shaped by the donor-funded sector, a growing private sector in Mogadishu, Hargeisa and Garowe, and a large, qualified diaspora competing for the same senior roles. A CV that works here is clean, evidence-led, and easy to verify.",
      "Sahan was built for exactly this market. It produces a structured, professional CV that looks credible to an INGO panel and a private employer alike — and you can build it on a phone, which is how most people here will use it.",
    ],
    sections: [
      {
        heading: "What Somali employers look for",
        body: [
          "Across NGOs, government and the private sector, employers here reward demonstrable delivery and trust. Quantified results and named referees carry weight precisely because claims are hard to check — which is also why a verified badge, confirmed with the employer who issued the experience, is so powerful in this market.",
          "Languages matter. State Somali, Arabic and English with honest proficiency levels; for regional roles, Swahili or Amharic can tip a decision.",
        ],
      },
      {
        heading: "Format, length and delivery",
        body: [
          "Keep it to two pages, reverse-chronological, with a short summary up top. Deliver a PDF — not a Word file that reflows differently on every device. Sahan's PDFs embed their fonts so your CV looks identical whether it's opened in Mogadishu, Nairobi or Minneapolis.",
        ],
      },
    ],
    checklist: {
      title: "Somalia CV checklist",
      items: [
        "Two pages, reverse-chronological, PDF",
        "Languages with honest proficiency",
        "Quantified results and named referees",
        "Verified badges on your strongest claims (optional)",
        "Clean layout that survives long organisation names",
      ],
    },
    faq: [
      {
        q: "Should a Somalia CV include a photo?",
        a: "It's optional and employer-dependent. Sahan lets you add a profile photo if you want one; the Sidebar template places it cleanly, and the others omit it by design.",
      },
      {
        q: "Can I build a CV for Somali jobs on my phone?",
        a: "Yes — that's the primary way Sahan is used here. Build, preview and download your CV entirely in a mobile browser.",
      },
    ],
    related: ["humanitarian-cv-template", "ngo-cv-template", "make-cv-on-phone"],
    cta: {
      title: "Make a CV for jobs in Somalia",
      body: "Free, mobile-friendly, and built for the Somali job market. Start now.",
      href: "/signup?type=individual",
      label: "Start my CV",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "cv-format-kenya",
    category: "cv",
    keyword: "CV format for jobs in Kenya",
    title: "CV Format for Jobs in Kenya (Free Template)",
    h1: "The CV format that works for jobs in Kenya",
    shortLabel: "CV format · Kenya",
    metaDescription:
      "The CV format Kenyan employers expect — NGO, corporate and development roles. Free template, mobile-friendly, ATS-ready, download in minutes.",
    intro: [
      "Kenya hosts the regional headquarters of dozens of INGOs and UN agencies, alongside a competitive corporate market in Nairobi. CVs here are expected to be clean, achievement-focused, and increasingly ATS-ready, because larger employers screen applications with software before a recruiter sees them.",
      "Sahan produces a CV that satisfies both the human panel and the software: structured, selectable text, embedded fonts, two pages.",
    ],
    sections: [
      {
        heading: "Achievement-led, not duty-led",
        body: [
          "Kenyan recruiters, especially in the NGO and corporate space, reward CVs that lead with outcomes. Replace \"responsible for managing the budget\" with \"managed a KES 40M annual budget across three donor lines with zero audit findings\". The second version is what gets shortlisted.",
        ],
      },
      {
        heading: "ATS-ready by construction",
        body: [
          "Because many Nairobi employers use applicant-tracking systems, avoid CVs built as images or heavy graphics — they parse as gibberish. Sahan's PDFs are real text with embedded fonts, so your experience is read correctly by both the system and the recruiter.",
        ],
      },
    ],
    faq: [
      {
        q: "How long should a CV be for the Kenyan market?",
        a: "Two pages is standard. Lead with your strongest, quantified achievements so a recruiter or an ATS picks them up immediately.",
      },
      {
        q: "Is a cover letter needed with a Kenyan CV?",
        a: "Often yes, especially for NGO and corporate roles. Your CV is the foundation; Sahan focuses on getting that right so the cover letter has something strong to point to.",
      },
    ],
    related: ["ngo-cv-template", "humanitarian-cv-template", "make-cv-on-phone"],
    cta: {
      title: "Build a CV for jobs in Kenya",
      body: "ATS-ready, achievement-led, and free. Download a recruiter-ready PDF in minutes.",
      href: "/signup?type=individual",
      label: "Start my CV",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "make-cv-on-phone",
    category: "cv",
    keyword: "how to make a CV on your phone",
    title: "How to Make a CV on Your Phone (Free, No App Needed)",
    h1: "How to make a professional CV on your phone",
    shortLabel: "Make a CV on your phone",
    metaDescription:
      "Make a professional CV on your phone for free — no app to install. Fill in a few fields, preview the PDF, and download. Works on any Android or iPhone.",
    intro: [
      "Most people in East Africa reach the internet through a phone, not a laptop — so the ability to build a real CV on a phone isn't a nice-to-have, it's the whole point. The problem is that most CV tools are built for a desktop and become unusable on a small screen.",
      "Sahan is built mobile-first. There's no app to install — it runs in your phone's browser. You fill in plain fields, preview the actual PDF on screen, and download. The whole thing takes minutes.",
    ],
    sections: [
      {
        heading: "Three steps, entirely on your phone",
        body: [
          "First, create a free account and fill in the basics — name, headline, a short summary. Then add your experience, education and skills, one simple field at a time; you can do it in one sitting or come back later, because everything saves as you go.",
          "Second, open the Templates screen and tap Preview. Sahan renders the real PDF right on your screen, so what you see is exactly what you'll download — pinch to zoom in and check the detail. Pick a colour theme if you want a different look.",
          "Third, tap Download. Your CV saves to your phone as a PDF you can attach to an email or a job-board application immediately.",
        ],
        bullets: [
          "No app to install — works in Chrome, Safari, any mobile browser",
          "Saves as you type, so you never lose work",
          "Real on-screen PDF preview before you download",
          "Re-download any time after you update your profile",
        ],
      },
      {
        heading: "Why phone-built doesn't mean lower quality",
        body: [
          "The CV Sahan produces is identical whether you built it on a phone or a laptop — the same A4, embedded-font, editorial templates. Building on a phone changes the input experience, not the output. Your finished CV looks like a designer made it.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need to install an app to make a CV on my phone?",
        a: "No. Sahan runs in your mobile browser. Just open the site, build your profile, and download — nothing to install.",
      },
      {
        q: "Will a CV made on a phone look professional?",
        a: "Yes. The output is the same A4, embedded-font PDF regardless of the device you built it on. Phone-built CVs are byte-for-byte identical to laptop-built ones.",
      },
      {
        q: "Can I update my CV later from my phone?",
        a: "Any time. Edit your profile and re-download — your CV regenerates with the changes instantly.",
      },
    ],
    related: ["cv-format-somalia", "humanitarian-cv-template", "ngo-cv-template"],
    cta: {
      title: "Make your CV on your phone now",
      body: "Free, no app, a few minutes. Build it and download a professional PDF.",
      href: "/signup?type=individual",
      label: "Start on my phone",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "company-profile-for-tender",
    category: "company",
    keyword: "company profile template for tender",
    title: "Company Profile Template for Tenders & Bids (Free)",
    h1: "A bid-ready company profile template for tenders",
    shortLabel: "Company profile · tenders",
    metaDescription:
      "Free, bid-ready company profile template for tenders and proposals. Cover, about, capability, selected projects and verified past performance — generated in minutes.",
    intro: [
      "When you bid for donor-funded or government work, your company profile is doing a specific job: convincing an evaluation panel that you can deliver and that your track record is real. A profile that looks like a brochure loses to one that reads like evidence.",
      "Sahan generates a structured, bid-ready company profile from data you enter once — cover, about, mission and vision, sectors and services, selected projects with values and clients, key personnel, and accreditations. Projects you've had verified carry a badge that confirms the work with the named client.",
    ],
    sections: [
      {
        heading: "What an evaluation panel scores",
        body: [
          "Tender evaluators score capability and past performance against the requirements in the document. Your profile should make that mapping obvious: clearly named sectors and services, and selected projects that state the client, value, dates and scope — the exact fields a panel needs to award technical points.",
          "Past performance is where bids are won or lost. A list of projects is good; projects whose delivery has been independently confirmed with the client is far stronger. Sahan's per-project verification turns a claim into evidence, which is precisely what a sceptical panel is looking for.",
        ],
        bullets: [
          "Sectors and services mapped to the tender requirements",
          "Selected projects: client, value, dates, scope",
          "Verified past performance where you can get it",
          "Key personnel with relevant, named experience",
          "Registration, accreditations (ISO, FIDIC) and certifications",
        ],
      },
      {
        heading: "Reusable across every bid",
        body: [
          "You maintain one company profile and regenerate it whenever a new tender opens — updating selected projects to match the opportunity. Because it's structured data, not a hand-built document, keeping it current takes minutes instead of an afternoon in a word processor.",
        ],
      },
    ],
    checklist: {
      title: "Tender-ready company profile checklist",
      items: [
        "Legal name, registration number and country",
        "About, mission and vision",
        "Sectors and core services",
        "Selected projects with client, value, dates and scope",
        "Verified past performance on your strongest projects",
        "Key personnel and reporting structure",
        "Accreditations: ISO, FIDIC, sector certifications",
      ],
    },
    faq: [
      {
        q: "What should a company profile for a tender include?",
        a: "Company registration, an about/mission section, sectors and services, selected projects with client, value, dates and scope, key personnel, and accreditations. Sahan structures all of these and generates a bid-ready PDF.",
      },
      {
        q: "How does verified past performance help a bid?",
        a: "Evaluation panels award the most points to a track record they can trust. A project verified with the named client reads as evidence rather than a claim, which strengthens the past-performance section of any bid.",
      },
    ],
    related: ["construction-company-profile", "ngo-organizational-profile", "consultancy-company-profile"],
    cta: {
      title: "Build your bid-ready company profile",
      body: "One profile, reusable for every tender. Generate a professional PDF in minutes — free.",
      href: "/signup?type=company",
      label: "Create company profile",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "construction-company-profile",
    category: "company",
    keyword: "construction company profile template",
    title: "Construction Company Profile Template (Free)",
    h1: "Construction & engineering company profile template",
    shortLabel: "Construction profile",
    metaDescription:
      "Free construction and engineering company profile template — registration, capability, selected projects with values, key engineers and accreditations. Bid-ready PDF.",
    intro: [
      "For a construction or civil-engineering firm, the company profile is a procurement document first and a marketing one second. Clients and donors awarding infrastructure work want to see registration, financial and technical capacity, a credible project record with values, and the qualifications of your key engineers.",
      "Sahan produces exactly that — a clean, structured profile that puts your delivery record and your people front and centre, with optional verification on the projects that matter most.",
    ],
    sections: [
      {
        heading: "Lead with your project record",
        body: [
          "Infrastructure clients buy proven delivery. Each selected project should state the client or donor, the contract value, the years, and a concise scope — \"47 km of feeder roads, community-employment model, 312 jobs\" tells a panel more than a paragraph of adjectives.",
          "Where you can, get your flagship projects verified with the client. In a sector where claimed track records are routinely inflated, a confirmed one stands out and de-risks the award decision for the client.",
        ],
      },
      {
        heading: "Show technical capacity and accreditations",
        body: [
          "List your key engineers and their disciplines, and include accreditations that signal quality and compliance — ISO 9001, FIDIC membership, and any national registration body. These are often mandatory eligibility criteria, so making them easy to find matters.",
        ],
      },
    ],
    checklist: {
      title: "Construction company profile checklist",
      items: [
        "Company registration and country of incorporation",
        "Sectors: roads, water, buildings, energy, etc.",
        "Selected projects with client, value, years and scope",
        "Verified flagship projects",
        "Key engineers and disciplines",
        "ISO 9001, FIDIC and national registrations",
      ],
    },
    faq: [
      {
        q: "What goes in a construction company profile?",
        a: "Registration, sectors and services, a selected-projects record with client, value, years and scope, key engineering personnel, and accreditations such as ISO 9001 and FIDIC membership. Sahan structures all of these.",
      },
      {
        q: "Can I show project values and clients?",
        a: "Yes. Each project carries fields for client, value, currency, year range and scope, and the strongest projects can be verified with the named client.",
      },
    ],
    related: ["company-profile-for-tender", "consultancy-company-profile", "ngo-organizational-profile"],
    cta: {
      title: "Build your construction company profile",
      body: "Put your project record and engineers in a clean, bid-ready PDF — free.",
      href: "/signup?type=company",
      label: "Create company profile",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "ngo-organizational-profile",
    category: "company",
    keyword: "NGO organizational profile template",
    title: "NGO Organizational Profile / Capacity Statement (Free)",
    h1: "NGO organizational profile & capacity statement template",
    shortLabel: "NGO org profile",
    metaDescription:
      "Free NGO organizational profile and capacity statement template — mission, sectors, projects, donors and key staff. Built for grant applications and partnerships.",
    intro: [
      "National and local NGOs are asked for an organizational profile — sometimes called a capacity statement — at almost every stage of funding: due diligence, partnership vetting, and grant applications. Donors use it to judge whether your organisation can absorb and account for funding responsibly.",
      "Sahan helps you maintain a single, structured organizational profile you can generate on demand: who you are, the sectors you work in, your project and donor record, and your key staff.",
    ],
    sections: [
      {
        heading: "What donors check in a capacity statement",
        body: [
          "Donor due-diligence teams look for a clear mission, demonstrated experience in the relevant sector and geography, a track record of managing grants, and a governance and staffing structure that shows you can deliver. Your profile should make each of these easy to find.",
          "Naming your past donors and the value of work delivered builds confidence — it shows others have already trusted you with funding and you've accounted for it. Verified projects strengthen this further.",
        ],
      },
      {
        heading: "Keep it current for every application",
        body: [
          "Because applications come on their own timelines, the organisations that move fastest are the ones whose profile is always up to date. Maintaining it as structured data in Sahan means a fresh, accurate PDF is one tap away whenever a call for proposals opens.",
        ],
      },
    ],
    checklist: {
      title: "NGO capacity statement checklist",
      items: [
        "Registration and legal status",
        "Mission, vision and thematic sectors",
        "Geographic coverage",
        "Project record with donors and values",
        "Key staff and governance structure",
        "Relevant certifications and compliance",
      ],
    },
    faq: [
      {
        q: "What is an organizational capacity statement?",
        a: "A concise document donors use to assess whether your NGO can deliver and account for funding — covering mission, sector experience, project and donor track record, and staffing. Sahan generates one from your structured profile.",
      },
      {
        q: "How is this different from a company profile?",
        a: "It's the same structured profile, framed for grant and partnership contexts. Sahan's company profile templates work for both NGOs and firms; you control which sections and clients are shown.",
      },
    ],
    related: ["company-profile-for-tender", "construction-company-profile", "consultancy-company-profile"],
    cta: {
      title: "Build your NGO organizational profile",
      body: "Always-current, donor-ready, and free. Generate your capacity statement in minutes.",
      href: "/signup?type=company",
      label: "Create org profile",
    },
    updated: UPDATED,
  },

  // ─────────────────────────────────────────────────────────────────
  {
    slug: "consultancy-company-profile",
    category: "company",
    keyword: "consultancy company profile sample",
    title: "Consultancy Company Profile Sample & Template (Free)",
    h1: "Consultancy company profile sample and template",
    shortLabel: "Consultancy profile",
    metaDescription:
      "Free consultancy company profile template and sample — expertise, methodology, selected assignments and consultant CVs. Built to win advisory and research work.",
    intro: [
      "A consultancy sells expertise and a track record of assignments, so its profile has to do something subtly different from a contractor's: convince a client that your team's thinking and method will produce a reliable result. That means foregrounding your areas of expertise, your approach, and the specific assignments that prove it.",
      "Sahan structures a consultancy profile around exactly those elements, and lets you attach verified assignments so your strongest references carry confirmed weight.",
    ],
    sections: [
      {
        heading: "Expertise, method and assignments",
        body: [
          "Open with the sectors and services you advise on, stated precisely — \"institutional capacity assessment\", \"public expenditure review\", \"WASH feasibility studies\" — rather than broad labels. Then let your selected assignments do the proving: client, value, year, and a one-line scope that shows the deliverable.",
          "For research and advisory work especially, the credibility of named consultants matters. List your key personnel with their disciplines, and where an individual's experience can be verified, that verification reinforces the whole bid.",
        ],
      },
      {
        heading: "Reuse and tailor per proposal",
        body: [
          "Consultancies bid often, and each proposal wants a slightly different cut of your record. Maintaining the profile as structured data means you can foreground the assignments most relevant to each call without rebuilding the document each time.",
        ],
      },
    ],
    faq: [
      {
        q: "What should a consultancy company profile include?",
        a: "Precise areas of expertise and services, a selected-assignments record with client, value and scope, key consultants with their disciplines, and accreditations. Sahan structures all of these into a clean PDF.",
      },
      {
        q: "Can individual consultants show verified experience?",
        a: "Yes. Both individuals and firms can request verification of specific experience or assignments, which then carries a confirmed badge on the profile and any generated document.",
      },
    ],
    related: ["company-profile-for-tender", "ngo-organizational-profile", "construction-company-profile"],
    cta: {
      title: "Build your consultancy profile",
      body: "Lead with expertise and proven assignments. Generate a polished PDF in minutes — free.",
      href: "/signup?type=company",
      label: "Create consultancy profile",
    },
    updated: UPDATED,
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function relatedGuides(slug: string): Guide[] {
  const g = getGuide(slug);
  if (!g) return [];
  return g.related.map(getGuide).filter((x): x is Guide => Boolean(x));
}
