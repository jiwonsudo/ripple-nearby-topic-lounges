import { chatPeekDegrees, type Avatar } from "./avatar";

export function Character({ avatar, className = "", label = "내 캐릭터", peek }: { avatar: Avatar; className?: string; label?: string; peek?: "left" | "right" }) {
  const body = avatar.body === "slim" ? "M39 91Q60 81 81 91L88 128H32Z" : avatar.body === "broad" ? "M24 97Q60 78 96 97L106 128H14Z" : "M30 97Q60 80 90 97Q103 109 98 128H22Q17 109 30 97Z";
  return <svg viewBox={peek ? "-30 -20 180 170" : "0 0 120 132"} role="img" aria-label={label} className={`character ${className}`} data-skin={avatar.skin} data-hair={avatar.hairColor} data-clothes={avatar.clothes}>
    <g transform={peek ? `rotate(${peek === "right" ? chatPeekDegrees : -chatPeekDegrees} 60 110)` : undefined}>
    {avatar.hair === "bun" && <circle cx="60" cy="19" r="17" className="character-hair" />}
    {avatar.hair === "bob" && <path d="M23 49Q20 11 60 11Q100 11 97 49L100 87Q60 98 20 87Z" className="character-hair" />}
    <path d={body} className="character-clothes" />
    <path d="M50 78V94Q60 103 70 94V78" className="character-skin" />
    {avatar.outfit === "hoodie" && <><path d="M38 94Q43 113 60 106Q78 112 82 94" fill="none" className="character-seam" strokeWidth="4" /><path d="M48 103V118M72 103V118" fill="none" className="character-trim" strokeWidth="3" strokeLinecap="round" /></>}
    {avatar.outfit === "collar" && <path d="M44 92L60 102L49 110L38 97M76 92L60 102L71 110L82 97" className="character-trim-fill" />}
    {avatar.outfit === "tee" && <path d="M47 91Q60 103 73 91" className="character-seam" fill="none" strokeWidth="4" />}
    <ellipse cx="26" cy="60" rx="8" ry="11" className="character-skin" /><ellipse cx="94" cy="60" rx="8" ry="11" className="character-skin" />
    <path d="M27 46Q27 20 60 20Q93 20 93 46V66Q90 91 60 93Q30 91 27 66Z" className="character-skin" />
    {avatar.hair === "short" && <path d="M25 52Q15 19 45 14Q84 1 96 34L92 51L82 35Q70 44 49 31L33 47Z" className="character-hair" />}
    {avatar.hair === "bob" && <path d="M25 48V31Q60 7 94 31V50L81 35L66 43L50 35L36 48Z" className="character-hair" />}
    {avatar.hair === "curly" && <g className="character-hair"><circle cx="30" cy="33" r="13" /><circle cx="42" cy="22" r="14" /><circle cx="60" cy="19" r="15" /><circle cx="78" cy="24" r="14" /><circle cx="91" cy="36" r="12" /></g>}
    {avatar.hair === "bun" && <path d="M25 46Q20 13 60 13Q100 13 95 46L84 31Q56 40 35 32Z" className="character-hair" />}
    <path d="M39 48Q44 45 49 48M71 48Q76 45 81 48" className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />
    {avatar.eyes === "dot" && <g className="character-ink"><circle cx="44" cy="58" r="4" /><circle cx="76" cy="58" r="4" /></g>}
    {avatar.eyes === "oval" && <g className="character-ink"><ellipse cx="44" cy="58" rx="4" ry="6" /><ellipse cx="76" cy="58" rx="4" ry="6" /></g>}
    {avatar.eyes === "happy" && <path d="M39 59Q44 50 49 59M71 59Q76 50 81 59" className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.eyes === "sleepy" && <path d="M39 57H49M71 57H81" className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.nose === "button" && <path d="M60 61L57 68H63" className="character-nose" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
    {avatar.nose === "round" && <ellipse cx="60" cy="67" rx="5" ry="4" className="character-nose-fill" />}
    {avatar.nose === "triangle" && <path d="M60 60L55 69H65Z" className="character-nose-fill" />}
    {avatar.mouth === "smile" && <path d="M51 76Q60 86 69 76" fill="none" className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "grin" && <><path d="M49 75H71Q69 88 60 88Q51 88 49 75" className="character-ink" /><path d="M51 76H69V80H51Z" className="character-trim-fill" /></>}
    {avatar.mouth === "small" && <path d="M56 78H64" fill="none" className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "surprised" && <ellipse cx="60" cy="79" rx="4" ry="5" className="character-ink" />}
    {avatar.eyewear !== "none" && <g className="character-ink-stroke" strokeWidth="3" fill={avatar.eyewear === "sun" ? "var(--avatar-ink)" : "none"}><path d="M55 57H65M28 55H32M88 55H92" />{avatar.eyewear === "round" ? <><circle cx="44" cy="57" r="11" /><circle cx="76" cy="57" r="11" /></> : <><rect x="32" y="49" width="24" height="18" rx="5" /><rect x="64" y="49" width="24" height="18" rx="5" /></>}</g>}
    </g>
  </svg>;
}