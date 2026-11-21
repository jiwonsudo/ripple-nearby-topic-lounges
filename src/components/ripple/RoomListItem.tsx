import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Bell, BellOff, LogOut, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roomSwipeAction } from "./rooms";

export function RoomListItem({ children, joined, muted, label, onOpen, onLeave, onMute, onManage }: { children: ReactNode; joined: boolean; muted: boolean; label: string; onOpen: () => void; onLeave: () => void; onMute: () => void; onManage: () => void }) {
  const [offset, setOffset] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  return <div className="relative isolate overflow-hidden rounded-2xl bg-secondary">
    {joined && <>
      <Button variant="ghost" aria-label={`${label} ${muted ? "알림 켜기" : "알림 끄기"}`} tabIndex={offset > 0 ? 0 : -1} aria-hidden={offset <= 0} onClick={() => { onMute(); setOffset(0); }} className={`absolute inset-y-0 left-0 h-full w-[84px] flex-col gap-2 rounded-2xl bg-primary-soft text-xs font-bold text-primary ${offset > 0 ? "visible" : "invisible"}`}>{muted ? <Bell /> : <BellOff />}{muted ? "알림 켜기" : "알림 끄기"}</Button>
      <Button variant="ghost" aria-label={`${label} 나가기`} tabIndex={offset < 0 ? 0 : -1} aria-hidden={offset >= 0} onClick={onLeave} className={`absolute inset-y-0 right-0 h-full w-[84px] flex-col gap-2 rounded-2xl bg-destructive text-xs font-bold text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground ${offset < 0 ? "visible" : "invisible"}`}><LogOut />나가기</Button>
    </>}
    <motion.div animate={{ x: offset }} transition={{ type: "spring", stiffness: 480, damping: 42 }} className="relative rounded-2xl bg-card"
      onPointerDown={(event) => { if (!joined || (event.target as HTMLElement).closest("[data-room-action]")) return; start.current = { x: event.clientX, y: event.clientY }; dragged.current = false; }}
      onPointerMove={(event) => { if (!start.current) return; const dx = event.clientX-start.current.x; const dy = event.clientY-start.current.y; if (Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)*1.5) { dragged.current = true; event.currentTarget.setPointerCapture(event.pointerId); setOffset(Math.max(-84, Math.min(84, dx))); } }}
      onPointerUp={(event) => { if (!start.current) return; const action = roomSwipeAction(event.clientX-start.current.x, event.clientY-start.current.y); if (dragged.current) setOffset(action === "leave" ? -84 : action === "mute" ? 84 : 0); start.current = null; }}
      onPointerCancel={() => { start.current = null; setOffset(0); }}>
      <Button variant="ghost" aria-label={label} onClick={() => { if (dragged.current) { dragged.current = false; return; } if (offset) { setOffset(0); return; } onOpen(); }} className={`flex h-auto w-full touch-pan-y items-center gap-3 whitespace-normal rounded-2xl bg-card py-4 pl-3 text-left ${joined ? "pr-12" : "pr-3"}`}>{children}</Button>
      {joined && <Button data-room-action variant="ghost" size="icon" aria-label={`${label} 방 관리`} onClick={onManage} className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>}
    </motion.div>
  </div>;
}