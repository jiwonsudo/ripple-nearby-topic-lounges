import { useEffect, useRef } from "react";
import { PoolCharacter } from "./PoolCharacter";
import { createPoolBody, poolActivity, stepPoolBody, type PoolFrame } from "./pool-motion";
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
    const update = (frame: PoolFrame) => {
      const box = element.getBoundingClientRect(); const parent = shell.getBoundingClientRect();
      const touches = frame.touches.map((touch) => ({ ...touch, x: touch.x - (box.left - parent.left), y: touch.y - (box.top - parent.top) }));
      rows.forEach((row, index) => {
        const person = peopleRef.current[index]; if (!person) return;
        const previous = bodies[index]; if (!previous) return;
        const pos = stepPoolBody(previous, frame.time, box.width, box.height, poolActivity(person.avatar) === "floating", touches, frame.height);
        bodies[index] = pos;
        row.style.transform = `translate3d(${pos.x - 20}px,${pos.y - 31}px,0)`;
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
    return () => shell.removeEventListener("pool-frame", tick);
  }, []);
  return <div ref={host} className="swimming-ripplers absolute inset-0" aria-label={`주변 ${people.length}명의 탑뷰 수영장 캐릭터`}>
    {people.map((person) => <div key={person.id} data-swimmer-id={person.id} data-activity={poolActivity(person.avatar)} className="pool-swimmer">
      <div className="swimmer-body"><PoolCharacter avatar={person.avatar} label={person.me ? "내 수영 캐릭터" : `${person.nickname} 수영 캐릭터`} className="h-full w-full" /></div>
      {person.me && <span className="swimmer-self">나</span>}
    </div>)}
  </div>;
}