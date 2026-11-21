import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { randomNickname, validateNickname } from "./identity";

export function NicknameEditor({ nickname, onSave, onClose }: { nickname: string; onSave: (name: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(nickname);
  const [touched, setTouched] = useState(false);
  const error = validateNickname(draft);
  const save = () => { setTouched(true); if (!error) onSave(draft.normalize("NFKC").trim()); };
  return <form onSubmit={(event) => { event.preventDefault(); save(); }}>
    <header className="flex items-center justify-between"><h2 className="text-lg font-bold">닉네임 바꾸기</h2><Button type="button" variant="ghost" size="icon" aria-label="닉네임 편집 취소" onClick={onClose}><X /></Button></header>
    <label htmlFor="nickname" className="mb-2 mt-6 block text-xs font-semibold text-muted-foreground">닉네임</label>
    <input id="nickname" aria-label="새 닉네임" aria-invalid={touched && !!error} aria-describedby="nickname-feedback" autoComplete="off" value={draft} onChange={(event) => { setDraft(event.target.value); setTouched(true); }} className="h-14 w-full min-w-0 rounded-2xl border border-border bg-secondary px-4 text-lg font-semibold outline-none focus:border-primary" />
    <p id="nickname-feedback" role={touched && error ? "alert" : undefined} className={`mt-2 min-h-5 text-xs ${touched && error ? "text-destructive" : "text-muted-foreground"}`}>{touched && error ? error : "한글·영어·숫자, 최대 20자"}</p>
    <Button type="button" variant="secondary" onClick={() => { setDraft(randomNickname(draft)); setTouched(true); }} className="mt-4 h-12 w-full rounded-xl font-semibold"><Shuffle className="h-4 w-4" />랜덤 닉네임</Button>
    <Button type="submit" disabled={!!error} className="mt-6 h-12 w-full rounded-xl font-bold"><Check className="h-4 w-4" />이 닉네임으로 설정</Button>
  </form>;
}