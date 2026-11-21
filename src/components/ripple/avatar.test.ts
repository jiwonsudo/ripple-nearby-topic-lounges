import { describe, expect, it } from "vitest";
import { avatarForNickname, changeAvatar, chatPeekDegrees, defaultAvatar } from "./avatar";

describe("character customization", () => {
  it("changes appearance parts without modifying the saved character", () => {
    const edited = changeAvatar(changeAvatar(changeAvatar(defaultAvatar, "skin", "deep"), "eyewear", "round"), "clothes", "mint");
    expect(edited.skin).toBe("deep"); expect(edited.eyewear).toBe("round"); expect(edited.clothes).toBe("mint");
    expect(defaultAvatar.skin).toBe("warm"); expect(defaultAvatar.eyewear).toBe("none");
  });
  it("uses a 30 degree peek toward the conversation", () => { expect(chatPeekDegrees).toBe(30); });
  it("keeps mock participants' characters consistent by nickname", () => {
    expect(avatarForNickname("졸린 판다")).toEqual(avatarForNickname("졸린 판다"));
    expect(avatarForNickname("졸린 판다")).not.toEqual(avatarForNickname("새벽 코더"));
  });
});