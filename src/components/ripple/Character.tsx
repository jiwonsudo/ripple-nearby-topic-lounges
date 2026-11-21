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
  return <svg width={peek ? 42 : 120} height={peek ? 46 : 132} viewBox="0 0 120 132" fill={skin} stroke="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={label} className={`character size-character ${className}`} data-skin={avatar.skin} data-hair={avatar.hairColor} data-clothes={avatar.clothes}>
    {peek && <defs><clipPath id={clipId}><rect x={peek === "right" ? 49 : -60} y="-20" width="131" height="180" /></clipPath></defs>}
    <g clipPath={peek ? `url(#${clipId})` : undefined}>
    <g transform={peek ? `rotate(${peek === "right" ? chatPeekDegrees : -chatPeekDegrees} 60 110)` : undefined}>
    {avatar.hair === "bun" && <path d="M51 26C37 22 39 6 52 4C69 0 77 17 65 27Z" fill={hair} className="character-hair" />}
    {avatar.hair === "bob" && <path d="M25 52C16 34 28 8 50 12C77 2 97 24 95 49L100 68Q113 82 97 91L91 104Q69 111 29 98Q13 92 24 78Q12 66 25 52Z" fill={hair} className="character-hair" />}
    <path d={peek ? peekingBody : body} transform={peek === "left" ? "translate(120 0) scale(-1 1)" : undefined} fill={clothes} className="character-clothes" />
    <path d="M49 79V96Q60 104 71 96V79" className="character-skin" />
    {avatar.outfit === "hoodie" && <path d="M48 103V118M72 103V118" fill="none" stroke={trim} className="character-trim" strokeWidth="3" strokeLinecap="round" />}
    {avatar.outfit === "collar" && <path d="M44 92L60 102L49 110L38 97M76 92L60 102L71 110L82 97" fill={trim} className="character-trim-fill" />}
    {avatar.outfit === "tee" && <path d="M48 91Q60 102 72 91Q60 109 48 91Z" fill={trim} className="character-trim-fill" />}
    <ellipse cx="27" cy="61" rx="8" ry="10" className="character-skin" /><ellipse cx="93" cy="61" rx="8" ry="10" className="character-skin" />
    <path d="M27 45C27 26 42 20 60 20C78 20 93 26 93 45V65C93 82 78 95 60 95C42 95 27 82 27 65Z" className="character-skin" />
    {avatar.hair === "short" && <path d="M27 48C12 36 18 22 30 24C24 9 38 7 45 15C46 0 62 2 65 13C76 0 89 13 85 24C104 19 108 39 92 44L83 47L82 30Q52 42 34 32Z" fill={hair} className="character-hair" />}
    {avatar.hair === "bob" && <path d="M24 54C15 31 32 13 52 15C78 8 99 27 92 46C90 55 79 53 73 44L64 27Q56 46 31 51L30 70Z" fill={hair} className="character-hair" />}
    {avatar.hair === "curly" && <path d="M26 48C9 45 11 28 23 27C13 15 30 5 39 14C37 0 53 1 57 12C63 -2 78 4 77 17C92 5 106 22 94 31C110 36 99 53 85 47L80 35Q55 46 30 37Z" fill={hair} className="character-hair" />}
    {avatar.hair === "bun" && <path d="M28 47Q22 19 54 19Q84 17 91 45L82 42L77 30Q61 24 38 40Z" fill={hair} className="character-hair" />}
    <path d="M38 48Q44 44 50 48M70 48Q76 44 82 48" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />
    {avatar.eyes === "dot" && <g fill={ink} className="character-ink"><circle cx="44" cy="58" r="3" /><circle cx="76" cy="58" r="3" /></g>}
    {avatar.eyes === "oval" && <g fill={ink} className="character-ink"><ellipse cx="44" cy="58" rx="3" ry="5" /><ellipse cx="76" cy="58" rx="3" ry="5" /></g>}
    {avatar.eyes === "happy" && <path d="M39 59Q44 50 49 59M71 59Q76 50 81 59" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.eyes === "sleepy" && <path d="M39 57H49M71 57H81" stroke={ink} className="character-ink-stroke" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.nose === "button" && <path d="M57 65Q55 71 60 71Q65 71 63 65" stroke={ink} className="character-nose" fill="none" strokeWidth="3" strokeLinecap="round" />}
    {avatar.nose === "round" && <ellipse cx="60" cy="67" rx="5" ry="4" fill={ink} className="character-nose-fill" />}
    {avatar.nose === "triangle" && <path d="M60 60L55 70H65Z" fill={ink} className="character-nose-fill" />}
    {avatar.mouth === "smile" && <path d="M50 78Q60 87 70 78" fill="none" stroke={ink} className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "grin" && <><path d="M49 75H71Q69 88 60 88Q51 88 49 75" fill={ink} className="character-ink" /><path d="M51 76H69V80H51Z" fill={trim} className="character-trim-fill" /></>}
    {avatar.mouth === "small" && <path d="M55 79H65" fill="none" stroke={ink} className="character-ink-stroke" strokeWidth="3" strokeLinecap="round" />}
    {avatar.mouth === "surprised" && <ellipse cx="60" cy="79" rx="4" ry="5" fill={ink} className="character-ink" />}
    {avatar.eyewear !== "none" && <g stroke={ink} className="character-ink-stroke" strokeWidth="3" fill={avatar.eyewear === "sun" ? ink : "none"}><path d="M55 57H65M28 55H32M88 55H92" />{avatar.eyewear === "round" ? <><circle cx="44" cy="57" r="11" /><circle cx="76" cy="57" r="11" /></> : <><rect x="32" y="49" width="24" height="18" rx="5" /><rect x="64" y="49" width="24" height="18" rx="5" /></>}</g>}
    </g>
    {peek && <g transform={peek === "left" ? "translate(120 0) scale(-1 1)" : undefined}>
      <path d="M82 103Q98 105 102 119Q104 132 63 145L51 134Q85 121 81 115L72 112" fill={clothes} className="character-clothes" />
      <path d="M44 134L51 133Q59 130 62 134Q63 138 57 139Q65 137 65 142Q65 145 59 145Q65 145 64 149Q63 152 57 152Q62 152 61 155Q58 159 50 156L44 151Z" fill={skin} className="character-skin" />
      <path d="M44 80L51 79Q59 76 62 80Q63 84 57 85Q65 83 65 88Q65 91 59 91Q65 91 64 95Q63 98 57 98Q62 98 61 101Q58 105 50 102L44 97Z" fill={skin} className="character-skin" />
    </g>}
    </g>
  </svg>;
}