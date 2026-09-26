// Languages live on individual_details.languages (text[]), one string per
// language. Structure is encoded in the string so older free-text entries
// ("Somali (native)", "Arabic(basic)", "Dari — Fluent") keep working
// everywhere with no migration:
//
//   "English"
//   "English (Fluent)"
//   "English (Fluent; Speaking: Fluent, Reading: Advanced, Writing: Beginner)"
//   "Somali (Speaking: Native, Writing: Intermediate)"
//
// Every part except the name is optional. Client-safe (no server imports).

export const LANGUAGE_LEVELS = ["Native", "Fluent", "Advanced", "Intermediate", "Beginner"] as const;
export const LANGUAGE_SKILLS = ["speaking", "reading", "writing"] as const;
export type LanguageSkill = (typeof LANGUAGE_SKILLS)[number];

export interface LanguageEntry {
  name: string;
  level: string;
  speaking: string;
  reading: string;
  writing: string;
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

const SKILL_LABEL: Record<LanguageSkill, string> = { speaking: "Speaking", reading: "Reading", writing: "Writing" };

export function emptyLanguage(name = ""): LanguageEntry {
  return { name, level: "", speaking: "", reading: "", writing: "" };
}

/** A known level in canonical case, or the text as typed (first letter up). */
function normLevel(s: string): string {
  const t = s.trim().replace(/[.,;]+$/, "");
  if (!t) return "";
  const known = LANGUAGE_LEVELS.find((l) => l.toLowerCase() === t.toLowerCase());
  if (known) return known;
  if (/^basic$/i.test(t)) return "Beginner";
  return t.charAt(0).toUpperCase() + t.slice(1);
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
  for (const part of inner.split(";").map((p) => p.trim()).filter(Boolean)) {
    const pairs = part.split(",").map((p) => /^(speaking|reading|writing)\s*:\s*(.+)$/i.exec(p.trim()));
    if (pairs.every(Boolean)) {
      for (const m of pairs) e[m![1].toLowerCase() as LanguageSkill] = normLevel(m![2]);
    } else if (!e.level) {
      e.level = normLevel(part);
    }
  }
  return e;
}

export function formatLanguage(e: LanguageEntry): string {
  const name = cleanLanguageName(e.name);
  const skills = LANGUAGE_SKILLS.filter((k) => e[k]).map((k) => `${SKILL_LABEL[k]}: ${e[k]}`).join(", ");
  const parts = [e.level, skills].filter(Boolean);
  return parts.length ? `${name} (${parts.join("; ")})` : name;
}

/** For display: the name, the overall level, and a short line for any
 *  reading/writing/speaking level that differs from the overall one. */
export function describeLanguage(raw: string): { name: string; level: string; detail: string } {
  const e = parseLanguage(raw);
  const detail = LANGUAGE_SKILLS
    .filter((k) => e[k] && e[k] !== e.level)
    // Non-breaking space keeps "Writing: Advanced" together in narrow CV
    // sidebars; lines break only between pairs.
    .map((k) => `${SKILL_LABEL[k]}: ${e[k]}`)
    .join(" · ");
  return { name: e.name, level: e.level, detail };
}

export function skillLabel(k: LanguageSkill) {
  return SKILL_LABEL[k];
}
