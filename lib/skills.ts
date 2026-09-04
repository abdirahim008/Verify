// Curated skill suggestions for the profile builder's skills autocomplete.
// Weighted toward the East Africa / Somalia humanitarian, development and
// professional sector — the terms an NGO recruiter or tender evaluator
// actually scans for — plus the general professional and technical skills
// most members will also need.
//
// Free-add stays open: the suggestions steer wording toward a consistent
// vocabulary (so "M&E" and "Monitoring & Evaluation" don't fragment) without
// blocking anything a member wants to type. An admin-managed list can replace
// this later without touching the form. Pure module — safe to import anywhere.
export const SKILL_SUGGESTIONS: string[] = [
  // --- Humanitarian & programme management ---
  "Programme Management", "Project Management", "Project Cycle Management",
  "Humanitarian Response", "Emergency Response", "Rapid Needs Assessment",
  "Needs Assessment", "Humanitarian Coordination", "Cluster Coordination",
  "Humanitarian Access Negotiation", "Protection Mainstreaming",
  "Accountability to Affected Populations (AAP)", "Do No Harm",
  "Core Humanitarian Standard (CHS)", "Sphere Standards",
  "Disaster Risk Reduction", "Early Warning Systems", "Drought Response",
  "Flood Response", "Displacement & IDP Programming", "Camp Coordination (CCCM)",
  "Durable Solutions", "Resilience Programming", "Livelihoods Programming",
  "Cash & Voucher Assistance", "Cash Transfer Programming",
  "Market Assessment", "Food Security & Livelihoods (FSL)",
  "Nutrition Programming", "CMAM", "Infant & Young Child Feeding (IYCF)",
  "WASH", "Water Supply", "Sanitation & Hygiene Promotion", "Borehole Management",
  "Shelter & NFI", "Education in Emergencies", "Child Protection",
  "Gender-Based Violence (GBV) Programming", "Case Management",
  "Psychosocial Support (MHPSS)", "Mine Action Awareness",
  "Peacebuilding", "Conflict Analysis", "Conflict Sensitivity",
  "Social Cohesion", "Community Mobilisation", "Community Engagement",
  "Beneficiary Registration", "Post-Distribution Monitoring",

  // --- M&E, research & data ---
  "Monitoring & Evaluation (M&E)", "MEAL", "Third-Party Monitoring",
  "Indicator Development", "Logical Framework (Logframe)", "Theory of Change",
  "Results-Based Management", "Baseline & Endline Surveys",
  "Impact Evaluation", "Quantitative Research", "Qualitative Research",
  "Focus Group Discussions", "Key Informant Interviews", "Survey Design",
  "Data Collection", "Mobile Data Collection", "KoBo Toolbox", "ODK",
  "SurveyCTO", "Data Analysis", "Data Cleaning", "Data Visualisation",
  "Statistical Analysis", "SPSS", "Stata", "R", "Python", "SQL", "Power BI",
  "Tableau", "Advanced Excel", "GIS", "QGIS", "ArcGIS", "Remote Sensing",
  "Cartography", "Information Management", "Reporting & Documentation",

  // --- Grants, donors & compliance ---
  "Proposal Writing", "Grant Writing", "Concept Note Development",
  "Donor Reporting", "Grant Management", "Bid & Tender Preparation",
  "Business Development", "Partnership Development", "Consortium Management",
  "Sub-Grantee Management", "Due Diligence", "Donor Compliance",
  "USAID/BHA Compliance", "ECHO Compliance", "FCDO Compliance",
  "UN Agency Reporting", "World Bank Procedures", "Contract Management",
  "Risk Management", "Fraud Prevention", "Safeguarding", "PSEA",
  "Anti-Money Laundering", "Internal Audit", "External Audit Preparation",

  // --- Finance, admin & operations ---
  "Financial Management", "Budgeting & Forecasting", "Budget Monitoring",
  "Financial Reporting", "IFRS", "Bookkeeping", "Accounting", "Payroll",
  "Cash Flow Management", "Cost Analysis", "QuickBooks", "Sage", "SAP",
  "Procurement", "Public Procurement", "Supply Chain Management", "Logistics",
  "Warehouse Management", "Fleet Management", "Inventory Management",
  "Asset Management", "Import & Customs Clearance", "Office Administration",

  // --- People & leadership ---
  "Team Leadership", "Staff Supervision", "Human Resource Management",
  "Recruitment & Selection", "Performance Management", "Capacity Building",
  "Training & Facilitation", "Training of Trainers (ToT)", "Coaching & Mentoring",
  "Organisational Development", "Change Management", "Strategic Planning",
  "Stakeholder Management", "Government Liaison", "Negotiation",
  "Public Speaking", "Cross-Cultural Communication", "Remote Team Management",
  "Volunteer Management", "Conflict Resolution",

  // --- Health ---
  "Public Health", "Primary Health Care", "Epidemiology", "Disease Surveillance",
  "Outbreak Response", "Immunisation Campaigns", "Maternal & Child Health",
  "Reproductive Health", "Health Systems Strengthening", "Clinical Practice",
  "Nursing", "Midwifery", "Pharmacy", "Laboratory Services", "Health Education",
  "Community Health Workers", "Health Information Systems (DHIS2)",
  "Infection Prevention & Control", "Nutrition Surveys (SMART)",

  // --- Engineering, construction & technical ---
  "Civil Engineering", "Structural Engineering", "Site Supervision",
  "Construction Management", "Quantity Surveying", "Bill of Quantities (BoQ)",
  "AutoCAD", "Civil 3D", "Revit", "SketchUp", "Structural Design",
  "Road Design", "Hydrology", "Water Resource Management", "Solar Installation",
  "Electrical Engineering", "Mechanical Engineering", "Surveying",
  "Quality Assurance", "Environmental Impact Assessment", "Feasibility Studies",

  // --- Agriculture & environment ---
  "Agronomy", "Agricultural Extension", "Livestock & Pastoralism",
  "Veterinary Services", "Fisheries", "Irrigation Management",
  "Climate Change Adaptation", "Natural Resource Management",
  "Environmental Management", "Renewable Energy", "Value Chain Development",

  // --- Digital, media & design ---
  "Communications", "Strategic Communications", "Media Relations",
  "Content Writing", "Copywriting", "Editing & Proofreading", "Translation",
  "Social Media Management", "Digital Marketing", "Graphic Design",
  "Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Canva",
  "Photography", "Videography", "Video Editing", "Web Development",
  "JavaScript", "TypeScript", "React", "Node.js", "PHP", "WordPress",
  "Mobile App Development", "Database Administration", "IT Support",
  "Network Administration", "Cybersecurity", "Cloud Computing",
  "Microsoft Office", "Google Workspace",

  // --- Legal, policy & governance ---
  "Legal Research", "Contract Drafting", "Corporate Governance",
  "Policy Analysis", "Policy Development", "Advocacy", "Public Administration",
  "Local Governance", "Electoral Support", "Human Rights", "Rule of Law",
  "Refugee Law", "International Humanitarian Law", "Compliance",

  // --- Business & finance sector ---
  "Business Analysis", "Financial Analysis", "Investment Analysis", "Banking",
  "Islamic Finance", "Microfinance", "Mobile Money", "Insurance",
  "Customer Service", "Sales", "Market Research", "Entrepreneurship",
  "Small Business Development", "Feasibility Analysis",

  // --- Languages of work ---
  "Somali", "Arabic", "English", "Swahili", "Amharic", "Oromo", "French",
  "Turkish", "Italian",
];

/**
 * Rank suggestions for what the member has typed: prefix matches first, then
 * matches starting at a word boundary ("evaluation" → "Monitoring &
 * Evaluation"), then anything else containing the query. Already-added skills
 * are dropped so the list never offers a duplicate.
 */
export function rankSkills(
  query: string,
  exclude: ReadonlySet<string>,
  limit = 8,
): string[] {
  const q = query.trim().toLowerCase();
  const available = SKILL_SUGGESTIONS.filter((s) => !exclude.has(s.toLowerCase()));
  if (!q) return available.slice(0, limit);

  const prefix: string[] = [];
  const wordStart: string[] = [];
  const contains: string[] = [];
  for (const s of available) {
    const i = s.toLowerCase().indexOf(q);
    if (i < 0) continue;
    if (i === 0) prefix.push(s);
    else if (/[^a-z0-9]/i.test(s[i - 1])) wordStart.push(s);
    else contains.push(s);
  }
  return [...prefix, ...wordStart, ...contains].slice(0, limit);
}
