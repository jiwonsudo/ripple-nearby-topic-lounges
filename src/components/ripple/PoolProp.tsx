import type { Avatar } from "./avatar";

export function PoolProp({ prop }: { prop: Avatar["prop"] }) {
  if (prop === "none") return null;
  return <g data-prop={prop}>
    {prop === "cocktail" && <>
      <path d="M-10 -13H10L0 0Z" fill="var(--avatar-white)" /><path d="M-8 -10H8L0 -1Z" fill="var(--avatar-rose)" />
      <path d="M0 0V12M-6 12H6" stroke="var(--avatar-white)" strokeWidth="3" strokeLinecap="round" /><circle cx="8" cy="-12" r="4" fill="var(--avatar-lemon)" />
      <path d="M-6 -14L-1 -23L10 -16Z" fill="var(--avatar-mint)" /><path d="M0 -19L3 -10" stroke="var(--avatar-ink)" strokeWidth="1.5" />
    </>}
    {prop === "juice" && <>
      <path d="M-10 -15H10L7 12H-7Z" fill="var(--avatar-white)" /><path d="M-8 -9H8L6 10H-6Z" fill="var(--avatar-gold)" />
      <path d="M0 4L3 -23H9" stroke="var(--avatar-rose)" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="-7" cy="-14" r="5" fill="var(--avatar-lemon)" />
    </>}
    {prop === "watergun" && <>
      <rect x="-17" y="-8" width="29" height="14" rx="4" fill="var(--avatar-lemon)" /><rect x="-12" y="-15" width="16" height="10" rx="4" fill="var(--avatar-mint)" />
      <path d="M-9 4H0L-2 17H-10Z" fill="var(--avatar-blue)" /><rect x="10" y="-5" width="10" height="7" rx="2" fill="var(--avatar-blue)" />
      <rect x="-14" y="-5" width="8" height="5" rx="2" fill="var(--avatar-rose)" />
    </>}
  </g>;
}