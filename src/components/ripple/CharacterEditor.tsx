import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Character } from "./Character";
import { avatarOptions, changeAvatar, defaultAvatar, type Avatar, type AvatarPart } from "./avatar";

const parts: { key: AvatarPart; label: string }[] = [{ key: "hair", label: "머리" }, { key: "hairColor", label: "머리색" }, { key: "skin", label: "피부" }, { key: "eyewear", label: "안경" }, { key: "eyes", label: "눈" }, { key: "nose", label: "코" }, { key: "mouth", label: "입" }, { key: "body", label: "몸" }, { key: "outfit", label: "옷" }, { key: "clothes", label: "옷 색" }];
const labels: Record<string, string> = { short: "짧은 머리", bob: "단발", curly: "곱슬", bun: "올림머리", none: "없음", ink: "차콜", cocoa: "초코", gold: "금빛", blue: "파랑", rose: "분홍", porcelain: "밝은 피부", peach: "복숭아 피부", warm: "따뜻한 피부", tan: "구릿빛 피부", deep: "짙은 피부", espresso: "깊은 피부", round: "동글", square: "네모", sun: "선글라스", dot: "점눈", oval: "동그란 눈", happy: "웃는 눈", sleepy: "느긋한 눈", button: "작은 코", triangle: "세모 코", smile: "미소", grin: "활짝", small: "작은 입", surprised: "놀란 입", slim: "슬림", broad: "든든", tee: "티셔츠", hoodie: "후드", collar: "카라", mint: "민트", lemon: "노랑" };

export function CharacterEditor({ initial, onSave, onClose }: { initial: Avatar; onSave: (value: Avatar) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Avatar>({ ...initial });
  const [part, setPart] = useState<AvatarPart>("hair");
  const colorPart = part === "hairColor" || part === "skin" || part === "clothes";
  return <div className="character-editor">
    <header className="flex items-center justify-between"><h2 className="text-lg font-bold">나만의 캐릭터</h2><Button variant="ghost" size="icon" aria-label="캐릭터 편집 취소" onClick={onClose}><X /></Button></header>
    <div className="character-preview relative mt-3 flex h-[210px] items-center justify-center overflow-hidden rounded-lg bg-primary-soft"><div className="character-preview-rings" /><Character avatar={draft} className="relative h-[190px] w-[174px]" label="캐릭터 미리보기" /><Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="캐릭터 초기화" onClick={() => setDraft({ ...defaultAvatar })}><RotateCcw /></Button></div>
    <p className="mt-3 text-center text-xs text-muted-foreground">실제 얼굴 대신, 나다운 모습으로</p>
    <div role="tablist" aria-label="캐릭터 꾸미기 항목" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto border-b border-border pb-2">{parts.map(({ key, label }) => <Button key={key} role="tab" aria-selected={part === key} variant="ghost" className={`h-9 shrink-0 rounded-lg px-3 text-xs ${part === key ? "bg-primary-soft font-bold text-primary" : "text-muted-foreground"}`} onClick={() => setPart(key)}>{label}</Button>)}</div>
    <div role="tabpanel" aria-label={`${parts.find((p) => p.key === part)?.label} 선택`} className={`mt-4 grid gap-2 ${colorPart ? "grid-cols-3" : "grid-cols-3"}`}>
      {avatarOptions[part].map((value) => { const candidate = changeAvatar(draft, part, value); const selected = draft[part] === value; return <Button key={`${part}-${value}`} variant="ghost" aria-label={labels[value] ?? value} aria-pressed={selected} onClick={() => setDraft(candidate)} className={`relative flex h-[92px] flex-col gap-1 rounded-lg border p-1 ${selected ? "border-primary bg-primary-soft" : "border-border bg-background"}`}>
        {colorPart ? <span className="character-swatch my-2 h-9 w-9 rounded-full" data-color-part={part} data-tone={value} /> : <Character avatar={candidate} label={`${labels[value]} 캐릭터`} className="h-[58px] w-[54px]" />}
        <span className="text-[11px] font-medium">{labels[value] ?? value}</span>{selected && <Check className="absolute right-1 top-1 h-3 w-3 text-primary" />}
      </Button>; })}
    </div>
    <Button className="mt-5 h-12 w-full rounded-xl" onClick={() => onSave({ ...draft })}><Check />이 모습으로 대화하기</Button>
  </div>;
}