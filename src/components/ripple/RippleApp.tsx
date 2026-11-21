import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ChevronRight, Clock, Home, Send, Share2, ShieldAlert, Ban, User, X, MapPin, Users } from "lucide-react";

type Screen = "permission" | "home" | "verify" | "lounge" | "room" | "past" | "settings";
type Msg = { id: number; nick: string; emoji: string; text: string; me?: boolean; bot?: boolean };

const ease = [0.22, 1, 0.36, 1] as const;

const loungeSeed: Msg[] = [
  { id: 1, nick: "졸린 판다", emoji: "🐼", text: "여기 3층 콘센트 자리 아직 남았나요?" },
  { id: 2, nick: "새벽 코더", emoji: "🦉", text: "창가 쪽 두 자리 비어 있어요!" },
  { id: 3, nick: "민트 고양이", emoji: "🐱", text: "근데 오늘 뉴진스 신곡 들으신 분?" },
  { id: 4, nick: "졸린 판다", emoji: "🐼", text: "헐 저 아침부터 반복 재생 중ㅋㅋ" },
  { id: 0, nick: "Ripple", emoji: "💧", text: "", bot: true },
  { id: 5, nick: "달리는 토끼", emoji: "🐰", text: "학식 오늘 돈가스래요 🍛" },
];
const roomSeed: Msg[] = [
  { id: 1, nick: "민트 고양이", emoji: "🐱", text: "후렴 진짜 중독성 미쳤어요" },
  { id: 2, nick: "졸린 판다", emoji: "🐼", text: "뮤비 장소 어딘지 아시는 분?" },
  { id: 3, nick: "새벽 코더", emoji: "🦉", text: "코딩하면서 듣기 딱 좋음" },
];
const pastRooms = [
  { tag: "#뉴진스", place: "상명대 미래백년관", time: "오늘 14:30", n: 8, c: "cover-1" },
  { tag: "#해커톤", place: "상명대 미래백년관", time: "어제 22:10", n: 14, c: "cover-3" },
  { tag: "#학식", place: "학생회관 1층", time: "11.19 12:05", n: 6, c: "cover-4" },
  { tag: "#중간고사", place: "중앙도서관", time: "11.17 01:40", n: 21, c: "cover-2" },
  { tag: "#축제라인업", place: "대운동장", time: "11.14 18:20", n: 33, c: "cover-5" },
];

export function RippleApp() {
  const [screen, setScreen] = useState<Screen>("permission");
  const [verified, setVerified] = useState(false);
  const tab = screen === "past" ? "past" : screen === "settings" ? "settings" : screen === "home" ? "home" : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-desk sm:p-6">
      <div className="relative h-[100dvh] w-full overflow-hidden bg-background font-sans text-foreground sm:h-[844px] sm:w-[390px] sm:rounded-[48px] sm:border sm:border-border sm:shadow-2xl">
        <div className="pointer-events-none absolute inset-0 glow-purple" />
        <div className="relative z-10 flex h-11 items-center justify-between px-8 text-xs font-semibold">
          <span>13:43</span><span>●●● 5G</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.35, ease }}
            className="absolute inset-x-0 bottom-0 top-11 z-10 flex flex-col"
          >
            {screen === "permission" && <Permission onAllow={() => setScreen("home")} />}
            {screen === "home" && <HomeScreen onTalk={() => setScreen(verified ? "lounge" : "verify")} />}
            {screen === "verify" && <Verify onBack={() => setScreen("home")} onDone={() => { setVerified(true); setScreen("lounge"); }} />}
            {screen === "lounge" && <Lounge onBack={() => setScreen("home")} onRoom={() => setScreen("room")} />}
            {screen === "room" && <Room onBack={() => setScreen("lounge")} />}
            {screen === "past" && <Past />}
            {screen === "settings" && <Settings verified={verified} onVerify={() => setScreen("verify")} />}
          </motion.div>
        </AnimatePresence>
        {tab && <TabBar tab={tab} go={setScreen} />}
      </div>
    </div>
  );
}

function TabBar({ tab, go }: { tab: string; go: (s: Screen) => void }) {
  const items = [
    { k: "home", label: "홈", Icon: Home },
    { k: "past", label: "지난 방", Icon: Clock },
    { k: "settings", label: "내 정보", Icon: User },
  ] as const;
  return (
    <nav className="glass absolute inset-x-0 bottom-0 z-20 flex justify-around rounded-t-3xl pb-6 pt-3">
      {items.map(({ k, label, Icon }) => (
        <button key={k} onClick={() => go(k)} className={`relative flex flex-col items-center gap-1 px-6 text-[11px] font-semibold transition-colors ${tab === k ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />{label}
          {tab === k && <motion.span layoutId="tabdot" className="absolute -top-2 h-1 w-1 rounded-full bg-primary" />}
        </button>
      ))}
    </nav>
  );
}

function Ripples({ size, count = 3, period = 2, className = "" }: { size: number; count?: number; period?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`} style={{ width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-primary"
          initial={{ scale: 0.1, opacity: 0.8 }} animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: period * count / 1.5, repeat: Infinity, delay: i * period / 1.5 * (count > 2 ? 1 : 1), ease: "easeOut" }} />
      ))}
    </div>
  );
}

function Permission({ onAllow }: { onAllow: () => void }) {
  return (
    <div className="flex flex-1 flex-col px-7 pb-10">
      <div className="relative mt-10 h-64">
        <Ripples size={240} count={4} period={1.2} />
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-lime" />
      </div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 text-[30px] font-extrabold leading-tight tracking-tight">
        지금 여기 있는<br />사람들과 이어지려면
      </motion.h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        정확한 위치는 근처 약 200m 안에 누가 있는지 판단할 때만 써요. 내 위치는 약 150m 크기의 구역으로만 저장되고, 다른 사람에게는 절대 보이지 않아요.
      </p>
      <div className="mt-auto space-y-4">
        <PrimaryButton onClick={onAllow}>위치 허용하기</PrimaryButton>
        <button onClick={onAllow} className="w-full text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">나중에 할게요</button>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
      className="h-16 w-full rounded-full bg-primary text-[17px] font-extrabold text-primary-foreground shadow-lime transition-opacity disabled:opacity-30 disabled:shadow-none">
      {children}
    </motion.button>
  );
}

function HomeScreen({ onTalk }: { onTalk: () => void }) {
  const count = 12;
  const dots = [[-110, -40], [95, -95], [120, 60], [-70, 110], [30, 140], [-130, 50], [60, -150], [-40, -140], [140, -20], [-100, -110], [10, -80], [85, 115]];
  const chips = [{ t: "#뉴진스", x: -95, y: -120 }, { t: "#학식", x: 90, y: 30 }, { t: "#해커톤", x: -70, y: 150 }];
  return (
    <div className="flex flex-1 flex-col pb-28">
      <div className="flex items-center justify-between px-6 pt-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground"><MapPin className="mr-1 inline h-3 w-3" />상명대 미래백년관 근처</p>
          <h1 className="text-[28px] font-extrabold tracking-tight">Ripple</h1>
        </div>
      </div>
      <div className="relative flex-1">
        {[120, 220, 320].map((s) => (
          <div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border" style={{ width: s, height: s }} />
        ))}
        <Ripples size={360} count={3} period={2} />
        {dots.slice(0, count).map(([x, y], i) => (
          <motion.span key={i} className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full bg-accent blur-[3px]"
            style={{ x: (x ?? 0) - 8, y: (y ?? 0) - 8 }}
            animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }} />
        ))}
        {chips.map((c, i) => (
          <motion.span key={c.t} className="glass absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold"
            style={{ marginLeft: c.x, marginTop: c.y }}
            animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 }}>{c.t}</motion.span>
        ))}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="mb-3 whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
            주변 ripplers {count >= 3 ? `${count}명` : "몇 명"}
          </span>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-4xl shadow-lime">🐻</div>
          <span className="mt-2 text-sm font-bold">나</span>
        </div>
      </div>
      <div className="space-y-3 px-5">
        <div className="glass flex items-center gap-3 rounded-full px-4 py-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1.2, ease }} />
          </div>
          <span className="text-xs font-semibold">2명 더 모이면 라운지가 열려요</span>
        </div>
        <PrimaryButton onClick={onTalk}>지금 여기 사람들과 이야기하기</PrimaryButton>
      </div>
    </div>
  );
}

function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {onBack && <button onClick={onBack} className="glass flex h-10 w-10 items-center justify-center rounded-full"><ArrowLeft className="h-5 w-5" /></button>}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-extrabold">{title}</h1>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function useChat(seed: Msg[]) {
  const [msgs, setMsgs] = useState(seed);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: Date.now(), nick: "나", emoji: "🐻", text: text.trim(), me: true }]);
    setText("");
  };
  return { msgs, text, setText, send };
}

function ChatList({ msgs, onLong, bot }: { msgs: Msg[]; onLong: (m: Msg) => void; bot?: ReactNode }) {
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);
  const start = (m: Msg) => { if (m.me) return; timer.current = setTimeout(() => onLong(m), 450); };
  const cancel = () => { if (timer.current) clearTimeout(timer.current); };
  return (
    <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-2">
      {msgs.map((m, i) => m.bot ? <div key="bot">{bot}</div> : (
        <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }}
          className={`flex gap-2 ${m.me ? "justify-end" : ""}`}>
          {!m.me && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-lg">{m.emoji}</div>}
          <div className={`max-w-[72%] ${m.me ? "items-end" : ""} flex flex-col`}>
            {!m.me && <span className="mb-1 text-[11px] font-semibold text-muted-foreground">{m.nick}</span>}
            <div onPointerDown={() => start(m)} onPointerUp={cancel} onPointerLeave={cancel} onContextMenu={(e) => { e.preventDefault(); if (!m.me) onLong(m); }}
              className={`select-none rounded-3xl px-4 py-2.5 text-[15px] leading-snug ${m.me ? "rounded-br-md bg-primary font-medium text-primary-foreground" : "rounded-tl-md bg-secondary"}`}>
              {m.text}
            </div>
          </div>
        </motion.div>
      ))}
      <div ref={end} />
    </div>
  );
}

function InputBar({ text, setText, send }: { text: string; setText: (s: string) => void; send: () => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 px-4 pb-8 pt-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지 보내기"
        className="glass h-12 min-w-0 flex-1 rounded-full px-5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary" />
      <motion.button whileTap={{ scale: 0.9 }} type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Send className="h-5 w-5" />
      </motion.button>
    </form>
  );
}

function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="absolute inset-0 z-30 bg-background/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="absolute inset-x-0 bottom-0 z-40 rounded-t-[32px] border-t border-border bg-popover px-5 pb-10 pt-3"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ModerationSheet({ target, onClose }: { target: Msg | null; onClose: () => void }) {
  const [done, setDone] = useState<string | null>(null);
  useEffect(() => setDone(null), [target]);
  return (
    <Sheet open={!!target} onClose={onClose}>
      {done ? (
        <p className="py-6 text-center font-semibold">{done}</p>
      ) : (
        <>
          <p className="mb-3 px-1 text-sm text-muted-foreground">{target?.nick}님의 메시지</p>
          <button onClick={() => { setDone("신고가 접수됐어요"); setTimeout(onClose, 900); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold text-destructive hover:bg-secondary"><ShieldAlert className="h-5 w-5" />신고하기</button>
          <button onClick={() => { setDone(`${target?.nick}님을 차단했어요`); setTimeout(onClose, 900); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold hover:bg-secondary"><Ban className="h-5 w-5" />차단하기</button>
        </>
      )}
    </Sheet>
  );
}

function Lounge({ onBack, onRoom }: { onBack: () => void; onRoom: () => void }) {
  const chat = useChat(loungeSeed);
  const [target, setTarget] = useState<Msg | null>(null);
  const bot = (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
      className="relative my-2 overflow-hidden rounded-3xl border border-primary/40 bg-card p-5">
      <div className="absolute inset-0 ripple-pattern opacity-50" />
      <div className="relative">
        <p className="text-xs font-bold text-primary">💧 RIPPLE</p>
        <p className="mt-1 text-[17px] font-extrabold">3명이 '뉴진스' 얘기를 하고 있어요</p>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onRoom} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground shadow-lime">#뉴진스방 입장하기</motion.button>
      </div>
    </motion.div>
  );
  return (
    <div className="relative flex flex-1 flex-col">
      <Header title="미래백년관 라운지 · ripplers 12명" sub="메시지를 길게 누르면 신고·차단할 수 있어요" onBack={onBack} />
      <ChatList msgs={chat.msgs} onLong={setTarget} bot={bot} />
      <InputBar {...chat} />
      <ModerationSheet target={target} onClose={() => setTarget(null)} />
    </div>
  );
}

function Cover({ tag, c = "cover-1", big }: { tag: string; c?: string; big?: boolean }) {
  return (
    <div className={`${c} relative overflow-hidden ${big ? "h-full w-full" : "h-16 w-16 shrink-0 rounded-2xl"}`}>
      <div className="absolute inset-0 ripple-pattern" />
      <span className={`absolute bottom-2 left-2 font-black tracking-tight text-primary-foreground ${big ? "bottom-5 left-5 text-5xl" : "text-[11px]"}`}>{tag}</span>
    </div>
  );
}

function Room({ onBack }: { onBack: () => void }) {
  const chat = useChat(roomSeed);
  const [target, setTarget] = useState<Msg | null>(null);
  const [share, setShare] = useState(false);
  return (
    <div className="relative flex flex-1 flex-col">
      <Header title="#뉴진스" onBack={onBack} right={<button onClick={() => setShare(true)} className="glass flex h-10 w-10 items-center justify-center rounded-full"><Share2 className="h-5 w-5" /></button>} />
      <div className="px-4">
        <motion.div layoutId="cover" className="h-44 overflow-hidden rounded-3xl shadow-2xl"><Cover tag="#뉴진스" big /></motion.div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">2026.11.21 14:30 · 상명대 미래백년관 · 8명</p>
        <p className="mt-2 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">이 방은 장소를 떠나도 유지돼요</p>
      </div>
      <ChatList msgs={chat.msgs} onLong={setTarget} />
      <InputBar {...chat} />
      <ModerationSheet target={target} onClose={() => setTarget(null)} />
      <AnimatePresence>
        {share && (
          <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/90 p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => setShare(false)} className="glass absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full"><X className="h-5 w-5" /></button>
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ ease, duration: 0.45 }}
              className="cover-1 relative aspect-[9/16] w-56 overflow-hidden rounded-3xl p-5 shadow-lime">
              <div className="absolute inset-0 ripple-pattern" />
              <div className="relative flex h-full flex-col text-primary-foreground">
                <p className="text-xs font-black">💧 Ripple</p>
                <p className="mt-auto text-4xl font-black">#뉴진스</p>
                <p className="mt-2 text-[11px] font-semibold">2026.11.21 14:30<br />상명대 미래백년관 · 8명</p>
              </div>
            </motion.div>
            <p className="mt-6 text-sm text-muted-foreground">스토리 크기 카드 미리보기</p>
            <div className="mt-4 w-full"><PrimaryButton onClick={() => setShare(false)}>스토리에 공유하기</PrimaryButton></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Past() {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <h1 className="mt-4 text-[30px] font-extrabold tracking-tight">이곳의 지난 방</h1>
      <p className="mt-1 text-sm text-muted-foreground">상명대 미래백년관 근처에서 열렸던 방이에요</p>
      <div className="mt-6 space-y-3">
        {pastRooms.map((r, i) => (
          <motion.button key={r.tag} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, ease }}
            whileTap={{ scale: 0.98 }} className="flex w-full items-center gap-4 rounded-3xl bg-card p-3 text-left">
            <Cover tag="" c={r.c} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-extrabold">{r.tag}</p>
              <p className="truncate text-xs text-muted-foreground">{r.place} · {r.time}</p>
              <p className="mt-1 text-xs font-semibold text-primary"><Users className="mr-1 inline h-3 w-3" />{r.n}명</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function Verify({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const fmt = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 11); return d.length > 7 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length > 3 ? `${d.slice(0, 3)}-${d.slice(3)}` : d; };
  return (
    <div className="flex flex-1 flex-col pb-10">
      <Header title="" onBack={onBack} />
      <div className="flex flex-1 flex-col px-6">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-tight">휴대폰 번호로<br />한 번만 인증할게요</h1>
        <p className="mt-2 text-sm text-muted-foreground">상대에게는 닉네임만 보여요</p>
        <div className="mt-8 flex gap-2">
          <input inputMode="numeric" value={phone} onChange={(e) => setPhone(fmt(e.target.value))} placeholder="010-0000-0000"
            className="glass h-14 flex-1 rounded-2xl px-5 text-lg font-semibold outline-none focus:border-primary" />
          <button disabled={phone.length < 12} onClick={() => setSent(true)} className="rounded-2xl bg-secondary px-4 text-sm font-bold disabled:opacity-40">{sent ? "재전송" : "인증번호"}</button>
        </div>
        <AnimatePresence>
          {sent && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">인증번호 6자리 (아무 숫자나 입력)</p>
              <div className="relative flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`flex h-14 w-12 items-center justify-center rounded-2xl border text-2xl font-bold ${code.length === i ? "border-primary" : "border-border"} bg-glass`}>{code[i] ?? ""}</div>
                ))}
                <input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 opacity-0" aria-label="인증번호" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-auto"><PrimaryButton disabled={code.length < 6} onClick={onDone}>인증하고 시작하기</PrimaryButton></div>
      </div>
    </div>
  );
}

function Settings({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  const [blocked, setBlocked] = useState(["새벽 코더", "시끄러운 오리"]);
  const reports = [{ who: "시끄러운 오리", when: "11.19", st: "처리 완료" }, { who: "익명 여우", when: "11.12", st: "검토 중" }];
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl shadow-lime">🐻</div>
        <div>
          <p className="text-xs text-muted-foreground">닉네임</p>
          <p className="text-2xl font-extrabold">느긋한 곰</p>
        </div>
      </div>
      {!verified && <button onClick={onVerify} className="mt-5 flex w-full items-center justify-between rounded-3xl border border-primary/40 bg-primary/10 p-4 text-sm font-bold text-primary">휴대폰 인증하기<ChevronRight className="h-4 w-4" /></button>}
      <Section title={`차단한 사용자 ${blocked.length}`}>
        {blocked.length === 0 && <p className="p-4 text-sm text-muted-foreground">차단한 사용자가 없어요</p>}
        <AnimatePresence>
          {blocked.map((b) => (
            <motion.div key={b} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">{b}</span>
              <button onClick={() => setBlocked((l) => l.filter((x) => x !== b))} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">차단 해제</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </Section>
      <Section title="신고 내역">
        {reports.map((r) => (
          <div key={r.who} className="flex items-center justify-between px-4 py-3.5">
            <span className="font-semibold">{r.who} <span className="text-xs text-muted-foreground">· {r.when}</span></span>
            <span className={`text-xs font-bold ${r.st === "처리 완료" ? "text-primary" : "text-muted-foreground"}`}>{r.st}</span>
          </div>
        ))}
      </Section>
      <Section title="문의">
        <a href="mailto:help@ripple.app" className="flex items-center justify-between px-4 py-3.5 font-semibold">help@ripple.app<ChevronRight className="h-4 w-4 text-muted-foreground" /></a>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-7">
      <p className="mb-2 px-1 text-xs font-bold text-muted-foreground">{title}</p>
      <div className="divide-y divide-border overflow-hidden rounded-3xl bg-card">{children}</div>
    </div>
  );
}
