export type ThemeMode = "light" | "dark";
export type ChatSize = "small" | "medium" | "large" | "extra";

export const chatSizes: Record<ChatSize, { label: string; pixels: number }> = {
  small: { label: "작게", pixels: 13 },
  medium: { label: "기본", pixels: 14 },
  large: { label: "크게", pixels: 16 },
  extra: { label: "더 크게", pixels: 18 },
};

export const defaultAppearance: { theme: ThemeMode; chatSize: ChatSize } = {
  theme: "light",
  chatSize: "medium",
};