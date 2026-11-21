import { describe, expect, it } from "vitest";
import { distinctPoolAvatars, avatarForNickname, avatarOptions, changeAvatar, chatPeekDegrees, defaultAvatar } from "./avatar";

describe("character customization", () => {
  it("changes appearance parts without modifying the saved character", () => {
    const edited = changeAvatar(changeAvatar(changeAvatar(defaultAvatar, "skin", "deep"), "eyewear", "round"), "clothes", "mint");
    expect(edited.skin).toBe("deep"); expect(edited.eyewear).toBe("round"); expect(edited.clothes).toBe("mint");
    expect(defaultAvatar.skin).toBe("warm"); expect(defaultAvatar.eyewear).toBe("snorkel");
  });
  it("uses a 30 degree peek toward the conversation", () => { expect(chatPeekDegrees).toBe(30); });
  it("offers no tube, a ring, a flamingo and a dolphin", () => { expect(avatarOptions.float).toEqual(["none", "ring", "flamingo", "dolphin"]); });
  it("offers only water-ready clothes", () => { expect(avatarOptions.outfit).toEqual(["rashguard", "onepiece", "shorts"]); });
  it("offers cocktail, juice and water-gun accessories", () => { expect(avatarOptions.prop).toEqual(["none", "cocktail", "juice", "watergun"]); });
  it("saves snorkel and tube color without changing the saved draft", () => {
    const edited = changeAvatar(changeAvatar(changeAvatar(defaultAvatar, "float", "flamingo"), "floatColor", "rose"), "eyewear", "none");
    expect(edited.float).toBe("flamingo"); expect(edited.floatColor).toBe("rose"); expect(edited.eyewear).toBe("none");
    expect(defaultAvatar.float).toBe("ring"); expect(defaultAvatar.floatColor).toBe("blue");
  });
  it("gives 11 nearby characters distinct tube colors avoiding my color", () => { const colors = distinctPoolAvatars(Array.from({length:11}, (_,i)=>String(i)), "blue").map(a=>a.floatColor); expect(new Set(colors).size).toBe(11); expect(colors).not.toContain("blue"); });
  it("keeps mock participants' characters consistent by nickname", () => {
    expect(avatarForNickname("졸린 판다")).toEqual(avatarForNickname("졸린 판다"));
    expect(avatarForNickname("졸린 판다")).not.toEqual(avatarForNickname("새벽 코더"));
  });
});