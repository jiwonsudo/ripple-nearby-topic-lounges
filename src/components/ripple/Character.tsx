import { useId } from "react";
import { chatPeekDegrees, type Avatar } from "./avatar";

export function Character({ avatar, className = "", label = "내 캐릭터", peek }: { avatar: Avatar; className?: string; label?: string; peek?: "left" | "right" }) {
  const clipId = useId();
  const skin = `var(--avatar-${avatar.skin}, var(--primary))`;
  const hair = `var(--avatar-${avatar.hairColor}, var(--primary))`;
  const clothes = `var(--avatar-${avatar.clothes}, var(--primary))`;
  const ink = "var(--avatar-ink, var(--foreground))";
  const trim = "var(--avatar-white, var(--background))";
  const body = avatar.body === "slim" ? "M39 91Q60 81 81 91L88 128H32Z" : avatar.body === "broad" ? "M24 97Q60 78 96 97L106 128H14Z" : "M30 97Q60 80 90 97Q103 109 98 128H22Q17 109 30 97Z";
  const peekingBody = avatar.body === "slim" ? "M39 91Q60 81 81 91Q88 111 54 136L-40 210H-100L16 125Q28 105 39 91Z" : avatar.body === "broad" ? "M24 97Q60 78 96 97Q108 113 54 136L-40 210H-110L0 132Q12 108 24 97Z" : "M30 97Q60 80 90 97Q103 113 54 136L-40 210H-100L6 130Q17 109 30 97Z";
  return <svg width={peek ? 54 : 120} height={peek ? 60 : 132} viewBox="0 0 120 132" fill={skin} role="img" aria-label={label} className={`character ${className}`} data-skin={avatar.skin} data-hair={avatar.hairColor} data-clothes={avatar.clothes}>
    {peek && <defs><clipPath id={clipId}><rect x={peek === "right" ? 49 : -60} y="-20" width="131" height="180" /></clipPath></defs>}
    <g clipPath={peek ? `url(#${clipId})` : undefined}>
    <g transform={peek ? `rotate(${peek === "right" ? chatPeekDegrees : -chatPeekDegrees} 60 110)` : undefined}>
    {avatar.hair === "bun" && <circle cx="60" cy="19" r="17" fill={hair} className="character-hair" />}
    {avatar.hair === "bob" && <path d="M23 49Q20 11 60 11Q100 11 97 49L100 87Q60 98 20 87Z" fill={hair} className="character-hair" />}
    <path d={peek ? peekingBody : body} transform={peek === "left" ? "translate(120 0) scale(-1 1)" : undefined} fill={clothes} className="character-clothes" />
    <path d="M50 78V94Q60 103 70 94V78" className="character-skin" />
    {avatar.outfit === "hoodie" && <><path d="M38 94Q43 113 60 106Q78 112 82 94" fill="none" stroke={ink} className="character-seam" strokeWidth="4" /><path d="M48 103V118M72 103V118" fill="none" stroke={trim} className="character-trim" strokeWidth="3" strokeLinecap="round" /></>}
    {avatar.outfit === "collar" && <path d="M44 92L60 102L49 110L38 97M76 92L60 102L71 110L82 97" fill={trim} className="character-trim-fill" />}
    {avatar.outfit === "tee" && <path d="M47 91Q60 103 73 91" stroke={ink} className="character-seam" fill="none" strokeWidth="4" />}
    <ellipse cx="26" cy="60" rx="8" ry="11" className="character-skin" /><ellipse cx="94" cy="60" rx="8" ry="11" className="character-skin" />
    <path d="M27 46Q27 20 60 20Q93 20 93 46V66Q90 91 60 93Q30 91 27 66Z" className="character-skin" />
    {avatar.hair === "short" && <path d="M25 52Q15 19 45 14Q84 1 96 34L92 51L82 35Q70 44 49 31L33 47Z" fill={hair} className="character-hair" />}
    {avatar.hair === "bob" && <path d="M25 48V31Q60 7 94 31V50L81 35L66 43L50 35L36 48Z" fill={hair} className="character-hair" />}
    {avatar.hair === "curly" && <g fill={hair} className="character-hair"><circle cx="30" cy="33" r="13" /><circle cx="42" cy="22" r="14" /><circle cx="60" cy="19" r="15" /><circle cx="78" cy="24" r="14" /><circle cx="91" cy="36" r="12" /></g>}
    {avatar.hair === "bun" && <path d="M25 46Q20 13 60 13Q100 13 95 46L84 31Q56 40 35 32Z" fill={hair} className="character-hair" />}
    <path d="M39 48Q44 45 49 48M71 48Q76 45 81 48" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />
    {avatar.eyes === "dot" && <g fill={ink} className="character-ink"><circle cx="44" cy="58" r="4" /><circle cx="76" cy="58" r="4" /></g>}
    {avatar.eyes === "oval" && <g fill={ink} className="character-ink"><ellipse cx="44" cy="58" rx="4" ry="6" /><ellipse cx="76" cy="58" rx="4" ry="6" /></g>}
    {avatar.eyes === "happy" && <path d="M39 59Q44 50 49 59M71 59Q76 50 81 59" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.eyes === "sleepy" && <path d="M39 57H49M71 57H81" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.nose === "button" && <path d="M60 61L57 68H63" stroke={ink} className="character-nose" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
    {avatar.nose === "round" && <ellipse cx="60" cy="67" rx="5" ry="4" fill={ink} className="character-nose-fill" />}
    {avatar.nose === "triangle" && <path d="M60 60L55 69H65Z" fill={ink} className="character-nose-fill" />}
    {avatar.mouth === "smile" && <path d="M51 76Q60 86 69 76" fill="none" stroke={ink} className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "grin" && <><path d="M49 75H71Q69 88 60 88Q51 88 49 75" fill={ink} className="character-ink" /><path d="M51 76H69V80H51Z" fill={trim} className="character-trim-fill" /></>}
    {avatar.mouth === "small" && <path d="M56 78H64" fill="none" stroke={ink} className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "surprised" && <ellipse cx="60" cy="79" rx="4" ry="5" fill={ink} className="character-ink" />}
    {avatar.eyewear !== "none" && <g stroke={ink} className="character-ink-stroke" strokeWidth="3" fill={avatar.eyewear === "sun" ? ink : "none"}><path d="M55 57H65M28 55H32M88 55H92" />{avatar.eyewear === "round" ? <><circle cx="44" cy="57" r="11" /><circle cx="76" cy="57" r="11" /></> : <><rect x="32" y="49" width="24" height="18" rx="5" /><rect x="64" y="49" width="24" height="18" rx="5" /></>}</g>}
    </g>
    {peek && <g transform={peek === "left" ? "translate(120 0) scale(-1 1)" : undefined}>
      <path d="M83 99Q94 110 84 120Q75 129 56 129L52 112Q71 116 73 102Z" fill={clothes} className="character-clothes" />
      <path d="M49 111Q48 104 53 103Q58 103 59 111L64 110Q69 109 70 114V128Q67 137 58 137Q49 136 49 130Z" fill={skin} className="character-skin" />
      <path d="M56 116H67M56 122H68M56 128H66" stroke={ink} className="character-nose" fill="none" strokeWidth="1.5" strokeLinecap="round" />
    </g>}
    </g>
  </svg>;
}