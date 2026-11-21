import { describe, expect, it } from "vitest";
import { blockUser, createReport, initialUser, nicknameAdjectives, nicknameAnimals, randomNickname, rememberRoomNickname, validateNickname, visibleMessages } from "./identity";
import { createMessage, type Msg } from "./rooms";

describe("닉네임과 사용자 ID", () => {
  it("accepts Korean nicknames", () => { expect(validateNickname("다정한 수달")).toBeNull(); });
  it("accepts English and mixed nicknames", () => { expect(validateNickname("Happy Otter")).toBeNull(); expect(validateNickname("Happy 수달")).toBeNull(); });
  it("requires a non-empty nickname", () => { expect(validateNickname("  ")).not.toBeNull(); });
  it("enforces the displayed 20-character limit", () => { expect(validateNickname("가".repeat(20))).toBeNull(); expect(validateNickname("가".repeat(21))).not.toBeNull(); });
  it("rejects initials and incomplete Hangul letters", () => { expect(validateNickname("ㄱㄴㄷ")).not.toBeNull(); expect(validateNickname("수달ㅋㅋ")).not.toBeNull(); expect(validateNickname("ㅏㅣ")).not.toBeNull(); expect(validateNickname("ㄱㅏ")).not.toBeNull(); });
  it("rejects barcode names while allowing readable English names", () => { expect(validateNickname("ililllil")).not.toBeNull(); expect(validateNickname("IlI1lI1l")).not.toBeNull(); expect(validateNickname("i l i l l l i l")).not.toBeNull(); expect(validateNickname("Lily")).toBeNull(); expect(validateNickname("William")).toBeNull(); });
  it("rejects banned Korean words, spaced variants and case-insensitive English", () => {
    expect(validateNickname("씨발곰")).not.toBeNull(); expect(validateNickname("F U C K")).not.toBeNull(); expect(validateNickname("Admin Otter")).not.toBeNull();
  });
  it("generates a different adjective-animal nickname on each button press", () => {
    const name = randomNickname("느긋한 곰", () => 0);
    const [adjective, animal] = name.split(" ");
    expect(nicknameAdjectives).toContain(adjective); expect(nicknameAnimals).toContain(animal); expect(adjective?.endsWith("한")).toBe(true);
    expect(name).not.toBe("느긋한 곰"); expect(validateNickname(name)).toBeNull();
  });
  it("retains the first-entry nickname in the same room after profile changes", () => {
    const first = rememberRoomNickname({}, "room-a", "느긋한 곰");
    const returned = rememberRoomNickname(first, "room-a", "Happy Otter");
    expect(returned["room-a"]).toBe("느긋한 곰");
  });
  it("uses the changed nickname on first entry to a new room", () => {
    const names = rememberRoomNickname({ "room-a": "느긋한 곰" }, "room-b", "Happy Otter");
    expect(names["room-b"]).toBe("Happy Otter");
  });
  it("keeps the sender ID and room nickname across nickname changes", () => {
    const sender = { ...initialUser, nickname: "Happy Otter" };
    expect(createMessage(5, "안녕", null, sender)).toMatchObject({ userId: initialUser.id, nick: "Happy Otter" });
  });
  it("blocks an ID even if its nickname changes, but not a different ID using the old name", () => {
    const blocked = blockUser([], { userId: "rippler-mint", nickname: "민트 고양이" });
    const msgs = [{ userId: "rippler-mint", nick: "바꾼 이름" }, { userId: "rippler-other", nick: "민트 고양이" }];
    expect(visibleMessages(msgs, blocked)).toEqual([msgs[1]]);
    expect(blockUser(blocked, { userId: "rippler-mint", nickname: "바꾼 이름" })).toHaveLength(1);
  });
  it("quotes the same immutable user ID when replying", () => {
    const original: Msg = { id: 1, userId: "rippler-mint", nick: "민트 고양이", text: "안녕", emoji: "" };
    expect(createMessage(2, "반가워", original)?.reply?.userId).toBe("rippler-mint");
  });
  it("keeps report target ID, original nickname and message even after a name change", () => {
    expect(createReport({ id: 3, userId: "rippler-mint", nick: "이전 이름", text: "신고할 메시지" }, "room-a", 20, "2026.11.21")).toMatchObject({ userId: "rippler-mint", nickname: "이전 이름", roomId: "room-a", messageId: 3, text: "신고할 메시지" });
  });
});