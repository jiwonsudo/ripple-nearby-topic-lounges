import { Character } from "./Character";
import { avatarForNickname, type Avatar } from "./avatar";

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
  const people = [{ id: userId, nickname, avatar, me: true }, ...nearbyRipplers.map((person) => ({ ...person, avatar: avatarForNickname(person.id), me: false }))];
  return <div className="swimming-ripplers absolute inset-0" aria-label={`주변 ${people.length}명의 캐릭터가 헤엄치는 수영장`}>
    {people.map((person) => <div key={person.id} data-swimmer-id={person.id} className="pool-swimmer">
      <div className="swimmer-drift">
        <div className="swimmer-wake" aria-hidden="true" />
        <div className="swimmer-body">
          <svg className="swimmer-limbs" width="56" height="80" viewBox="0 0 56 80" aria-hidden="true" fill={`var(--avatar-${person.avatar.skin})`}>
            <g className="swimmer-arm swimmer-arm-left"><path d="M15 37Q5 39 5 48L4 56Q5 60 8 57L11 46L19 43Z" /></g>
            <g className="swimmer-arm swimmer-arm-right"><path d="M41 37Q51 39 51 48L52 56Q51 60 48 57L45 46L37 43Z" /></g>
            <g className="swimmer-leg swimmer-leg-left"><path d="M19 50L18 68Q13 73 16 76Q20 78 23 71L27 53Z" /></g>
            <g className="swimmer-leg swimmer-leg-right"><path d="M29 53L33 71Q36 78 40 76Q43 73 38 68L37 50Z" /></g>
          </svg>
          <Character avatar={person.avatar} label={person.me ? "내 수영 캐릭터" : `${person.nickname} 수영 캐릭터`} className="swimmer-character" />
        </div>
        {person.me && <span className="swimmer-self">나</span>}
      </div>
    </div>)}
  </div>;
}