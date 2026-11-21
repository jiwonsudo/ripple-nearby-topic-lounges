import { initialUser, type UserIdentity } from "./identity";
export type RoomInfo = { id: string; tag: string; c: string; place: string; time: string; n: number; nearby: boolean };
export type Reply = { id: number; userId: string; nick: string; text: string };
export type Msg = { id: number; userId: string; nick: string; emoji: string; text: string; me?: boolean; bot?: boolean; reply?: Reply };

export const nearbyRooms: RoomInfo[] = [
  { id: "future-newjeans-1121", tag: "#뉴진스", c: "cover-2", place: "상명대 미래백년관", time: "2026.11.21 14:30", n: 8, nearby: true },
  { id: "student-food-1121", tag: "#학식", c: "cover-4", place: "학생회관 1층", time: "2026.11.21 12:05", n: 5, nearby: true },
  { id: "future-hackathon-1121", tag: "#해커톤", c: "cover-3", place: "상명대 미래백년관", time: "2026.11.21 10:40", n: 14, nearby: true },
];
export const initialJoinedRooms: RoomInfo[] = [
  ...nearbyRooms.slice(0, 1),
  { id: "hongdae-newjeans-1120", tag: "#뉴진스", place: "홍대입구역", time: "2026.11.20 22:10", n: 14, c: "cover-2", nearby: false },
  { id: "student-food-1119", tag: "#학식", place: "학생회관 1층", time: "2026.11.19 12:05", n: 6, c: "cover-4", nearby: true },
  { id: "library-exam-1117", tag: "#중간고사", place: "중앙도서관", time: "2026.11.17 01:40", n: 21, c: "cover-2", nearby: false },
  { id: "ground-festival-1114", tag: "#축제라인업", place: "대운동장", time: "2026.11.14 18:20", n: 33, c: "cover-5", nearby: false },
];
export function joinRoom(rooms: RoomInfo[], room: RoomInfo): RoomInfo[] {
  return rooms.some((r) => r.id === room.id) ? rooms : [room, ...rooms];
}
export function canChatInRoom(_room: RoomInfo, _isAtOrigin: boolean) { return true; }
export function createMessage(id: number, text: string, reply: Msg | null, sender: UserIdentity = initialUser): Msg | null {
  if (!text.trim()) return null;
  return { id, userId: sender.id, nick: sender.nickname, emoji: "🐻", text: text.trim(), me: true, ...(reply && !reply.bot ? { reply: { id: reply.id, userId: reply.userId, nick: reply.nick, text: reply.text } } : {}) };
}
export function isReplySwipe(dx: number, dy: number) { return Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5; }
export function roomSwipeAction(dx: number, dy: number): "leave" | "mute" | null {
  if (!isReplySwipe(dx, dy)) return null;
  return dx < 0 ? "leave" : "mute";
}
export function leaveJoinedRoom(rooms: RoomInfo[], roomId: string) { return rooms.filter((room) => room.id !== roomId); }
export function toggleRoomMute(muted: Record<string, boolean>, roomId: string) { return { ...muted, [roomId]: !muted[roomId] }; }