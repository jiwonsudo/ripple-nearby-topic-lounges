import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoolCharacter } from "./PoolCharacter";
import { avatarOptions, changeAvatar, defaultAvatar, type Avatar, type AvatarPart } from "./avatar";

const parts: { key: AvatarPart; label: string }[] = [{ key: "float", label: "튜브" }, { key: "floatColor", label: "튜브 색" }, { key: "eyewear", label: "아이웨어" }, { key: "outfit", label: "수영복" }, { key: "clothes", label: "수영복 색" }, { key: "prop", label: "소품" }, { key: "hair", label: "머리" }, { key: "hairColor", label: "머리색" }, { key: "skin", label: "피부" }, { key: "eyes", label: "눈" }, { key: "nose", label: "코" }, { key: "mouth", label: "입" }, { key: "body", label: "몸" }];
const labels: Record<string, string> = { short: "짧은 머리", bob: "단발", curly: "곱슬", bun: "올림머리", none: "없음", ink: "차콜", cocoa: "초코", gold: "금빛", blue: "파랑", rose: "분홍", porcelain: "밝은 피부", peach: "복숭아 피부", warm: "따뜻한 피부", tan: "구릿빛 피부", deep: "짙은 피부", espresso: "깊은 피부", round: "동그란 안경", square: "네모 안경", sun: "선글라스", dot: "점눈", oval: "동그란 눈", happy: "웃는 눈", sleepy: "느긋한 눈", button: "작은 코", triangle: "세모 코", smile: "미소", grin: "활짝", small: "작은 입", surprised: "놀란 입", slim: "슬림", broad: "든든", rashguard: "래시가드", onepiece: "원피스 수영복", shorts: "수영 반바지", mint: "민트", lemon: "노랑", ring: "기본 튜브", flamingo: "플라밍고", dolphin: "돌고래", snorkel: "스노클", cocktail: "칵테일", juice: "주스", watergun: "물총", coral: "코랄", lilac: "라일락", aqua: "아쿠아", tangerine: "귤색", cherry: "체리", lime: "라임", lavender: "라벤더", ice: "아이스" };

export function CharacterEditor({ initial, onSave, onClose }: { initial: Avatar; onSave: (value: Avatar) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Avatar>({ ...initial });
  const [part, setPart] = useState<AvatarPart>("float");
  const [view, setView] = useState<"full" | "top">("full");
  const colorPart = part === "hairColor" || part === "skin" || part === "clothes" || part === "floatColor";
  return <div className="character-editor">
    <header className="flex items-center justify-between"><h2 className="text-lg font-bold">나만의 캐릭터</h2><Button variant="ghost" size="icon" aria-label="캐릭터 편집 취소" onClick={onClose}><X /></Button></header>
    <div className="character-preview pool-editor-preview relative mt-3 flex h-[200px] items-center justify-center overflow-hidden rounded-lg"><PoolCharacter avatar={draft} view={view} className={view === "full" ? "relative h-[182px] w-[108px]" : "relative h-[145px] w-[112px]"} label="캐릭터 미리보기" /><Button variant="ghost" size="icon" className="absolute right-2 top-2 bg-background/80" aria-label="캐릭터 초기화" onClick={() => setDraft({ ...defaultAvatar })}><RotateCcw /></Button><div className="absolute bottom-2 left-2 flex gap-1 rounded-lg bg-background p-1">{(["full", "top"] as const).map((mode) => <Button key={mode} variant={view === mode ? "secondary" : "ghost"} className="h-7 rounded-md px-2 text-xs" aria-pressed={view === mode} onClick={() => setView(mode)}>{mode === "full" ? "전신" : "탑뷰"}</Button>)}</div></div>
    <div role="tablist" aria-label="캐릭터 꾸미기 항목" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-border pb-2">{parts.map(({ key, label }) => <Button key={key} role="tab" aria-selected={part === key} variant="ghost" className={`h-9 shrink-0 rounded-lg px-3 text-xs ${part === key ? "bg-primary-soft font-bold text-primary" : "text-muted-foreground"}`} onClick={() => setPart(key)}>{label}</Button>)}</div>
    <div role="tabpanel" aria-label={`${parts.find((p) => p.key === part)?.label} 선택`} className={`mt-4 grid gap-2 ${colorPart ? "grid-cols-3" : "grid-cols-3"}`}>
      {avatarOptions[part].map((value) => { const candidate = changeAvatar(draft, part, value); const selected = draft[part] === value; return <Button key={`${part}-${value}`} variant="ghost" aria-label={labels[value] ?? value} aria-pressed={selected} onClick={() => setDraft(candidate)} className={`relative flex h-[92px] flex-col gap-1 rounded-lg border p-1 ${selected ? "border-primary bg-primary-soft" : "border-border bg-background"}`}>
        {colorPart ? <span className="character-swatch my-2 h-9 w-9 rounded-full" data-color-part={part} data-tone={value} /> : <span className="h-[58px] w-[54px]"><PoolCharacter avatar={candidate} view={part === "float" || part === "prop" ? "top" : "full"} label={`${labels[value]} 캐릭터`} className="h-full w-full" /></span>}
        <span className="text-[11px] font-medium">{labels[value] ?? value}</span>{selected && <Check className="absolute right-1 top-1 h-3 w-3 text-primary" />}
      </Button>; })}
    </div>
    <Button className="mt-5 h-12 w-full rounded-xl" onClick={() => onSave({ ...draft })}><Check />이 모습으로 대화하기</Button>
  </div>;
}