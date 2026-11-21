import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronRight, Clock, Home, Send, Share2, ShieldAlert, Ban, User, X, MapPin, Users, Sun, Moon, Settings2, Check, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { chatSizes, defaultAppearance, type ChatSize, type ThemeMode } from "./appearance";
import { topicImages } from "./topic-images";
import { RippleLogo } from "./RippleLogo";

const WaterSurface = lazy(() => import("./WaterSurface"));

const MotionButton = motion.create(Button);
const AppearanceContext = createContext({
  theme: defaultAppearance.theme,
  chatSize: defaultAppearance.chatSize,
  setTheme: (_value: ThemeMode) => {},
  setChatSize: (_value: ChatSize) => {},
});

 type Screen = "permission" | "home" | "verify" | "lounge" | "room" | "past" | "settings";
type RoomInfo = { tag: string; c: string; place: string; time: string; n: number; past?: boolean };
type Target = { kind: "lounge" } | { kind: "room"; room: RoomInfo };
const nearbyRooms: RoomInfo[] = [
  { tag: "#뉴진스", c: "cover-2", place: "상명대 미래백년관", time: "2026.11.21 14:30", n: 8 },
  { tag: "#학식", c: "cover-4", place: "학생회관 1층", time: "2026.11.21 12:05", n: 5 },
  { tag: "#해커톤", c: "cover-3", place: "상명대 미래백년관", time: "2026.11.21 10:40", n: 14 },
];
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
const roomMsgs: Record<string, Msg[]> = {
  "#학식": [
    { id: 1, nick: "달리는 토끼", emoji: "🐰", text: "오늘 돈가스 줄 엄청 길어요" },
    { id: 2, nick: "민트 고양이", emoji: "🐱", text: "2층 분식 쪽은 한산해요!" },
  ],
  "#해커톤": [
    { id: 1, nick: "새벽 코더", emoji: "🦉", text: "팀 아직 안 구하신 분?" },
    { id: 2, nick: "졸린 판다", emoji: "🐼", text: "프론트 하나 구해요 🙋" },
    { id: 3, nick: "민트 고양이", emoji: "🐱", text: "발표 몇 시부터예요?" },
  ],
};
const pastRooms = [
  { tag: "#뉴진스", place: "상명대 미래백년관", time: "오늘 14:30", n: 8, c: "cover-1" },
  { tag: "#해커톤", place: "상명대 미래백년관", time: "어제 22:10", n: 14, c: "cover-3" },
  { tag: "#학식", place: "학생회관 1층", time: "11.19 12:05", n: 6, c: "cover-4" },
  { tag: "#중간고사", place: "중앙도서관", time: "11.17 01:40", n: 21, c: "cover-2" },
  { tag: "#축제라인업", place: "대운동장", time: "11.14 18:20", n: 33, c: "cover-5" },
];

export function RippleApp() {
  const [theme, setTheme] = useState<ThemeMode>(defaultAppearance.theme);
  const [chatSize, setChatSize] = useState<ChatSize>(defaultAppearance.chatSize);
  const [screen, setRawScreen] = useState<Screen>("permission");
  const shell = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 195, y: 420 });
  const navigating = useRef(false);
  const [returning, setReturning] = useState(false);
  const [wave, setWave] = useState<{ x: number; y: number; radius: number; next: Screen; phase: "expand" | "reveal" } | null>(null);
  const setScreen = (next: Screen, isReturn = false) => {
    if (navigating.current || next === screen) return;
    setReturning(isReturn);
    if (isReturn || (next !== "lounge" && next !== "room")) { setRawScreen(next); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRawScreen(next); return; }
    const box = shell.current?.getBoundingClientRect();
    if (!box) { setRawScreen(next); return; }
    navigating.current = true;
    setWave({ ...origin.current, radius: Math.hypot(box.width,box.height), next, phase: "expand" });
  };
  const [verified, setVerified] = useState(false);
  const [room, setRoom] = useState<RoomInfo>((nearbyRooms[0] ?? { tag: "#뉴진스", c: "cover-2", place: "상명대 미래백년관", time: "오늘", n: 8 }));
  const [roomBack, setRoomBack] = useState<Screen>("lounge");
  const [pending, setPending] = useState<Target>({ kind: "lounge" });
  const openTarget = (t: Target) => {
    if (t.kind === "room") { setRoom(t.room); setRoomBack("home"); setScreen("room"); } else setScreen("lounge");
  };
  const request = (t: Target) => { if (verified) openTarget(t); else { setPending(t); setScreen("verify"); } };
  const tab = screen === "past" ? "past" : screen === "settings" ? "settings" : screen === "home" ? "home" : null;

  return (
    <AppearanceContext.Provider value={{ theme, chatSize, setTheme, setChatSize }}>
    <MotionConfig reducedMotion="user">
    <div className={`${theme === "dark" ? "dark" : ""} ripple-app flex min-h-screen items-center justify-center bg-desk sm:p-6`}>
      <div ref={shell} onClickCapture={(event) => { const button = (event.target as HTMLElement).closest("button"); const box = shell.current?.getBoundingClientRect(); if (button && box) { const target = button.getBoundingClientRect(); origin.current = { x: target.left-box.left+target.width/2, y: target.top-box.top+target.height/2 }; } }} data-chat-size={chatSize} className="phone-shell relative h-[100dvh] w-full overflow-hidden bg-background font-sans text-foreground sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[48px] sm:border sm:border-border sm:shadow-2xl">
        <AnimatePresence mode="sync" custom={returning}>
          <motion.div
            key={screen}
            custom={returning}
            initial={returning ? { opacity: 0, x: -12 } : { opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            variants={{ leaving: (back: boolean) => ({ opacity: 0, x: back ? 16 : 0, transition: { duration: back ? 0.24 : 0.12, ease } }) }}
            exit="leaving"
            transition={{ duration: returning ? 0.24 : 0.12, ease }}
            className="absolute inset-0 z-10 flex flex-col"
          >
            {screen === "permission" && <Permission onAllow={() => setScreen("home")} />}
            {screen === "home" && <HomeScreen onOpen={request} />}
            {screen === "verify" && <Verify onBack={() => setScreen("home")} onDone={() => { setVerified(true); openTarget(pending); }} />}
            {screen === "lounge" && <Lounge onBack={() => setScreen("home", true)} onRoom={() => { setRoom((nearbyRooms[0] ?? { tag: "#뉴진스", c: "cover-2", place: "상명대 미래백년관", time: "오늘", n: 8 })); setRoomBack("lounge"); setScreen("room"); }} />}
            {screen === "room" && <Room key={room.tag} room={room} onBack={() => setScreen(roomBack, true)} />}
            {screen === "past" && <Past onOpen={(rm) => { setRoom({ ...rm, past: true }); setRoomBack("past"); setScreen("room"); }} />}
            {screen === "settings" && <Settings verified={verified} onVerify={() => setScreen("verify")} />}
          </motion.div>
        </AnimatePresence>
        {tab && <TabBar tab={tab} go={setScreen} />}
        {wave && <motion.div data-testid="navigation-wave" key={`${wave.next}-${wave.phase}`} className="navigation-wave absolute inset-0 z-50 overflow-hidden bg-primary" initial={wave.phase === "expand" ? { clipPath: `circle(0px at ${wave.x}px ${wave.y}px)`, opacity: 0.6 } : { opacity: 1 }} animate={wave.phase === "expand" ? { clipPath: `circle(${wave.radius}px at ${wave.x}px ${wave.y}px)`, opacity: 1 } : { opacity: 0 }} transition={wave.phase === "expand" ? { duration: 0.36, ease: [0.25,0.1,0.25,1] } : { duration: 0.22, delay: 0.14, ease: "easeOut" }} onAnimationComplete={() => { if (wave.phase === "expand") { setRawScreen(wave.next); setWave({ ...wave, phase: "reveal" }); } else { setWave(null); navigating.current = false; } }} />}
      </div>
    </div>
    </MotionConfig>
    </AppearanceContext.Provider>
  );
}

function TabBar({ tab, go }: { tab: string; go: (s: Screen) => void }) {
  const items = [
    { k: "home", label: "홈", Icon: Home },
    { k: "past", label: "지난 방", Icon: Clock },
    { k: "settings", label: "내 정보", Icon: User },
  ] as const;
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-background pb-6 pt-3">
      {items.map(({ k, label, Icon }) => (
        <Button variant="ghost" key={k} onClick={() => go(k)} className={`relative h-auto flex flex-col items-center gap-1 px-6 text-[11px] font-semibold transition-colors ${tab === k ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className="h-5 w-5" />{label}
          {tab === k && <motion.span layoutId="tabdot" className="absolute -top-2 h-1 w-1 rounded-full bg-primary" />}
        </Button>
      ))}
    </nav>
  );
}

function Ripples({ size, count = 3, period = 2, className = "" }: { size: number; count?: number; period?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`} style={{ width: size, height: size }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-primary/50 bg-primary/5"
          initial={{ scale: 0.1, opacity: 0.8 }} animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: period * count / 1.5, repeat: Infinity, delay: i * period / 1.5 * (count > 2 ? 1 : 1), ease: "easeOut" }} />
      ))}
    </div>
  );
}

function Permission({ onAllow }: { onAllow: () => void }) {
  return (
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-7 pb-10">
      <div className="relative mt-6 h-56 shrink-0">
        <Ripples size={240} count={4} period={1.2} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><RippleLogo large /></div>
      </div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 text-[30px] font-extrabold leading-tight tracking-normal">
        지금 여기 있는<br />사람들과 이어지려면
      </motion.h1>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        정확한 위치는 근처 약 200m 안에 누가 있는지 판단할 때만 써요. 내 위치는 약 150m 크기의 구역으로만 저장되고, 다른 사람에게는 절대 보이지 않아요.
      </p>
      <div className="mt-auto space-y-4">
        <PrimaryButton onClick={onAllow}>위치 허용하기</PrimaryButton>
        <Button variant="ghost" onClick={onAllow} className="w-full text-sm font-medium text-muted-foreground underline-offset-4 hover:underline">나중에 할게요</Button>
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <MotionButton variant="ghost" whileTap={{ scale: 0.97 }} onClick={onClick} disabled={disabled}
      className="h-14 w-full rounded-2xl bg-primary hover:bg-primary/90 text-[17px] font-bold text-primary-foreground transition-opacity disabled:bg-muted disabled:text-muted-foreground">
      {children}
    </MotionButton>
  );
}

function HomeScreen({ onOpen }: { onOpen: (t: Target) => void }) {
  const [sheet, setSheet] = useState(false);
  const { theme, setTheme } = useContext(AppearanceContext);
  return (
    <div className="water-home no-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28">
      <Suspense fallback={<div className="water-surface absolute inset-0" />}><WaterSurface dark={theme === "dark"} /></Suspense>
      <header className="water-content flex shrink-0 items-center justify-between px-6 pt-6">
        <div><h1><RippleLogo /></h1><p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3" />상명대 미래백년관</p></div>
        <Button variant="secondary" size="icon" aria-label={theme === "light" ? "다크 모드 켜기" : "라이트 모드 켜기"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="h-10 w-10 rounded-full">{theme === "light" ? <Moon /> : <Sun />}</Button>
      </header>
      <div className="water-content mt-8 shrink-0 text-center"><p className="text-[23px] font-semibold leading-snug">지금, <span className="font-bold text-primary">같은 파동</span> 안에</p><p className="mt-2 text-xs text-muted-foreground">가까이 있는 사람들과 가볍게 이어져요</p></div>
      <div className="water-center relative flex min-h-[240px] flex-1 items-center justify-center" aria-label="주변 ripplers 파동">
          <div className="pointer-events-none flex flex-col items-center justify-center">
            <p className="water-count text-[72px] font-semibold tabular-nums leading-none text-foreground">12<span className="ml-1 text-base font-medium text-muted-foreground">명</span></p><p className="mt-3 text-xs font-medium text-muted-foreground">지금 이곳의 ripplers</p>
          </div>
      </div>
      <div className="water-content shrink-0 px-5 text-center"><p className="mb-4 text-xs font-medium text-muted-foreground"><span className="live-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />미래백년관 리플에서 대화 중</p><PrimaryButton onClick={() => setSheet(true)}>미래백년관 리플 참여하기 <ArrowUpRight className="h-4 w-4" /></PrimaryButton></div>
      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <MotionButton variant="ghost" whileTap={{ scale: 0.98 }} onClick={() => onOpen({ kind: "lounge" })} className="cover-2 relative h-auto w-full overflow-hidden rounded-2xl p-6 text-left text-story-foreground"><div className="absolute inset-0 ripple-pattern" /><div className="relative w-full"><p className="text-xs font-semibold opacity-80">지금 이곳 · ripplers 12명</p><p className="mt-2 text-[26px] font-extrabold leading-tight">미래백년관<br />리플 참여하기</p><span className="mt-5 inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-sm font-bold text-primary">바로 들어가기 <ChevronRight className="h-4 w-4" /></span></div></MotionButton>
        <p className="mb-2 mt-5 text-xs font-bold text-muted-foreground">주변 토픽방</p>
        {nearbyRooms.map((rm) => <Button variant="ghost" key={rm.tag} onClick={() => onOpen({ kind: "room", room: rm })} className="h-auto w-full justify-start gap-3 rounded-xl px-2 py-3 text-left"><Cover tag={rm.tag} c={rm.c} /><div className="min-w-0 flex-1"><p className="font-bold">{rm.tag}</p><p className="truncate text-xs text-muted-foreground">{rm.place} · {rm.n}명</p></div><ChevronRight className="text-muted-foreground" /></Button>)}
      </Sheet>
    </div>
  );
}

function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {onBack && <Button variant="ghost" onClick={onBack} aria-label="뒤로" className="bg-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full"><ArrowLeft className="h-5 w-5" /></Button>}
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
    <div className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
      {msgs.map((m, i) => m.bot ? <div key="bot">{bot}</div> : (
        <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }}
          className={`flex gap-2 ${m.me ? "justify-end" : ""}`}>
          {!m.me && <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-lg`}>{m.emoji}</div>}
          <div className={`max-w-[72%] ${m.me ? "items-end" : ""} flex flex-col`}>
            {!m.me && <span className="mb-1 text-[11px] font-semibold text-muted-foreground">{m.nick}</span>}
            <div onPointerDown={() => start(m)} onPointerUp={cancel} onPointerLeave={cancel} onContextMenu={(e) => { e.preventDefault(); if (!m.me) onLong(m); }}
              className={`chat-message select-none rounded-2xl px-3.5 py-2.5 leading-relaxed ${m.me ? "rounded-br-md bg-chat-own font-medium text-chat-own-foreground" : "rounded-tl-md bg-chat-other"}`}>
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
      <input value={text} onChange={(e) => setText(e.target.value)} aria-label="메시지" placeholder="메시지 보내기"
        className="bg-secondary h-12 min-w-0 flex-1 rounded-full border border-transparent px-5 chat-message outline-none placeholder:text-muted-foreground focus:border-primary" />
      <MotionButton variant="ghost" whileTap={{ scale: 0.9 }} aria-label="메시지 보내기" type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Send className="h-5 w-5" />
      </MotionButton>
    </form>
  );
}

function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [container, setContainer] = useState<Element | null>(null);
  useEffect(() => { setContainer(document.querySelector(".phone-shell")); }, []);
  if (!container) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-backdrop absolute inset-0 z-30 bg-foreground/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }} onClick={onClose} />
          <motion.div role="dialog" aria-label="리플 선택 및 설정" aria-modal="true" className="no-scrollbar absolute inset-x-0 bottom-0 z-40 max-h-[90%] overflow-y-auto rounded-t-[28px] border-t border-border bg-popover px-5 pb-8 pt-3"
            initial={{ y: "100%", opacity: 0.8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ duration: 0.22, ease }}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>, container
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
          <Button variant="ghost" onClick={() => { setDone("신고가 접수됐어요"); setTimeout(onClose, 900); }} className="flex h-auto w-full justify-start items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold text-destructive hover:bg-secondary"><ShieldAlert className="h-5 w-5" />신고하기</Button>
          <Button variant="ghost" onClick={() => { setDone(`${target?.nick}님을 차단했어요`); setTimeout(onClose, 900); }} className="flex h-auto w-full justify-start items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold hover:bg-secondary"><Ban className="h-5 w-5" />차단하기</Button>
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
      className="relative my-2 overflow-hidden rounded-2xl border border-border bg-card p-4">
            <div className="relative">
        <p className="text-xs font-bold text-primary">💧 RIPPLE</p>
        <p className="mt-1 text-[14px] font-bold">3명이 '뉴진스' 얘기를 하고 있어요</p>
        <MotionButton variant="ghost" whileTap={{ scale: 0.96 }} onClick={onRoom} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground">#뉴진스방 입장하기</MotionButton>
      </div>
    </motion.div>
  );
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <Header title="미래백년관 리플" sub="지금 이곳에서 나누는 이야기" onBack={onBack} right={<ChatSettingsButton />} />
      <ChatList msgs={chat.msgs} onLong={setTarget} bot={bot} />
      <InputBar {...chat} />
      <ModerationSheet target={target} onClose={() => setTarget(null)} />
    </div>
  );
}

function Cover({ tag, c = "cover-1", big }: { tag: string; c?: string; big?: boolean }) {
  const image = topicImages[tag];
  return (
    <div className={`${c} relative overflow-hidden ${big ? "h-full w-full" : "h-16 w-16 shrink-0 rounded-2xl"}`}>
      {image ? <><img src={image.url} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" /><div className="story-photo-shade absolute inset-0" /></> : <div className="absolute inset-0 ripple-pattern" />}
      <span className={`absolute bottom-2 left-2 font-black tracking-normal text-story-foreground ${big ? "bottom-4 left-4 text-4xl" : "text-[11px]"}`}>{tag}</span>
    </div>
  );
}

function Room({ room, onBack }: { room: RoomInfo; onBack: () => void }) {
  const chat = useChat(roomMsgs[room.tag] ?? roomSeed);
  const [target, setTarget] = useState<Msg | null>(null);
  const [share, setShare] = useState(false);
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <Header title={room.tag} onBack={onBack} right={<div className="flex gap-1"><ChatSettingsButton /><Button variant="ghost" aria-label="방 공유" onClick={() => setShare(true)} className="bg-secondary h-10 w-10 rounded-full"><Share2 /></Button></div>} />
      <div className="px-4">
        <motion.div layoutId="cover" className="h-28 overflow-hidden rounded-2xl"><Cover tag={room.tag} c={room.c} big /></motion.div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">{room.time} · {room.place} · {room.n}명</p>
        <p className="mt-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{room.past ? "지난 방이에요 · 대화를 이어갈 수 있어요" : "이 방은 장소를 떠나도 유지돼요"}</p>
      </div>
      <ChatList msgs={chat.msgs} onLong={setTarget} />
      <InputBar {...chat} />
      <ModerationSheet target={target} onClose={() => setTarget(null)} />
      <AnimatePresence>
        {share && (
          <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/90 p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button variant="ghost" aria-label="공유 닫기" onClick={() => setShare(false)} className="bg-secondary absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full"><X className="h-5 w-5" /></Button>
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ ease, duration: 0.45 }}
              className={`${room.c} relative aspect-[9/16] w-56 overflow-hidden rounded-3xl p-5`}>
              {topicImages[room.tag] && <img src={topicImages[room.tag]?.url} alt={topicImages[room.tag]?.alt ?? "토픽 사진"} className="absolute inset-0 h-full w-full object-cover" />}
              <div className="story-photo-shade absolute inset-0" />
              <div className="relative flex h-full flex-col text-story-foreground">
                <p className="text-xs font-black">💧 Ripple</p>
                <p className="story-title mt-auto text-5xl font-black">{room.tag}</p>
                <p className="mt-2 text-[11px] font-semibold">{room.time}<br />{room.place} · {room.n}명</p>
              </div>
            </motion.div>
            <p className="mt-6 text-sm text-muted-foreground">지금 여기서 시작된 이야기</p>
            <div className="mt-4 w-full"><PrimaryButton onClick={() => setShare(false)}>스토리에 공유하기</PrimaryButton></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Past({ onOpen }: { onOpen: (r: RoomInfo) => void }) {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <h1 className="mt-4 text-[30px] font-extrabold tracking-normal">이곳의 지난 방</h1>
      <p className="mt-1 text-sm text-muted-foreground">상명대 미래백년관 근처에서 열렸던 방이에요</p>
      <div className="mt-6 space-y-3">
        {pastRooms.map((r, i) => (
          <MotionButton variant="ghost" key={r.tag} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, ease }}
            onClick={() => onOpen(r)} whileTap={{ scale: 0.98 }} className="flex w-full items-center gap-4 h-auto rounded-2xl bg-card p-3 text-left">
            <Cover tag={r.tag} c={r.c} />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-extrabold">{r.tag}</p>
              <p className="truncate text-xs text-muted-foreground">{r.place} · {r.time}</p>
              <p className="mt-1 text-xs font-semibold text-primary"><Users className="mr-1 inline h-3 w-3" />{r.n}명</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </MotionButton>
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
    <div className="flex min-h-0 flex-1 flex-col pb-8">
      <Header title="" onBack={onBack} />
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-6">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-normal">휴대폰 번호로<br />한 번만 인증할게요</h1>
        <p className="mt-2 text-sm text-muted-foreground">상대에게는 닉네임만 보여요</p>
        <div className="mt-8 flex gap-2">
          <input inputMode="numeric" value={phone} onChange={(e) => setPhone(fmt(e.target.value))} placeholder="010-0000-0000"
            aria-label="휴대폰 번호" className="bg-secondary h-14 min-w-0 flex-1 rounded-2xl border border-transparent px-5 text-lg font-semibold outline-none focus:border-primary" />
          <Button variant="ghost" disabled={phone.length < 12} onClick={() => setSent(true)} className="shrink-0 rounded-2xl bg-secondary px-4 text-sm font-bold disabled:opacity-40">{sent ? "재전송" : "인증번호"}</Button>
        </div>
        <AnimatePresence>
          {sent && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">인증번호 6자리 (아무 숫자나 입력)</p>
              <div className="relative flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`flex h-14 min-w-0 flex-1 items-center justify-center rounded-2xl border text-2xl font-bold ${code.length === i ? "border-primary" : "border-border"} bg-secondary`}>{code[i] ?? ""}</div>
                ))}
                <input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="absolute inset-0 opacity-0" aria-label="인증번호" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-auto pt-6"><PrimaryButton disabled={code.length < 6} onClick={onDone}>인증하고 시작하기</PrimaryButton></div>
      </div>
    </div>
  );
}

function AppearanceControls() {
  const { theme, chatSize, setTheme, setChatSize } = useContext(AppearanceContext);
  return (
    <section className="mt-6">
      <p className="mb-3 text-xs font-bold text-muted-foreground">화면과 대화</p>
      <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">화면 모드</span><div className="flex gap-1 rounded-xl bg-secondary p-1">{(["light", "dark"] as const).map((mode) => <Button variant="ghost" key={mode} aria-pressed={theme === mode} onClick={() => setTheme(mode)} className={`h-9 rounded-lg px-3 text-xs ${theme === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{mode === "light" ? <Sun /> : <Moon />}{mode === "light" ? "라이트" : "다크"}</Button>)}</div></div>
      <div className="mt-4 flex items-center justify-between"><label className="text-sm font-semibold" htmlFor="chat-font-size">대화 글자 크기</label><span className="text-xs font-semibold text-primary">{chatSizes[chatSize].label}</span></div>
      <input id="chat-font-size" aria-label="대화 글자 크기" className="font-slider mt-4 w-full accent-primary" type="range" min={0} max={3} step={1} value={Object.keys(chatSizes).indexOf(chatSize)} onChange={(e) => { const next = (Object.keys(chatSizes) as ChatSize[])[Number(e.target.value)]; if (next) setChatSize(next); }} />
      <div className="mt-1 flex justify-between text-[10px] font-medium text-muted-foreground"><span>작게</span><span>기본</span><span>크게</span><span>더 크게</span></div>
      <div className="mt-5 flex flex-col gap-2 border-y border-border py-4"><span className="text-[10px] text-muted-foreground">느긋한 곰</span><div className="chat-message max-w-[90%] self-end rounded-2xl rounded-br-sm bg-chat-own px-3.5 py-2.5 leading-relaxed text-chat-own-foreground">같은 곳에 있으니까 더 반갑다 👋</div></div>
    </section>
  );
}

function ChatSettingsButton() {
  const [open, setOpen] = useState(false);
  return <><Button variant="secondary" size="icon" aria-label="대화 화면 설정" onClick={() => setOpen(true)} className="h-10 w-10 rounded-full"><Settings2 /></Button><Sheet open={open} onClose={() => setOpen(false)}><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">내게 편한 대화</h2><Button variant="ghost" size="icon" aria-label="설정 닫기" onClick={() => setOpen(false)}><X /></Button></div><AppearanceControls /><Button className="mt-5 h-12 w-full rounded-xl" onClick={() => setOpen(false)}><Check />완료</Button></Sheet></>;
}

function Settings({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  const [blocked, setBlocked] = useState(["새벽 코더", "시끄러운 오리"]);
  const reports = [{ who: "시끄러운 오리", when: "11.19", st: "처리 완료" }, { who: "익명 여우", when: "11.12", st: "검토 중" }];
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl">🐻</div>
        <div>
          <p className="text-xs text-muted-foreground">닉네임</p>
          <p className="text-2xl font-extrabold">느긋한 곰</p>
        </div>
      </div>
      {!verified && <Button variant="ghost" onClick={onVerify} className="mt-5 flex h-auto w-full items-center justify-between rounded-3xl border border-primary/40 bg-primary/10 p-4 text-sm font-bold text-primary">휴대폰 인증하기<ChevronRight className="h-4 w-4" /></Button>}
      <AppearanceControls />
      <Section title={`차단한 사용자 ${blocked.length}`}>
        {blocked.length === 0 && <div className="py-5 text-center"><span className="empty-illustration" aria-hidden="true">🕊️</span><p className="mt-2 text-sm font-bold">여긴 평화로운 구역</p><p className="mt-1 text-xs text-muted-foreground">차단한 사람이 없어요. 이대로 쭉!</p></div>}
        <AnimatePresence>
          {blocked.map((b) => (
            <motion.div key={b} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">{b}</span>
              <Button variant="ghost" onClick={() => setBlocked((l) => l.filter((x) => x !== b))} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">차단 해제</Button>
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
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
