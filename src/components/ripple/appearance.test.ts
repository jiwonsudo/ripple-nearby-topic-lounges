import { describe, expect, it } from "vitest";
import { chatSizes, defaultAppearance } from "./appearance";

describe("Ripple appearance preferences", () => {
  it("starts with a compact chat size and light mode", () => {
    expect(defaultAppearance).toEqual({ theme: "light", chatSize: "medium" });
    expect(chatSizes[defaultAppearance.chatSize].pixels).toBe(14);
  });
  it("provides independently selectable smaller and larger message sizes", () => {
    expect(chatSizes.small.pixels).toBeLessThan(chatSizes.medium.pixels);
    expect(chatSizes.large.pixels).toBeGreaterThan(chatSizes.medium.pixels);
    expect(chatSizes.extra.pixels).toBeGreaterThan(chatSizes.large.pixels);
  });
});