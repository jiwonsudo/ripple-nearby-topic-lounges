import { describe, expect, it } from "vitest";
import { canChatInRoom, createMessage, initialJoinedRooms, isReplySwipe, joinRoom, leaveJoinedRoom, roomSwipeAction, toggleRoomMute, shouldSubmitChatKey } from "./rooms";

describe("지역 방과 답장", () => {
  it("keeps the reply while Enter completes Korean composition", () => {
    expect(shouldSubmitChatKey("Enter", true, 13)).toBe(false);
    expect(shouldSubmitChatKey("Enter", false, 229)).toBe(false);
    expect(shouldSubmitChatKey("Enter", false, 13)).toBe(true);
  });
  it("keeps rooms from multiple places with full creation dates and topics", () => {
    expect(new Set(initialJoinedRooms.map((r) => r.place)).size).toBeGreaterThan(1);
    for (const room of initialJoinedRooms) {
      expect(room.time).toMatch(/^2026\.11\.\d{2} \d{2}:\d{2}$/);
      expect(room.tag.startsWith("#")).toBe(true);
    }
  });
  it("allows chatting after leaving the origin", () => {
    const room = initialJoinedRooms.find((r) => !r.nearby);
    if (!room) throw new Error("Missing outside room");
    expect(canChatInRoom(room, false)).toBe(true);
  });
  it("identifies rooms by creation, not a repeated keyword", () => {
    const sameTopic = initialJoinedRooms.filter((r) => r.tag === "#뉴진스");
    expect(sameTopic).toHaveLength(2);
    const room = sameTopic[0];
    if (!room) throw new Error("Missing room");
    expect(joinRoom(sameTopic, room)).toHaveLength(2);
    expect(sameTopic[0]?.id).not.toBe(sameTopic[1]?.id);
  });
  it("attaches the original author, message and id to replies", () => {
    expect(createMessage(10, " 저도요! ", { id: 2, userId: "rippler-mint", nick: "민트 고양이", emoji: "", text: "신곡 좋아요" })).toMatchObject({ text: "저도요!", reply: { id: 2, userId: "rippler-mint", nick: "민트 고양이", text: "신곡 좋아요" } });
  });
  it("does not send empty replies", () => { expect(createMessage(10, "  ", null)).toBeNull(); });
  it("distinguishes reply swipes from vertical scrolling and taps", () => {
    expect(isReplySwipe(60, 8)).toBe(true);
    expect(isReplySwipe(-60, 8)).toBe(true);
    expect(isReplySwipe(20, 0)).toBe(false);
    expect(isReplySwipe(60, 80)).toBe(false);
  });
  it("shows leave on left swipe", () => { expect(roomSwipeAction(-60, 3)).toBe("leave"); });
  it("shows mute on right swipe and ignores vertical scrolling", () => { expect(roomSwipeAction(60, 3)).toBe("mute"); expect(roomSwipeAction(5, 80)).toBeNull(); });
  it("leaves only the selected room, not another room with the same topic", () => {
    const selected = initialJoinedRooms[0];
    if (!selected) throw new Error("Missing joined room");
    const remaining = leaveJoinedRoom(initialJoinedRooms, selected.id);
    expect(remaining.some((room) => room.id === selected.id)).toBe(false);
    expect(remaining.find((room) => room.id === "hongdae-newjeans-1120")?.tag).toBe("#뉴진스");
  });
  it("toggles notification state for only the selected room", () => {
    const muted = toggleRoomMute({ "room-b": true }, "room-a");
    expect(muted).toEqual({ "room-a": true, "room-b": true });
    expect(toggleRoomMute(muted, "room-a")).toEqual({ "room-a": false, "room-b": true });
  });
});