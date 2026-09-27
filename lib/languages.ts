// Languages live on individual_details.languages (text[]), one string per
// language. Structure is encoded in the string so older free-text entries
// ("Somali (native)", "Arabic(basic)", "Dari — Fluent") keep working
// everywhere with no migration:
//
//   "Kiswahili"
//   "Somali (Mother tongue; Reading: Fluent, Writing: Fluent, Speaking: Native)"
//   "English (Reading: Fluent, Writing: Professional, Speaking: Fluent)"
//   "Arabic (Fluent)"                      ← older overall-only entry
//
// Reading, writing and speaking are each rated on one five-step scale, all
// optional. Client-safe (no server imports).

export const LEVEL_WORDS = ["Basic", "Conversational", "Professional", "Fluent", "Native"] as const;
export type Level = 0 | 1 | 2 | 3 | 4 | 5;            // 0 = not rated
export const LANGUAGE_SKILLS = ["reading", "writing", "speaking"] as const;
export type LanguageSkill = (typeof LANGUAGE_SKILLS)[number];
export const SKILL_LABEL: Record<LanguageSkill, string> = { reading: "Reading", writing: "Writing", speaking: "Speaking" };
export const SKILL_SHORT: Record<LanguageSkill, string> = { reading: "Read", writing: "Write", speaking: "Speak" };

/** What each step means, shown under the picker so people rate honestly. */
export const LEVEL_HINTS: Record<LanguageSkill, readonly string[]> = {
  reading: ["Signs, forms and short notes", "Everyday emails and messages", "Reports and contracts, comfortably", "Dense technical documents with ease", "First language"],
  writing: ["Short notes and simple forms", "Everyday emails and messages", "Reports and minutes, with some editing", "Polished technical writing", "First language"],
  speaking: ["Greetings and simple exchanges", "Everyday conversation", "Meetings and site discussions", "Negotiation and presentations", "First language"],
};

export interface LanguageEntry {
  name: string;
  /** First language. */
  mother: boolean;
  reading: Level;
  writing: Level;
  speaking: Level;
  /** An older overall level we couldn't map ("C2", "Professional working
   *  proficiency"); shown as the summary until the member rates skills. */
  note: string;
}

/** Most-used languages for members in the Horn and East Africa, first in
 *  the picker; the rest follow alphabetically. No parentheses in names, as
 *  they would clash with the level part of the stored string. */
export const REGIONAL_LANGUAGES = [
  "Somali", "English", "Arabic", "Kiswahili", "Amharic", "Afaan Oromo", "Tigrinya", "French", "Italian",
];
export const OTHER_LANGUAGES = [
  "Afar", "Bengali", "Dari", "Dutch", "German", "Hausa", "Hindi", "Indonesian", "Japanese",
  "Kinyarwanda", "Korean", "Lingala", "Luganda", "Malay", "Mandarin Chinese", "Pashto", "Persian",
  "Portuguese", "Russian", "Spanish", "Tigre", "Turkish", "Urdu", "Wolof", "Yoruba",
];

// Spellings members have actually typed, mapped to the list's name.
const ALIASES: Record<string, string> = {
  somalia: "Somali", soomali: "Somali", soomaali: "Somali", soomalia: "Somali", "af-soomaali": "Somali",
  swahili: "Kiswahili", swhili: "Kiswahili", oromo: "Afaan Oromo", oromic: "Afaan Oromo", oromiffa: "Afaan Oromo",
  farsi: "Persian", chinese: "Mandarin Chinese", mandarin: "Mandarin Chinese",
};

/** The picker's spelling of a language, or null if it isn't in the list. */
export function canonicalLanguage(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (ALIASES[key]) return ALIASES[key];
  return [...REGIONAL_LANGUAGES, ...OTHER_LANGUAGES].find((l) => l.toLowerCase() === key) ?? null;
}

export function emptyLanguage(name = ""): LanguageEntry {
  return { name, mother: false, reading: 0, writing: 0, speaking: 0, note: "" };
}

// Words from this scale and from the earlier picker (Native, Fluent,
// Advanced, Intermediate, Beginner), plus common typed ones.
const WORD_TO_LEVEL: Record<string, Level> = {
  basic: 1, beginner: 1, elementary: 1,
  conversational: 2, intermediate: 2,
  professional: 3, advanced: 3, good: 3,
  fluent: 4, "very good": 4, excellent: 4,
  native: 5,
};

export function levelWord(n: Level): string {
  return n ? LEVEL_WORDS[n - 1] : "";
}

/** Strip characters that would break the stored format. */
export function cleanLanguageName(s: string): string {
  return s.replace(/[()[\];]/g, " ").replace(/\s[—–-]\s/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function parseLanguage(raw: string): LanguageEntry {
  const s = raw.trim().replace(/[,;]+$/, "");
  let name = s;
  let inner = "";
  const paren = /^(.*?)\s*[([（]\s*(.+?)\s*[)\]）]\s*$/.exec(s);
  const dash = /^(.*?)\s+[—–-]\s+(.+)$/.exec(s);
  if (paren) { name = paren[1]; inner = paren[2]; }
  else if (dash) { name = dash[1]; inner = dash[2]; }

  const e = emptyLanguage(name.trim());
  let overall: Level = 0;
  for (const part of inner.split(";").map((p) => p.trim()).filter(Boolean)) {
    const pairs = part.split(",").map((p) => /^(reading|writing|speaking)\s*:\s*(.+)$/i.exec(p.trim()));
    if (pairs.every(Boolean)) {
      for (const m of pairs) {
        const lvl = WORD_TO_LEVEL[m![2].trim().toLowerCase()];
        if (lvl) e[m![1].toLowerCase() as LanguageSkill] = lvl;
      }
      continue;
    }
    const word = part.toLowerCase().replace(/[.,]+$/, "");
    if (word === "mother tongue" || word === "first language") { e.mother = true; continue; }
    if (word === "native") { e.mother = true; overall = 5; continue; }
    if (!e.note && !overall) {
      if (WORD_TO_LEVEL[word]) { overall = WORD_TO_LEVEL[word]; e.note = levelWord(overall); }
      else e.note = part.charAt(0).toUpperCase() + part.slice(1);
    }
  }
  // The previous picker stored an overall level plus only the skills that
  // differed ("English (Fluent; Writing: Advanced)"): the overall applies to
  // the rest. An overall on its own stays a summary; we don't invent ratings.
  if (overall && hasRatings(e)) {
    for (const k of LANGUAGE_SKILLS) if (!e[k]) e[k] = overall;
    e.note = "";
  }
  return e;
}

export function hasRatings(e: LanguageEntry): boolean {
  return LANGUAGE_SKILLS.some((k) => e[k] > 0);
}

export function formatLanguage(e: LanguageEntry): string {
  const name = cleanLanguageName(e.name);
  const skills = LANGUAGE_SKILLS.filter((k) => e[k]).map((k) => `${SKILL_LABEL[k]}: ${levelWord(e[k])}`).join(", ");
  // An old overall note only survives until the member rates skills.
  const parts = [e.mother ? "Mother tongue" : "", skills ? "" : e.note, skills].filter(Boolean);
  return parts.length ? `${name} (${parts.join("; ")})` : name;
}

/** One word for the language: "Mother tongue", else the middle of the
 *  rated skills (so one weak or strong skill doesn't set the headline),
 *  else an older overall level. */
export function languageSummary(e: LanguageEntry): string {
  if (e.mother) return "Mother tongue";
  const rated = LANGUAGE_SKILLS.map((k) => e[k]).filter((n) => n > 0).sort((a, b) => a - b);
  if (rated.length) return levelWord(rated[Math.floor((rated.length - 1) / 2)] as Level);
  return e.note;
}

/** For the CVs: the name, the summary, and a short second line for any
 *  skill rated differently from the summary. */
export function describeLanguage(raw: string): { name: string; level: string; detail: string } {
  const e = parseLanguage(raw);
  const level = languageSummary(e);
  const headline = e.mother ? "Native" : level;
  const detail = LANGUAGE_SKILLS
    .filter((k) => e[k] && levelWord(e[k]) !== headline)
    // Non-breaking space keeps "Writing: Fluent" together in narrow CV
    // sidebars; lines break only between pairs.
    .map((k) => `${SKILL_LABEL[k]}: ${levelWord(e[k])}`)
    .join(" · ");
  return { name: e.name, level, detail };
}
