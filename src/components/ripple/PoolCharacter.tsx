import { Character } from "./Character";
import { PoolFloat } from "./PoolFloat";
import { PoolProp } from "./PoolProp";
import { poolActivity } from "./pool-motion";
import type { Avatar } from "./avatar";

export function PoolCharacter({ avatar, view = "top", label = "수영장 캐릭터", className = "" }: { avatar: Avatar; view?: "top" | "full"; label?: string; className?: string }) {
  if (view === "full") return <Character avatar={avatar} fullBody label={label} className={className} />;
  const floating = poolActivity(avatar) === "floating";
  const skin = `var(--avatar-${avatar.skin})`;
  const hair = `var(--avatar-${avatar.hairColor})`;
  const suit = `var(--avatar-${avatar.clothes})`;
  return <svg width="40" height="62" viewBox="-6 -6 132 202" role="img" aria-label={label} data-view="top" data-activity={poolActivity(avatar)} data-float={avatar.float} data-float-color={avatar.floatColor} data-eyewear={avatar.eyewear} data-skin={avatar.skin} data-outfit={avatar.outfit} data-prop={avatar.prop} className={`pool-character ${className}`} fill={skin} stroke="none">
    <g transform="translate(0 22) scale(1 .85)"><PoolFloat avatar={avatar} layer="back" /></g>
    <g transform="translate(0 -12.5) scale(1 1.25)">
    <g data-body-part="left-leg" className={floating ? "" : "pool-kick pool-kick-left"}><path d={floating ? "M43 90L38 137Q32 140 34 146Q40 152 47 140L58 94Z" : "M47 87L40 131Q34 135 37 141Q43 146 49 133L58 91Z"} /></g>
    <g data-body-part="right-leg" className={floating ? "" : "pool-kick pool-kick-right"}><path d={floating ? "M62 94L73 140Q80 152 86 146Q88 140 82 137L77 90Z" : "M62 91L71 133Q77 146 83 141Q86 135 80 131L73 87Z"} /></g>
    <path data-body-part="torso" d="M40 51Q60 43 80 51L80 92Q60 108 40 92Z" fill={avatar.outfit === "shorts" ? skin : suit} />
    {avatar.outfit === "shorts" && <path d="M40 79H80L78 99H65L60 91L55 99H42Z" fill={suit} />}
    {avatar.outfit !== "shorts" && <path d="M44 62Q60 67 76 62" fill="none" stroke="var(--avatar-white)" strokeWidth="4" />}
    </g>
    <g transform="translate(0 22) scale(1 .85)"><PoolFloat avatar={avatar} layer="front" /></g>
    <g transform="translate(0 -12.5) scale(1 1.25)">
    <g className={floating ? "" : "pool-stroke pool-stroke-left"}>
      <path d={floating ? "M43 55Q28 48 21 63L13 83Q13 92 20 88L31 70L48 64Z" : "M43 53Q31 43 29 27L26 15Q22 8 19 14L20 30Q22 52 37 64Z"} />
    </g>
    <g className={floating || avatar.prop !== "none" ? "" : "pool-stroke pool-stroke-right"}>
      <path d={floating ? "M77 55Q92 48 99 63L107 83Q107 92 100 88L89 70L72 64Z" : "M77 53Q89 43 91 27L94 15Q98 8 101 14L100 30Q98 52 83 64Z"} />
      <g transform={floating ? "translate(103 83) scale(.7)" : "translate(97 18) scale(.7)"}><PoolProp prop={avatar.prop} /></g>
    </g>
    </g>
    <ellipse cx="60" cy="39" rx="23" ry="26" />
    {avatar.hair !== "none" && <>
      {avatar.hair === "curly" ? <path d="M39 48Q27 41 36 33Q27 24 38 20Q36 8 48 13Q53 1 62 11Q73 3 80 17Q94 19 83 31Q91 41 80 48Q61 40 39 48Z" fill={hair} /> : <path d={avatar.hair === "bob" ? "M37 43Q28 11 60 10Q92 11 83 43L87 56Q77 61 73 48Q60 40 47 48Q43 61 33 56Z" : "M37 37Q32 11 60 10Q88 11 83 37Q69 30 60 34Q50 29 37 37Z"} fill={hair} />}
      {avatar.hair === "bun" && <circle cx="60" cy="12" r="11" fill={hair} />}
      <path d="M47 20Q56 14 66 18" stroke={`color-mix(in oklch, ${hair}, var(--avatar-white) 20%)`} strokeWidth="3" strokeLinecap="round" fill="none" />
    </>}
    {floating && <g fill="var(--avatar-ink)"><circle cx="51" cy="45" r="2" /><circle cx="69" cy="45" r="2" /><path d="M55 54Q60 58 65 54" stroke="var(--avatar-ink)" strokeWidth="2" fill="none" /></g>}
    {avatar.eyewear === "snorkel" && <>
      <rect x="39" y="38" width="42" height="15" rx="5" fill="var(--pool-mask)" fillOpacity=".15" stroke="var(--avatar-blue)" strokeWidth="3" />
      <path d="M76 53H86Q91 53 91 47V16" stroke="var(--avatar-blue)" strokeWidth="5" strokeLinecap="round" fill="none" /><path d="M91 12V20" stroke="var(--avatar-lemon)" strokeWidth="6" strokeLinecap="round" />
    </>}
    {avatar.eyewear !== "none" && avatar.eyewear !== "snorkel" && <g stroke="var(--avatar-ink)" strokeWidth="2.5" fill={avatar.eyewear === "sun" ? "var(--avatar-ink)" : "none"}>
      <path d="M56 45H64" />{avatar.eyewear === "round" ? <><circle cx="49" cy="45" r="7" /><circle cx="71" cy="45" r="7" /></> : <><rect x="41" y="39" width="16" height="12" rx="3" /><rect x="63" y="39" width="16" height="12" rx="3" /></>}
    </g>}
  </svg>;
}