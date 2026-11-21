import type { Avatar } from "./avatar";
import { useId } from "react";

// Geometry uses the same 120×160 coordinate space in full-body and overhead views.
export function PoolFloat({ avatar, layer = "all" }: { avatar: Avatar; layer?: "all" | "back" | "front" }) {
  const clipId = useId();
  if (avatar.float === "none") return null;
  const color = `var(--avatar-${avatar.floatColor})`;
  const shade = `color-mix(in oklch, ${color}, var(--avatar-ink) 18%)`;
  const light = `color-mix(in oklch, ${color}, var(--avatar-white) 30%)`;
  return <g data-float={avatar.float} data-float-layer={layer}>
    {layer !== "all" && <defs><clipPath id={clipId}><rect x="-10" y={layer === "front" ? 80 : -10} width="160" height="90" /></clipPath></defs>}
    <g clipPath={layer === "all" ? undefined : `url(#${clipId})`}>
    <path d="M16 85C16 58 35 45 60 45S104 58 104 85S85 127 60 127S16 112 16 85ZM40 85C40 98 47 106 60 106S80 98 80 85S73 64 60 64S40 72 40 85Z" fill={shade} fillRule="evenodd" />
    <path d="M16 80C16 53 35 40 60 40S104 53 104 80S85 122 60 122S16 107 16 80ZM40 80C40 93 47 101 60 101S80 93 80 80S73 59 60 59S40 67 40 80Z" fill={color} fillRule="evenodd" />
    <path d="M28 68Q31 52 47 49M77 110Q94 102 95 88" fill="none" stroke={light} strokeWidth="5" strokeLinecap="round" />
    {avatar.float === "flamingo" && <>
      <path d="M88 89Q118 74 105 49Q89 22 95 9Q101 -3 113 6Q125 14 115 29Q108 38 116 51Q131 79 109 97Z" fill={color} />
      <path d="M109 15L128 22L122 32L108 25Z" fill="var(--avatar-white)" /><path d="M122 20L132 24L122 32Z" fill="var(--avatar-ink)" />
      <circle cx="109" cy="12" r="3.5" fill="var(--avatar-ink)" />
      <path d="M21 75Q7 87 19 100L29 91Z" fill={light} />
    </>}
    {avatar.float === "dolphin" && <>
      <path d="M84 83Q89 65 85 43Q80 26 94 19Q110 13 119 27L135 31Q144 36 133 41L117 42Q114 58 107 75L106 90Z" fill={color} />
      <path d="M98 39Q112 47 124 36Q116 58 101 64Z" fill={light} /><circle cx="114" cy="29" r="3.5" fill="var(--avatar-ink)" />
      <path d="M91 24L88 8Q87 3 97 9L107 18Z" fill={color} />
      <path d="M19 75L4 59Q0 57 3 67L14 91M101 75L116 59Q120 57 117 67L106 91" fill={color} />
      <path d="M54 119Q40 125 36 139L60 132L84 139Q80 125 66 119Z" fill={color} />
    </>}
    </g>
  </g>;
}