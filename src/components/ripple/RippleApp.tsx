import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import { ArrowLeft, ChevronRight, Reply as ReplyIcon, Home, Send, Share2, ShieldAlert, Ban, User, X, MapPin, Users, Sun, Moon, Settings2, Check, ArrowUpRight, Pencil, Bell, BellOff, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { chatSizes, defaultAppearance, type ChatSize, type ThemeMode } from "./appearance";
import { topicImages } from "./topic-images";
import { nearbyRooms, initialJoinedRooms, joinRoom, createMessage, isReplySwipe, shouldSubmitChatKey, leaveJoinedRoom, toggleRoomMute, type RoomInfo, type Msg } from "./rooms";
import { RippleLogo } from "./RippleLogo";
import { Character } from "./Character";
import { CharacterEditor } from "./CharacterEditor";
import { NicknameEditor } from "./NicknameEditor";
import { RoomListItem } from "./RoomListItem";
import { SwimmingRipplers, nearbyRipplerCount } from "./SwimmingRipplers";
import { blockUser, createReport, initialUser, rememberRoomNickname, visibleMessages, type BlockedUser, type ReportRecord, type UserIdentity } from "./identity";
import { avatarForNickname, defaultAvatar, type Avatar } from "./avatar";

const WaterSurface = lazy(() => import("./WaterSurface"));

const MotionButton = motion.create(Button);
const CharacterContext = createContext({ avatar: defaultAvatar, setAvatar: (_value: Avatar) => {} });
const IdentityContext = createContext({
  user: initialUser,
  setNickname: (_nickname: string) => {},
  roomNicknames: {} as Record<string, string>,
  blocked: [] as BlockedUser[],
  reports: [] as ReportRecord[],
  block: (_message: Msg) => {},
  unblock: (_userId: string) => {},
  report: (_message: Msg, _roomId: string) => {},
});
const AppearanceContext = createContext({
  theme: defaultAppearance.theme,
  chatSize: defaultAppearance.chatSize,
  setTheme: (_value: ThemeMode, _animate = true) => {},
  setChatSize: (_value: ChatSize) => {},
});

 type Screen = "splash" | "permission" | "home" | "verify" | "lounge" | "room" | "nearby" | "past" | "settings";
type Target = { kind: "lounge" } | { kind: "room"; room: RoomInfo };
const ease = [0.22, 1, 0.36, 1] as const;

const loungeSeed: Msg[] = [
  { id: 1, userId: "rippler-panda", nick: "졸린 판다", emoji: "🐼", text: "여기 3층 콘센트 자리 아직 남았나요?" },
  { id: 2, userId: "rippler-coder", nick: "새벽 코더", emoji: "🦉", text: "창가 쪽 두 자리 비어 있어요!" },
  { id: 3, userId: "rippler-mint", nick: "민트 고양이", emoji: "🐱", text: "근데 오늘 뉴진스 신곡 들으신 분?" },
  { id: 4, userId: "rippler-panda", nick: "졸린 판다", emoji: "🐼", text: "헐 저 아침부터 반복 재생 중ㅋㅋ" },
  { id: 0, userId: "ripple-bot", nick: "Ripple", emoji: "💧", text: "", bot: true },
  { id: 5, userId: "rippler-rabbit", nick: "달리는 토끼", emoji: "🐰", text: "학식 오늘 돈가스래요 🍛" },
];
const roomSeed: Msg[] = [
  { id: 1, userId: "rippler-mint", nick: "민트 고양이", emoji: "🐱", text: "후렴 진짜 중독성 미쳤어요" },
  { id: 2, userId: "rippler-panda", nick: "졸린 판다", emoji: "🐼", text: "뮤비 장소 어딘지 아시는 분?" },
  { id: 3, userId: "rippler-coder", nick: "새벽 코더", emoji: "🦉", text: "코딩하면서 듣기 딱 좋음" },
];
const roomMsgs: Record<string, Msg[]> = {
  "#학식": [
    { id: 1, userId: "rippler-rabbit", nick: "달리는 토끼", emoji: "🐰", text: "오늘 돈가스 줄 엄청 길어요" },
    { id: 2, userId: "rippler-mint", nick: "민트 고양이", emoji: "🐱", text: "2층 분식 쪽은 한산해요!" },
  ],
  "#해커톤": [
    { id: 1, userId: "rippler-coder", nick: "새벽 코더", emoji: "🦉", text: "팀 아직 안 구하신 분?" },
    { id: 2, userId: "rippler-panda", nick: "졸린 판다", emoji: "🐼", text: "프론트 하나 구해요 🙋" },
    { id: 3, userId: "rippler-mint", nick: "민트 고양이", emoji: "🐱", text: "발표 몇 시부터예요?" },
  ],
};
export function RippleApp() {
  const [user, setUser] = useState<UserIdentity>(initialUser);
  const [roomNicknames, setRoomNicknames] = useState<Record<string, string>>(() => Object.fromEntries(initialJoinedRooms.map((rm) => [rm.id, initialUser.nickname])));
  const rememberNickname = (roomId: string) => setRoomNicknames((names) => rememberRoomNickname(names, roomId, user.nickname));
  const [blocked, setBlocked] = useState<BlockedUser[]>([{ userId: "rippler-noisy", nickname: "시끄러운 오리" }]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const block = (message: Msg) => { if (message.userId !== user.id) setBlocked((entries) => blockUser(entries, { userId: message.userId, nickname: message.nick })); };
  const report = (message: Msg, roomId: string) => { if (message.userId !== user.id) setReports((entries) => [createReport(message, roomId, Date.now(), new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })), ...entries]); };
  const [avatar, setAvatar] = useState<Avatar>({ ...defaultAvatar });
  const [theme, setRawTheme] = useState<ThemeMode>(defaultAppearance.theme);
  const [chatSize, setChatSize] = useState<ChatSize>(defaultAppearance.chatSize);
  const [screen, setRawScreen] = useState<Screen>("splash");
  const [waterMounted, setWaterMounted] = useState(false);
  const [waterReady, setWaterReady] = useState(false);
  const [splashMinimum, setSplashMinimum] = useState(false);
  useEffect(() => { setWaterMounted(true); }, []);
  useEffect(() => {
    const minimum = setTimeout(() => setSplashMinimum(true), 850);
    const maximum = setTimeout(() => setRawScreen((current) => current === "splash" ? "permission" : current), 2800);
    return () => { clearTimeout(minimum); clearTimeout(maximum); };
  }, []);
  useEffect(() => { if (waterReady && splashMinimum) setRawScreen((current) => current === "splash" ? "permission" : current); }, [waterReady, splashMinimum]);
  const shell = useRef<HTMLDivElement>(null);
  const origin = useRef({ x: 195, y: 420 });
  const navigating = useRef(false);
  const changingTheme = useRef(false);
  const setTheme = (next: ThemeMode, animate = true) => {
    if (next === theme || changingTheme.current) return;
    if (!animate || !document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRawTheme(next); return; }
    const box = shell.current?.getBoundingClientRect();
    const x = (box?.left ?? 0) + origin.current.x;
    const y = (box?.top ?? 0) + origin.current.y;
    const radius = Math.hypot(Math.max(x, window.innerWidth-x), Math.max(y, window.innerHeight-y));
    changingTheme.current = true;
    const transition = document.startViewTransition(() => { flushSync(() => setRawTheme(next)); });
    void transition.ready.then(() => {
      document.documentElement.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { duration: 480, easing: "cubic-bezier(0.25,0.1,0.25,1)", fill: "both", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {}).finally(() => { void transition.finished.catch(() => {}).finally(() => { changingTheme.current = false; }); });
  };
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
  const [room, setRoom] = useState<RoomInfo>(initialJoinedRooms[0] ?? { id: "future-newjeans-1121", tag: "#뉴진스", c: "cover-2", place: "상명대 미래백년관", time: "2026.11.21 14:30", n: 8, nearby: true });
  const [joinedRooms, setJoinedRooms] = useState(initialJoinedRooms);
  const [mutedRooms, setMutedRooms] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, Msg[]>>({});
  const updateMessages = (id: string, msgs: Msg[]) => setMessages((current) => ({ ...current, [id]: msgs }));
  const enterRoom = (rm: RoomInfo, back: Screen) => { rememberNickname(rm.id); setJoinedRooms((current) => joinRoom(current, rm)); setRoom(rm); setRoomBack(back); setScreen("room"); };
  const [roomBack, setRoomBack] = useState<Screen>("lounge");
  const [pending, setPending] = useState<Target>({ kind: "lounge" });
  const openTarget = (t: Target) => {
    if (t.kind === "room") enterRoom(t.room, "home"); else { rememberNickname("lounge-future"); setScreen("lounge"); }
  };
  const request = (t: Target) => { if (verified) openTarget(t); else { setPending(t); setScreen("verify"); } };
  const tab = screen === "past" || screen === "nearby" || screen === "settings" || screen === "home" ? screen : null;

  return (
    <IdentityContext.Provider value={{ user, setNickname: (nickname) => setUser((current) => ({ ...current, nickname })), roomNicknames, blocked, reports, block, unblock: (userId) => setBlocked((entries) => entries.filter((entry) => entry.userId !== userId)), report }}>
    <CharacterContext.Provider value={{ avatar, setAvatar }}>
    <AppearanceContext.Provider value={{ theme, chatSize, setTheme, setChatSize }}>
    <MotionConfig reducedMotion="user">
    <div className={`${theme === "dark" ? "dark" : ""} ripple-app flex min-h-screen items-center justify-center bg-desk sm:p-6`}>
      <div ref={shell} onClickCapture={(event) => { const button = (event.target as HTMLElement).closest("button"); const box = shell.current?.getBoundingClientRect(); if (button && box) { const target = button.getBoundingClientRect(); origin.current = { x: target.left-box.left+target.width/2, y: target.top-box.top+target.height/2 }; } }} data-chat-size={chatSize} className="phone-shell relative h-[100dvh] w-full overflow-hidden bg-background font-sans text-foreground sm:h-[min(852px,calc(100dvh-48px))] sm:w-[393px] sm:rounded-[48px] sm:border sm:border-border sm:shadow-2xl">
        {waterMounted && (screen === "splash" || screen === "permission" || screen === "home") && <div aria-hidden={screen !== "home"} className={`absolute inset-0 ${screen !== "home" ? "invisible" : ""}`}><Suspense fallback={<div className="water-surface absolute inset-0" />}><WaterSurface dark={theme === "dark"} active={screen === "home"} count={nearbyRipplerCount} onReady={() => setWaterReady(true)} /></Suspense></div>}
        <AnimatePresence mode="sync" custom={returning}>
          <motion.div
            key={screen}
            custom={returning}
            initial={screen === "splash" ? { opacity: 1, x: 0 } : returning ? { opacity: 0, x: -12 } : { opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            variants={{ leaving: (back: boolean) => ({ opacity: 0, x: back ? 16 : 0, transition: { duration: back ? 0.24 : 0.12, ease } }) }}
            exit="leaving"
            transition={{ duration: returning ? 0.24 : 0.12, ease }}
            className={`absolute inset-0 z-10 flex flex-col ${screen === "home" ? "pointer-events-none" : "bg-background"}`}
          >
            {screen === "splash" && <div data-testid="startup-splash" className="splash-screen relative flex flex-1 items-center justify-center"><div className="splash-symbol"><RippleLogo large shimmer /></div></div>}
            {screen === "permission" && <Permission onAllow={() => setScreen("home")} />}
            {screen === "home" && <HomeScreen onOpen={request} />}
            {screen === "verify" && <Verify onBack={() => setScreen("home")} onDone={() => { setVerified(true); openTarget(pending); }} />}
            {screen === "lounge" && <Lounge msgs={messages["lounge"] ?? loungeSeed} onMessages={(msgs) => updateMessages("lounge", msgs)} onBack={() => setScreen("home", true)} onRoom={() => { const rm = nearbyRooms[0]; if (rm) enterRoom(rm, "lounge"); }} />}
            {screen === "room" && <Room key={room.id} room={room} msgs={messages[room.id] ?? roomMsgs[room.tag] ?? roomSeed} onMessages={(msgs) => updateMessages(room.id, msgs)} onBack={() => setScreen(roomBack, true)} />}
            {(screen === "past" || screen === "nearby") && <RegionalRooms view={screen === "nearby" ? "nearby" : "mine"} onNearby={() => setScreen("nearby")} joinedRooms={joinedRooms} mutedRooms={mutedRooms} onMute={(id) => setMutedRooms((current) => toggleRoomMute(current, id))} onLeave={(id) => setJoinedRooms((current) => leaveJoinedRoom(current, id))} onOpen={(rm) => enterRoom(rm, screen)} />}
            {screen === "settings" && <Settings verified={verified} onVerify={() => setScreen("verify")} />}
          </motion.div>
        </AnimatePresence>
        {tab && <TabBar tab={tab} go={setScreen} />}
        {wave && <motion.div data-testid="navigation-wave" key={`${wave.next}-${wave.phase}`} className="navigation-wave absolute inset-0 z-50 overflow-hidden bg-primary" initial={wave.phase === "expand" ? { clipPath: `circle(0px at ${wave.x}px ${wave.y}px)`, opacity: 0.6 } : { opacity: 1 }} animate={wave.phase === "expand" ? { clipPath: `circle(${wave.radius}px at ${wave.x}px ${wave.y}px)`, opacity: 1 } : { opacity: 0 }} transition={wave.phase === "expand" ? { duration: 0.36, ease: [0.25,0.1,0.25,1] } : { duration: 0.22, delay: 0.14, ease: "easeOut" }} onAnimationComplete={() => { if (wave.phase === "expand") { setRawScreen(wave.next); setWave({ ...wave, phase: "reveal" }); } else { setWave(null); navigating.current = false; } }} />}
      </div>
    </div>
    </MotionConfig>
    </AppearanceContext.Provider>
    </CharacterContext.Provider>
    </IdentityContext.Provider>
  );
}

function TabBar({ tab, go }: { tab: string; go: (s: Screen) => void }) {
  const items = [
    { k: "home", label: "홈", Icon: Home },
    { k: "nearby", label: "주변 방", Icon: MapPin },
    { k: "past", label: "내가 참여한 방", Icon: Users },
    { k: "settings", label: "내 정보", Icon: User },
  ] as const;
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-background pb-6 pt-3">
      {items.map(({ k, label, Icon }) => (
        <Button variant="ghost" key={k} onClick={() => go(k)} className={`relative h-auto min-w-0 flex-1 flex flex-col items-center gap-1 px-1 text-[11px] font-semibold transition-colors ${tab === k ? "text-primary" : "text-muted-foreground"}`}>
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
        <div data-testid="permission-logo-anchor" className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 leading-none">
          <div data-testid="permission-wave-origin" className="absolute left-1/2 top-[70.3125%] h-0 w-0"><Ripples size={240} count={4} period={1.2} /></div>
          <div className="relative"><RippleLogo large symbolOnly /></div>
        </div>
        <p className="absolute inset-x-0 bottom-0 text-center text-[32px] font-bold">Ripple</p>
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
  const { avatar } = useContext(CharacterContext);
  const { user } = useContext(IdentityContext);
  return (
    <div className="water-home no-scrollbar pointer-events-none relative flex min-h-0 flex-1 flex-col overflow-y-auto pb-28">
      <header className="water-content flex shrink-0 items-center justify-between px-6 pt-6">
        <div><h1><RippleLogo /></h1><p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground"><MapPin className="h-3 w-3" />상명대 미래백년관</p></div>
        <Button variant="secondary" size="icon" aria-label={theme === "light" ? "다크 모드 켜기" : "라이트 모드 켜기"} onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="h-10 w-10 rounded-full">{theme === "light" ? <Moon /> : <Sun />}</Button>
      </header>
      <div className="water-content mt-8 shrink-0 text-center"><p className="text-[23px] font-semibold leading-snug">지금, <span className="font-bold text-primary">같은 파동</span> 안에</p><p className="mt-2 text-xs text-muted-foreground">가까이 있는 사람들과 가볍게 이어져요</p></div>
      <div className="water-center relative flex min-h-[300px] flex-1 items-center justify-center" aria-label={`지금 이곳의 ripplers ${nearbyRipplerCount}명`}>
          <span data-pool-floor-anchor className="absolute left-1/2 top-1/2 h-px w-px" aria-hidden="true" />
          <SwimmingRipplers avatar={avatar} nickname={user.nickname} userId={user.id} />
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

function useChat(msgs: Msg[], onMessages: (msgs: Msg[]) => void, roomId: string) {
  const { user, roomNicknames, blocked } = useContext(IdentityContext);
  const [text, setText] = useState("");
  const [reply, setReply] = useState<Msg | null>(null);
  const send = () => {
    const message = createMessage(Date.now(), text, reply, { id: user.id, nickname: roomNicknames[roomId] ?? user.nickname });
    if (!message) return;
    onMessages([...msgs, message]);
    setText("");
    setReply(null);
  };
  return { msgs: visibleMessages(msgs, blocked), text, setText, send, reply, setReply };
}

function ChatList({ msgs, onLong, onReply, bot, intro }: { msgs: Msg[]; onLong: (m: Msg) => void; onReply: (m: Msg) => void; bot?: ReactNode; intro?: ReactNode }) {
  const { avatar } = useContext(CharacterContext);
  const { blocked } = useContext(IdentityContext);
  const end = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gesture = useRef<{ x: number; y: number; id: number } | null>(null);
  const [swipe, setSwipe] = useState<{ id: number; x: number } | null>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);
  const cancel = () => { if (timer.current) clearTimeout(timer.current); };
  useEffect(() => () => cancel(), []);
  const finish = (m: Msg, x: number, y: number) => {
    cancel();
    const start = gesture.current;
    if (start && start.id === m.id && isReplySwipe(x-start.x, y-start.y)) onReply(m);
    gesture.current = null;
    setSwipe(null);
  };
  const jump = (id: number) => {
    const row = end.current?.parentElement?.querySelector(`[data-message-id="${id}"]`);
    row?.scrollIntoView({ behavior: "smooth", block: "center" });
    row?.classList.remove("reply-highlight");
    requestAnimationFrame(() => row?.classList.add("reply-highlight"));
  };
  return (
    <div aria-label="대화 메시지" className="no-scrollbar min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto py-3">
      {intro}
      {msgs.map((m, i) => m.bot ? <div key="bot" className="px-4">{bot}</div> : (
        <motion.div key={m.id} data-message-id={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }} className={`chat-row relative flex min-h-14 items-start ${m.me ? "justify-end" : ""}`}>
          <div className={`chat-character pointer-events-none absolute top-1 h-[46px] w-[42px] ${m.me ? "-right-[17px]" : "-left-[17px]"}`}><Character avatar={m.me ? avatar : avatarForNickname(m.userId)} peek={m.me ? "left" : "right"} label={m.me ? "내 대화 캐릭터" : `${m.nick} 캐릭터`} className="h-full w-full" /></div>
          <motion.div animate={{ x: swipe?.id === m.id ? swipe.x : 0 }} transition={{ duration: 0.16 }} className={`relative min-w-0 max-w-[calc(100%-64px)] ${m.me ? "ml-5 mr-11 items-end" : "ml-11 mr-5"} flex flex-col`}>
            <span className="mb-1 text-[11px] font-semibold text-muted-foreground">{m.nick}{m.me ? " · 나" : ""}</span>
            <div onPointerDown={(e) => { gesture.current = { x: e.clientX, y: e.clientY, id: m.id }; e.currentTarget.setPointerCapture(e.pointerId); timer.current = setTimeout(() => { gesture.current = null; onLong(m); }, 450); }}
              onPointerMove={(e) => { const start = gesture.current; if (!start || start.id !== m.id) return; const dx = e.clientX-start.x; const dy = e.clientY-start.y; if (Math.abs(dx) > 8 || Math.abs(dy) > 8) cancel(); if (Math.abs(dx) > Math.abs(dy)*1.5) setSwipe({ id: m.id, x: Math.max(-64, Math.min(64, dx)) }); }}
              onPointerUp={(e) => finish(m, e.clientX, e.clientY)} onPointerCancel={() => { cancel(); gesture.current = null; setSwipe(null); }} onContextMenu={(e) => { e.preventDefault(); onLong(m); }}
              className={`chat-message touch-pan-y select-none rounded-2xl px-3.5 py-2.5 leading-relaxed ${m.me ? "rounded-br-md bg-chat-own font-medium text-chat-own-foreground" : "rounded-tl-md bg-chat-other"}`}>
              {m.reply && <Button variant="ghost" aria-label={`${m.reply.nick}의 원문 보기`} onClick={() => { if (m.reply) jump(m.reply.id); }} className={`mb-2 h-auto w-full min-w-0 justify-start whitespace-normal rounded-lg px-2.5 py-2 text-left text-inherit hover:bg-background/20 hover:text-inherit ${m.me ? "bg-background/15" : "bg-background/60"}`}><span className="min-w-0"><span className="block text-[11px] font-semibold">{m.reply.nick}</span><span className="line-clamp-2 text-xs font-normal opacity-75">{blocked.some((entry) => entry.userId === m.reply?.userId) ? "차단한 사용자의 메시지" : m.reply.text}</span></span></Button>}
              {m.text}
            </div>
          </motion.div>
        </motion.div>
      ))}
      <div ref={end} />
    </div>
  );
}

function InputBar({ text, setText, send, reply, setReply }: { text: string; setText: (s: string) => void; send: () => void; reply: Msg | null; setReply: (m: Msg | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (reply) input.current?.focus({ preventScroll: true }); }, [reply]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex shrink-0 items-end gap-2 border-t border-border px-4 pb-8 pt-2">
      <div className="min-w-0 flex-1 overflow-hidden rounded-[24px] bg-secondary focus-within:ring-1 focus-within:ring-primary">
        {reply && <div className="mx-4 flex items-center gap-2 border-b border-border pb-2 pt-3"><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-foreground">{reply.nick}에게 답장</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{reply.text}</p></div><Button type="button" variant="ghost" size="icon" aria-label="답장 취소" className="h-7 w-7 shrink-0 rounded-full text-muted-foreground" onClick={() => setReply(null)}><X className="h-3.5 w-3.5" /></Button></div>}
        <input ref={input} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key !== "Enter") return; e.preventDefault(); if (shouldSubmitChatKey(e.key, e.nativeEvent.isComposing, e.keyCode)) send(); }} aria-label="메시지" placeholder="메시지 보내기" className="chat-message h-12 w-full min-w-0 border-0 bg-transparent px-5 outline-none placeholder:text-muted-foreground" />
      </div>
      <MotionButton variant="ghost" disabled={!text.trim()} whileTap={{ scale: 0.9 }} aria-label="메시지 보내기" type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Send className="h-5 w-5" /></MotionButton>
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

function ModerationSheet({ target, onClose, onReply, roomId }: { target: Msg | null; onClose: () => void; onReply: (m: Msg) => void; roomId: string }) {
  const { block, report } = useContext(IdentityContext);
  const [done, setDone] = useState<string | null>(null);
  useEffect(() => setDone(null), [target]);
  return (
    <Sheet open={!!target} onClose={onClose}>
      {done ? (
        <p className="py-6 text-center font-semibold">{done}</p>
      ) : (
        <>
          <p className="mb-3 px-1 text-sm text-muted-foreground">{target?.nick}님의 메시지</p>
          <Button variant="ghost" onClick={() => { if (target) onReply(target); onClose(); }} className="flex h-auto w-full justify-start gap-3 px-3 py-4 font-semibold"><ReplyIcon className="h-5 w-5" />답장하기</Button>
          {!target?.me && <><Button variant="ghost" onClick={() => { if (target) report(target, roomId); setDone("신고가 접수됐어요"); setTimeout(onClose, 900); }} className="flex h-auto w-full justify-start items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold text-destructive hover:bg-secondary"><ShieldAlert className="h-5 w-5" />신고하기</Button>
          <Button variant="ghost" onClick={() => { if (target) block(target); setDone(`${target?.nick}님을 차단했어요`); setTimeout(onClose, 900); }} className="flex h-auto w-full justify-start items-center gap-3 rounded-2xl px-3 py-4 text-left font-semibold hover:bg-secondary"><Ban className="h-5 w-5" />차단하기</Button></>}
        </>
      )}
    </Sheet>
  );
}

function Lounge({ onBack, onRoom, msgs, onMessages }: { onBack: () => void; onRoom: () => void; msgs: Msg[]; onMessages: (msgs: Msg[]) => void }) {
  const chat = useChat(msgs, onMessages, "lounge-future");
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
      <ChatList msgs={chat.msgs} onReply={chat.setReply} onLong={setTarget} bot={bot} />
      <InputBar {...chat} />
      <ModerationSheet roomId="lounge-future" target={target} onReply={chat.setReply} onClose={() => setTarget(null)} />
    </div>
  );
}

function Cover({ tag, c = "cover-1", big }: { tag: string; c?: string; big?: boolean }) {
  const image = topicImages[tag];
  return (
    <div className={`${c} relative overflow-hidden ${big ? "h-full w-full" : "h-16 w-16 shrink-0 rounded-2xl"}`}>
      {image ? <><img src={image.url} alt={image.alt} className="absolute inset-0 h-full w-full object-cover" />{big && <div className="story-photo-shade absolute inset-0" />}</> : <div className="absolute inset-0 ripple-pattern" />}
      {big && <span className="absolute bottom-4 left-4 text-4xl font-black tracking-normal text-story-foreground">{tag}</span>}
    </div>
  );
}

function Room({ room, onBack, msgs, onMessages }: { room: RoomInfo; onBack: () => void; msgs: Msg[]; onMessages: (msgs: Msg[]) => void }) {
  const chat = useChat(msgs, onMessages, room.id);
  const [target, setTarget] = useState<Msg | null>(null);
  const [share, setShare] = useState(false);
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <Header title={room.tag} onBack={onBack} right={<div className="flex gap-1"><ChatSettingsButton /><Button variant="ghost" aria-label="방 공유" onClick={() => setShare(true)} className="bg-secondary h-10 w-10 rounded-full"><Share2 /></Button></div>} />
      <ChatList msgs={chat.msgs} onReply={chat.setReply} onLong={setTarget} intro={<div className="px-4">
        <motion.div layoutId="cover" className="h-28 overflow-hidden rounded-2xl"><Cover tag={room.tag} c={room.c} big /></motion.div>
        <p className="mt-3 text-xs font-medium text-muted-foreground">생성 {room.time} · {room.n}명</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{room.place}에서 시작된 {room.tag} 이야기</p>
        <p className="mt-2 text-xs font-semibold text-primary">장소를 떠나도 계속 이야기할 수 있어요</p>
      </div>} />
      <InputBar {...chat} />
      <ModerationSheet roomId={room.id} target={target} onReply={chat.setReply} onClose={() => setTarget(null)} />
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

function RegionalRooms({ view, onNearby, joinedRooms, onOpen, mutedRooms, onMute, onLeave }: { view: "nearby" | "mine"; onNearby: () => void; joinedRooms: RoomInfo[]; onOpen: (r: RoomInfo) => void; mutedRooms: Record<string, boolean>; onMute: (id: string) => void; onLeave: (id: string) => void }) {
  const [place, setPlace] = useState("전체 장소");
  const [manage, setManage] = useState<RoomInfo | null>(null);
  const [leaving, setLeaving] = useState<RoomInfo | null>(null);
  const places = [...new Set(joinedRooms.map((r) => r.place))];
  const selectedPlace = place === "전체 장소" || places.includes(place) ? place : "전체 장소";
  const rooms = view === "nearby" ? nearbyRooms : joinedRooms.filter((r) => selectedPlace === "전체 장소" || r.place === selectedPlace);
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <h1 className="mt-5 text-[30px] font-extrabold">{view === "nearby" ? "주변 방" : "내가 참여한 방"}</h1>
      {view === "nearby" ? <p className="mt-4 flex items-center gap-1 text-xs font-semibold text-muted-foreground"><MapPin className="h-3.5 w-3.5" />지금 상명대 미래백년관 근처</p> : <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">장소는 달라도, 이야기는 계속</p><select aria-label="참여한 장소" value={selectedPlace} onChange={(e) => setPlace(e.target.value)} className="max-w-[160px] min-w-0 rounded-xl border border-border bg-secondary px-3 py-2 text-xs font-semibold"><option>전체 장소</option>{places.map((p) => <option key={p}>{p}</option>)}</select></div>}
      <div className="mt-3 space-y-2">
        {rooms.map((r) => {
          const joined = joinedRooms.some((entry) => entry.id === r.id);
          return <RoomListItem key={r.id} label={`${r.tag} ${r.place}`} joined={joined} muted={!!mutedRooms[r.id]} onOpen={() => onOpen(r)} onLeave={() => setLeaving(r)} onMute={() => onMute(r.id)} onManage={() => setManage(r)}>
            <Cover tag={r.tag} c={r.c} />
            <div className="min-w-0 flex-1"><p className="flex items-center gap-2 text-[17px] font-extrabold">{r.tag}{mutedRooms[r.id] && <BellOff aria-label="알림 꺼짐" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}</p><p className="mt-1 text-xs text-muted-foreground">{r.place}</p><p className="mt-1 text-[11px] text-muted-foreground">생성 {r.time}</p><p className="mt-1.5 text-xs font-semibold text-primary"><Users className="mr-1 inline h-3 w-3" />{r.n}명 · {joined ? "대화 이어가기" : "참여하기"}</p></div>
            {!joined && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </RoomListItem>;
        })}
        {rooms.length === 0 && <div className="py-14 text-center"><p className="text-base font-bold">아직 남겨둔 이야기가 없어요</p><p className="mt-2 text-sm text-muted-foreground">가까운 방에서 첫 이야기를 시작해 볼까요?</p><Button variant="secondary" className="mt-5 rounded-xl" onClick={onNearby}>주변 방 보기</Button></div>}
      </div>
      <Sheet open={!!manage} onClose={() => setManage(null)}>
        <h2 className="text-lg font-bold">{manage?.tag}</h2><p className="mt-1 text-xs text-muted-foreground">{manage?.place}</p>
        <Button variant="ghost" className="mt-4 h-12 w-full justify-start gap-3 rounded-xl font-semibold" onClick={() => { if (manage) onMute(manage.id); setManage(null); }}>{manage && mutedRooms[manage.id] ? <Bell /> : <BellOff />}{manage && mutedRooms[manage.id] ? "알림 켜기" : "알림 끄기"}</Button>
        <Button variant="ghost" className="h-12 w-full justify-start gap-3 rounded-xl font-semibold text-destructive" onClick={() => { setLeaving(manage); setManage(null); }}><LogOut />방 나가기</Button>
      </Sheet>
      <Sheet open={!!leaving} onClose={() => setLeaving(null)}>
        <h2 className="text-lg font-bold">{leaving?.tag} 방에서 나갈까요?</h2><p className="mt-2 text-sm text-muted-foreground">참여한 방 목록에서 사라져요.</p>
        <div className="mt-6 flex gap-2"><Button variant="secondary" className="h-12 flex-1 rounded-xl font-bold" onClick={() => setLeaving(null)}>취소</Button><Button variant="destructive" className="h-12 flex-1 rounded-xl font-bold" onClick={() => { if (leaving) onLeave(leaving.id); setLeaving(null); }}><LogOut className="h-4 w-4" />나가기</Button></div>
      </Sheet>
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
        <div className="mt-8 flex items-center gap-2">
          <input inputMode="numeric" value={phone} onChange={(e) => setPhone(fmt(e.target.value))} placeholder="010-0000-0000"
            aria-label="휴대폰 번호" className="bg-secondary h-14 min-w-0 flex-1 rounded-2xl border border-transparent px-5 text-lg font-semibold outline-none focus:border-primary" />
          <Button variant="ghost" disabled={phone.length < 12} onClick={() => setSent(true)} className="h-14 shrink-0 rounded-2xl bg-secondary px-4 text-sm font-bold disabled:opacity-40">{sent ? "재전송" : "인증번호"}</Button>
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

function AppearanceControls({ chat = false }: { chat?: boolean }) {
  const { theme, chatSize, setTheme, setChatSize } = useContext(AppearanceContext);
  return (
    <section className="mt-6">
      <p className="mb-3 text-xs font-bold text-muted-foreground">화면과 대화</p>
      <div className="flex items-center justify-between py-2"><span className="text-sm font-semibold">화면 모드</span>{chat ? <div className="flex items-center gap-3"><Sun className="h-4 w-4 text-muted-foreground" /><Switch aria-label="다크 모드" checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light", false)} /><Moon className="h-4 w-4 text-muted-foreground" /></div> : <div className="flex gap-1 rounded-xl bg-secondary p-1">{(["light", "dark"] as const).map((mode) => <Button variant="ghost" key={mode} aria-pressed={theme === mode} onClick={() => setTheme(mode)} className={`h-9 rounded-lg px-3 text-xs ${theme === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{mode === "light" ? <Sun /> : <Moon />}{mode === "light" ? "라이트" : "다크"}</Button>)}</div>}</div>
      <div className="mt-4 flex items-center justify-between"><label className="text-sm font-semibold" htmlFor="chat-font-size">대화 글자 크기</label><span className="text-xs font-semibold text-primary">{chatSizes[chatSize].label}</span></div>
      <input id="chat-font-size" aria-label="대화 글자 크기" className="font-slider mt-4 w-full accent-primary" type="range" min={0} max={3} step={1} value={Object.keys(chatSizes).indexOf(chatSize)} onChange={(e) => { const next = (Object.keys(chatSizes) as ChatSize[])[Number(e.target.value)]; if (next) setChatSize(next); }} />
      <div className="mt-1 flex justify-between text-[10px] font-medium text-muted-foreground"><span>작게</span><span>기본</span><span>크게</span><span>더 크게</span></div>
      <div className="mt-5 flex flex-col gap-2 border-y border-border py-4"><span className="text-[10px] text-muted-foreground">느긋한 곰</span><div className="chat-message max-w-[90%] self-end rounded-2xl rounded-br-sm bg-chat-own px-3.5 py-2.5 leading-relaxed text-chat-own-foreground">같은 곳에 있으니까 더 반갑다 👋</div></div>
    </section>
  );
}

function ChatSettingsButton() {
  const [open, setOpen] = useState(false);
  return <><Button variant="secondary" size="icon" aria-label="대화 화면 설정" onClick={() => setOpen(true)} className="h-10 w-10 rounded-full"><Settings2 /></Button><Sheet open={open} onClose={() => setOpen(false)}><div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">내게 편한 대화</h2><Button variant="ghost" size="icon" aria-label="설정 닫기" onClick={() => setOpen(false)}><X /></Button></div><AppearanceControls chat /><Button className="mt-5 h-12 w-full rounded-xl" onClick={() => setOpen(false)}><Check />완료</Button></Sheet></>;
}

function Settings({ verified, onVerify }: { verified: boolean; onVerify: () => void }) {
  const { user, setNickname, blocked, reports, unblock } = useContext(IdentityContext);
  const [editingNickname, setEditingNickname] = useState(false);
  const { avatar, setAvatar } = useContext(CharacterContext);
  const [editing, setEditing] = useState(false);
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28">
      <div className="mt-4 flex items-center gap-4">
        <Button variant="ghost" aria-label="내 캐릭터 꾸미기" onClick={() => setEditing(true)} className="h-20 w-20 shrink-0 rounded-full bg-primary-soft p-1"><Character avatar={avatar} className="h-full w-full" /></Button>
        <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">닉네임</p><p className="break-words text-xl font-extrabold">{user.nickname}</p></div>
        <Button variant="secondary" size="icon" aria-label="닉네임 변경" className="h-10 w-10 shrink-0 rounded-full" onClick={() => setEditingNickname(true)}><Pencil className="h-4 w-4" /></Button>
      </div>
      <Sheet open={editingNickname} onClose={() => setEditingNickname(false)}>{editingNickname && <NicknameEditor nickname={user.nickname} onClose={() => setEditingNickname(false)} onSave={(nickname) => { setNickname(nickname); setEditingNickname(false); }} />}</Sheet>
      <Button variant="secondary" className="mt-4 h-11 w-full rounded-xl" onClick={() => setEditing(true)}><User className="h-4 w-4" />캐릭터 꾸미기<ChevronRight className="ml-auto h-4 w-4" /></Button>
      <Sheet open={editing} onClose={() => setEditing(false)}>{editing && <CharacterEditor initial={avatar} onClose={() => setEditing(false)} onSave={(next) => { setAvatar(next); setEditing(false); }} />}</Sheet>
      {!verified && <Button variant="ghost" onClick={onVerify} className="mt-5 flex h-auto w-full items-center justify-between rounded-3xl border border-primary/40 bg-primary/10 p-4 text-sm font-bold text-primary">휴대폰 인증하기<ChevronRight className="h-4 w-4" /></Button>}
      <AppearanceControls />
      <Section title={`차단한 사용자 ${blocked.length}`}>
        {blocked.length === 0 && <div className="py-5 text-center"><span className="empty-illustration" aria-hidden="true">🕊️</span><p className="mt-2 text-sm font-bold">여긴 평화로운 구역</p><p className="mt-1 text-xs text-muted-foreground">차단한 사람이 없어요. 이대로 쭉!</p></div>}
        <AnimatePresence>
          {blocked.map((b) => (
            <motion.div key={b.userId} exit={{ opacity: 0, height: 0 }} className="flex items-center justify-between px-4 py-3.5">
              <span className="font-semibold">{b.nickname}</span>
              <Button variant="ghost" onClick={() => unblock(b.userId)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold">차단 해제</Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </Section>
      <Section title="신고 내역">
        {reports.length === 0 && <p className="px-4 py-3.5 text-sm text-muted-foreground">접수한 신고가 없어요</p>}
        {reports.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0"><p className="text-sm font-semibold">{r.nickname}</p><p className="mt-1 text-xs text-muted-foreground">{r.date}</p><p className="mt-1 truncate text-xs text-muted-foreground">{r.text}</p></div>
            <span className="shrink-0 text-xs font-bold text-muted-foreground">{r.status}</span>
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
