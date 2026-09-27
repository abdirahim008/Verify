import { parseLanguage, languageSummary, hasRatings, levelWord, LANGUAGE_SKILLS, SKILL_LABEL, SKILL_SHORT } from "@/lib/languages";
import { C, SERIF } from "./palette";

// Public profile languages: name and a one-word summary, then dot ratings
// for reading, writing and speaking when the member has rated them.
export function LanguageList({ languages }: { languages: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      {languages.map((l, i) => {
        const e = parseLanguage(l);
        const summary = languageSummary(e);
        return (
          <div key={i}>
            {i > 0 && <div className="h-px -mt-1.5 mb-3" style={{ background: C.line }} />}
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[16px]" style={{ color: C.ink, fontFamily: SERIF }}>{e.name}</span>
              {summary && <span className="text-[12px] shrink-0" style={{ color: C.faint }}>{summary}</span>}
            </div>
            {hasRatings(e) && (
              <div className="mt-2.5 grid grid-cols-3 gap-3">
                {LANGUAGE_SKILLS.map((k) => (
                  <div key={k} className="min-w-0" aria-label={`${SKILL_LABEL[k]}: ${levelWord(e[k]) || "not rated"}`}>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: C.faint }}>{SKILL_SHORT[k]}</div>
                    <div className="mt-1.5 flex gap-[3px]" aria-hidden>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <span key={j} className="w-[7px] h-[7px] rounded-full" style={{ background: j <= e[k] ? C.ink : C.dotIdle }} />
                      ))}
                    </div>
                    <div className="mt-1 text-[11.5px] leading-tight break-words" style={{ color: e[k] ? C.body : C.soft }}>{levelWord(e[k]) || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
