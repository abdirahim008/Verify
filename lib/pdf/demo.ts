import type { CVData } from "./data";
import type { CompanyData } from "./company-data";
import { portraitWoman, portraitMan, companyLogo, projectScene, clientLogo } from "./demo-art";

// Demo profiles for the template previews (scripts/render-thumbnails.mjs).
// Every person, company and client here is fictional; emails use the
// reserved example.com / .example domains. Not imported by the app itself.

export function demoCV(): CVData {
  return {
    fullName: "Amina Warsame Hassan",
    headline: "Senior WASH Programme Officer",
    summary:
      "WASH programme officer with nine years of experience delivering water, sanitation and hygiene projects across Somalia. " +
      "Leads multi-donor projects from assessment to handover, manages field teams and contractors, and reports to UN and INGO partners.",
    location: "Mogadishu, Somalia",
    email: "amina.hassan@example.com",
    phone: "+252 61 555 0142",
    photoUrl: portraitWoman(),
    languages: [
      "Somali (Mother tongue; Reading: Fluent, Writing: Fluent, Speaking: Native)",
      "English (Reading: Fluent, Writing: Fluent, Speaking: Fluent)",
      "Arabic (Reading: Professional, Writing: Conversational, Speaking: Conversational)",
      "Kiswahili (Speaking: Basic)",
    ],
    skills: [
      "WASH programme design", "Borehole rehabilitation", "Hygiene promotion", "Budget management",
      "KoboToolbox", "Donor reporting", "Contractor supervision", "Community engagement",
    ],
    experiences: [
      {
        title: "Senior WASH Programme Officer", organization: "Coastal Water Trust", location: "Mogadishu",
        dateRange: "Mar 2022 – Present", verified: false, verifiedNote: "",
        description:
          "Lead a USD 2.4M water access programme serving 60,000 people in Banadir and Lower Shabelle • " +
          "Manage a team of 14 engineers and hygiene promoters across five districts • " +
          "Rehabilitated 22 boreholes and 9 water kiosks, cutting water costs for households by 40% • " +
          "Prepare quarterly donor reports and lead joint monitoring visits with partners",
      },
      {
        title: "WASH Officer", organization: "Juba Health Network", location: "Kismayo",
        dateRange: "Jan 2019 – Feb 2022", verified: false, verifiedNote: "",
        description:
          "Coordinated emergency water trucking and latrine construction for 12 IDP sites • " +
          "Trained 45 community hygiene volunteers on cholera prevention • " +
          "Introduced mobile data collection with KoboToolbox, halving reporting time",
      },
      {
        title: "Assistant Project Engineer", organization: "Horn Build & Water Services", location: "Garowe",
        dateRange: "Jun 2016 – Dec 2018", verified: false, verifiedNote: "",
        description:
          "Supervised construction of water points and school sanitation blocks • " +
          "Prepared bills of quantities and checked contractor payments against progress",
      },
    ],
    educations: [
      {
        qualification: "Master's degree", institution: "University of Nairobi", field: "Water Resources Management",
        title: "Master's degree in Water Resources Management", dateRange: "2020 – 2022", verified: false, verifiedNote: "",
      },
      {
        qualification: "Bachelor's degree", institution: "Somali National University", field: "Civil Engineering",
        title: "BSc Civil Engineering", dateRange: "2012 – 2016", verified: false, verifiedNote: "",
      },
    ],
    certifications: [
      { name: "Project Management Professional (PMP)", issuer: "PMI", year: "2023", verified: false, verifiedNote: "" },
      { name: "WASH in Emergencies", issuer: "RedR UK", year: "2020", verified: false, verifiedNote: "" },
    ],
    referees: [
      { name: "Dr. Hodan Ali Nur", position: "Country Director", organization: "Coastal Water Trust", email: "h.nur@example.com", phone: "+252 61 555 0101" },
      { name: "Mohamed Abdi Jama", position: "Programme Manager", organization: "Juba Health Network", email: "m.jama@example.com", phone: "+254 700 555 214" },
    ],
    year: new Date().getFullYear(),
  };
}

const SERVICES = [
  { name: "Water supply systems", description: "Borehole drilling and rehabilitation, solar pumping, elevated tanks and piped networks." },
  { name: "Sanitation facilities", description: "School and clinic latrine blocks, handwashing stations and waste management." },
  { name: "Rural roads", description: "Road rehabilitation, culverts, drifts and small bridges for all-season access." },
  { name: "Public buildings", description: "Classrooms, health posts and offices built to donor and ministry standards." },
  { name: "Engineering design", description: "Surveys, drawings, bills of quantities and environmental screening." },
  { name: "Construction supervision", description: "Independent site supervision, quality control and progress reporting." },
];

export function demoCompany(): CompanyData {
  const clientsFull = [
    { name: "Coastal Water Trust", logoUrl: clientLogo("Coastal Water Trust", "#1f6fa8", "circle") },
    { name: "Juba Health Network", logoUrl: clientLogo("Juba Health Network", "#b0473a", "diamond") },
    { name: "Gedo Growth Fund", logoUrl: clientLogo("Gedo Growth Fund", "#4f7d3a", "bars") },
    { name: "Hiran Schools Alliance", logoUrl: clientLogo("Hiran Schools Alliance", "#7a4f9a", "circle") },
    { name: "Shabelle Farmers Cooperative", logoUrl: clientLogo("Shabelle Farmers Co-op", "#c07a1d", "bars") },
    { name: "Coastal Roads Authority", logoUrl: clientLogo("Coastal Roads Authority", "#2f4858", "diamond") },
  ];
  return {
    name: "Horn Build & Water Services Ltd.",
    tagline: "Water, roads and public buildings across Somalia",
    coverStatement: "Building the water, road and school infrastructure that communities rely on, on time and to international standards.",
    logoUrl: companyLogo(),
    about:
      "Horn Build & Water Services is a Somali-owned engineering and construction firm founded in 2014. We design and build water systems, " +
      "rural roads and public buildings for development partners, government bodies and communities. Our 140 staff work from offices in " +
      "Mogadishu, Kismayo and Garowe, and every project is delivered with local labour and supervised by qualified engineers.",
    mission: "To deliver durable, well-built infrastructure that improves daily life for Somali communities.",
    vision: "A Somalia where every community has safe water, passable roads and decent schools.",
    country: "Somalia",
    registrationNumber: "BRN-2014-0827",
    foundedYear: "2014",
    website: "www.hornbuild.example",
    email: "info@hornbuild.example",
    phone: "+252 61 555 0190",
    locations: ["Mogadishu", "Kismayo", "Garowe"],
    staffCount: "140",
    countriesCount: "3",
    projectsCount: "85",
    sectors: ["Water & sanitation", "Construction", "Roads & infrastructure", "Education facilities"],
    services: SERVICES.map((x) => x.name),
    servicesFull: SERVICES,
    values: [
      { name: "Quality", description: "Every structure is checked by a qualified engineer before handover." },
      { name: "Safety", description: "Zero-harm sites, with trained supervisors and protective equipment for all workers." },
      { name: "Local first", description: "We hire and train labour from the communities we build in." },
      { name: "Integrity", description: "Transparent costs, honest reporting and no shortcuts." },
    ],
    projects: [
      {
        name: "Afgooye Water Supply Rehabilitation", client: "Coastal Water Trust", sector: "Water & sanitation",
        value: "$1.2M", valueAmount: 1_200_000, yearRange: "2023 – 2024", yearStart: 2023, yearEnd: 2024,
        scope: "Rehabilitated 12 boreholes with solar pumping and built 18 km of pipeline serving 35,000 residents.",
        media: [{ url: projectScene("water"), caption: "Elevated tank and distribution line, Afgooye" }],
        verified: false, verifiedNote: "",
      },
      {
        name: "Beledweyne Primary Schools Programme", client: "Hiran Schools Alliance", sector: "Education facilities",
        value: "$850K", valueAmount: 850_000, yearRange: "2022 – 2023", yearStart: 2022, yearEnd: 2023,
        scope: "Built 24 classrooms, 6 sanitation blocks and boundary walls across four primary schools.",
        media: [{ url: projectScene("school"), caption: "New classroom block, Beledweyne" }],
        verified: false, verifiedNote: "",
      },
      {
        name: "Kismayo–Jamaame Feeder Road", client: "Coastal Roads Authority", sector: "Roads & infrastructure",
        value: "$2.1M", valueAmount: 2_100_000, yearRange: "2021 – 2023", yearStart: 2021, yearEnd: 2023,
        scope: "Rehabilitated 42 km of gravel road with 16 culverts and two drifts for all-season access.",
        media: [{ url: projectScene("road"), caption: "Completed section near Jamaame" }],
        verified: false, verifiedNote: "",
      },
      {
        name: "Baidoa Health Post Construction", client: "Juba Health Network", sector: "Construction",
        value: "$420K", valueAmount: 420_000, yearRange: "2022", yearStart: 2022, yearEnd: 2022,
        scope: "Designed and built three health posts with solar power, water storage and staff housing.",
        media: [], verified: false, verifiedNote: "",
      },
      {
        name: "Shabelle Irrigation Canals", client: "Shabelle Farmers Cooperative", sector: "Water & sanitation",
        value: "$640K", valueAmount: 640_000, yearRange: "2020 – 2021", yearStart: 2020, yearEnd: 2021,
        scope: "Desilted 30 km of irrigation canals and built 11 gated intakes for 1,800 farming households.",
        media: [], verified: false, verifiedNote: "",
      },
    ],
    clients: clientsFull.map((c) => c.name),
    clientsFull,
    clientGroups: [
      { category: "Development partners", clients: clientsFull.slice(0, 3) },
      { category: "Public bodies", clients: [clientsFull[5]] },
      { category: "Community organisations", clients: [clientsFull[3], clientsFull[4]] },
    ],
    team: [
      { id: "t1", name: "Abdullahi Yusuf Farah", role: "Managing Director", reportsTo: null, units: [] },
      { id: "t2", name: "Eng. Faadumo Osman Ali", role: "Head of Engineering", reportsTo: "t1", units: ["Design", "Site supervision"] },
      { id: "t3", name: "Hassan Mohamud Nur", role: "Head of Operations", reportsTo: "t1", units: ["Procurement", "Logistics"] },
      { id: "t4", name: "Sahra Ahmed Warsame", role: "Finance Manager", reportsTo: "t1", units: ["Accounts", "Payroll"] },
    ],
    boardName: "Board of Directors",
    ceo: {
      name: "Abdullahi Yusuf Farah",
      title: "Managing Director",
      photoUrl: portraitMan(),
      quote: "We build things that communities will still be using in thirty years.",
      message:
        "When we started Horn Build in 2014, we were six engineers with one pickup truck. Today we are 140 people, and our work reaches " +
        "hundreds of thousands of Somalis every day through the water points, roads and schools we have built.\n\n" +
        "Our clients choose us because we finish what we start. We plan carefully, hire locally, and put a qualified engineer on every site. " +
        "Thank you for considering us as your partner.",
    },
    certifications: [
      { name: "ISO 9001:2015 Quality Management", issuer: "Bureau Example", year: "2023", verified: false, verifiedNote: "" },
      { name: "Grade A Civil Works Contractor", issuer: "Public Works Licensing Board", year: "2022", verified: false, verifiedNote: "" },
      { name: "Occupational Health & Safety", issuer: "Safety Council Example", year: "2021", verified: false, verifiedNote: "" },
    ],
    year: new Date().getFullYear(),
  };
}
