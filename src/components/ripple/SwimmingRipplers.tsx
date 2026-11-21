import { useEffect, useRef } from "react";
import { PoolCharacter } from "./PoolCharacter";
import { createPoolBody, poolActivity, stepPoolBody, throwPoolBody, type PoolFrame } from "./pool-motion";
import { distinctPoolAvatars, type Avatar } from "./avatar";

// The first four IDs are the same people shown in the lounge, not new avatars.
export const nearbyRipplers = [
  { id: "rippler-panda", nickname: "졸린 판다" },
  { id: "rippler-coder", nickname: "새벽 코더" },
  { id: "rippler-mint", nickname: "민트 고양이" },
  { id: "rippler-rabbit", nickname: "달리는 토끼" },
  { id: "rippler-otter", nickname: "다정한 수달" },
  { id: "rippler-whale", nickname: "유쾌한 고래" },
  { id: "rippler-fox", nickname: "차분한 여우" },
  { id: "rippler-bear", nickname: "포근한 곰" },
  { id: "rippler-penguin", nickname: "명랑한 펭귄" },
  { id: "rippler-cat", nickname: "용감한 고양이" },
  { id: "rippler-deer", nickname: "느긋한 사슴" },
] as const;

export const nearbyRipplerCount = nearbyRipplers.length + 1;

export function SwimmingRipplers({ avatar, nickname, userId }: { avatar: Avatar; nickname: string; userId: string }) {
  const mockAvatars = distinctPoolAvatars(nearbyRipplers.map((person) => person.id), avatar.floatColor);
  const people = [{ id: userId, nickname, avatar, me: true }, ...nearbyRipplers.map((person, index) => ({ ...person, avatar: mockAvatars[index] ?? avatar, me: false }))];
  const host = useRef<HTMLDivElement>(null);
  const peopleRef = useRef(people);
  peopleRef.current = people;
  useEffect(() => {
    const element = host.current;
    const shell = element?.closest(".phone-shell");
    if (!element || !shell) return;
    const rows = Array.from(element.querySelectorAll<HTMLElement>("[data-swimmer-id]"));
    const bodies = peopleRef.current.map((person, index) => createPoolBody(index, element.clientWidth, element.clientHeight, poolActivity(person.avatar) === "floating"));
    let held: { index: number; pointerId: number; x: number; y: number; stamp: number; vx: number; vy: number } | null = null;
    const point = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      return { x: Math.max(40, Math.min(box.width - 40, event.clientX - box.left)), y: Math.max(40, Math.min(box.height - 40, event.clientY - box.top)) };
    };
    const down = (event: PointerEvent) => {
      const target = (event.target as Element).closest<HTMLElement>("[data-swimmer-id]");
      const index = target ? rows.indexOf(target) : -1;
      if (!target || index < 0 || held) return;
      event.preventDefault(); event.stopPropagation(); target.setPointerCapture(event.pointerId);
      const pos = point(event);
      held = { index, pointerId: event.pointerId, ...pos, stamp: performance.now(), vx: 0, vy: 0 };
      target.dataset['held'] = "true";
    };
    const move = (event: PointerEvent) => {
      if (!held || held.pointerId !== event.pointerId) return;
      const pos = point(event); const stamp = performance.now(); const dt = Math.max((stamp - held.stamp) / 1000, .016);
      held = { ...held, ...pos, stamp, vx: (pos.x - held.x) / dt, vy: (pos.y - held.y) / dt };
    };
    const release = (event: PointerEvent) => {
      if (!held || held.pointerId !== event.pointerId) return;
      const row = rows[held.index]; const body = bodies[held.index];
      if (body) bodies[held.index] = throwPoolBody(body, held.x, held.y, held.vx, held.vy);
      if (row) { delete row.dataset['held']; row.dataset['landing'] = "true"; setTimeout(() => delete row.dataset['landing'], 420); }
      const box = element.getBoundingClientRect();
      shell.dispatchEvent(new CustomEvent("pool-drop", { detail: { x: held.x + box.left, y: held.y + box.top } }));
      held = null;
    };
    element.addEventListener("pointerdown", down); element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", release); element.addEventListener("pointercancel", release);
    const update = (frame: PoolFrame) => {
      const box = element.getBoundingClientRect(); const parent = shell.getBoundingClientRect();
      const touches = frame.touches.map((touch) => ({ ...touch, x: touch.x - (box.left - parent.left), y: touch.y - (box.top - parent.top) }));
      rows.forEach((row, index) => {
        const person = peopleRef.current[index]; if (!person) return;
        const previous = bodies[index]; if (!previous) return;
        const pos = held?.index === index ? { ...previous, x: held.x, y: held.y, vx: 0, vy: 0, lastTime: frame.time, push: 0 } : stepPoolBody(previous, frame.time, box.width, box.height, poolActivity(person.avatar) === "floating", touches, frame.height);
        bodies[index] = pos;
        row.style.transform = `translate3d(${pos.x - 16}px,${pos.y - 25}px,0)`;
        const body = row.querySelector<HTMLElement>(".swimmer-body");
        if (body) body.style.transform = `rotate(${pos.rotation}deg)`;
        row.dataset['wavePush'] = pos.push.toFixed(2);
        row.dataset['poolX'] = String(pos.x + box.left - parent.left);
        row.dataset['poolY'] = String(pos.y + box.top - parent.top);
      });
    };
    update({ time: 1.5, width: element.clientWidth, height: element.clientHeight, touches: [] });
    const tick = (event: Event) => update((event as CustomEvent<PoolFrame>).detail);
    shell.addEventListener("pool-frame", tick);
    return () => { shell.removeEventListener("pool-frame", tick); element.removeEventListener("pointerdown", down); element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", release); element.removeEventListener("pointercancel", release); };
  }, []);
  return <div ref={host} className="swimming-ripplers absolute inset-0" aria-label={`주변 ${people.length}명의 탑뷰 수영장 캐릭터`}>
    {people.map((person) => <div key={person.id} data-swimmer-id={person.id} data-activity={poolActivity(person.avatar)} className="pool-swimmer">
      <div className="swimmer-body"><PoolCharacter avatar={person.avatar} label={person.me ? "내 수영 캐릭터" : `${person.nickname} 수영 캐릭터`} className="h-full w-full" /></div>
      {person.me && <span className="swimmer-self">나</span>}
    </div>)}
  </div>;
}