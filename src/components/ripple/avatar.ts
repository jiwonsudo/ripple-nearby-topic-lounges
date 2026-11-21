export const avatarOptions = {
  hair: ["short", "bob", "curly", "bun", "none"],
  hairColor: ["ink", "cocoa", "gold", "blue", "rose"],
  skin: ["porcelain", "peach", "warm", "tan", "deep", "espresso"],
  eyewear: ["none", "round", "square", "sun"],
  eyes: ["dot", "oval", "happy", "sleepy"],
  nose: ["button", "round", "triangle"],
  mouth: ["smile", "grin", "small", "surprised"],
  body: ["round", "slim", "broad"],
  outfit: ["tee", "hoodie", "collar"],
  clothes: ["blue", "mint", "lemon", "rose", "ink"],
} as const;
export type Avatar = { [K in keyof typeof avatarOptions]: typeof avatarOptions[K][number] };
export type AvatarPart = keyof Avatar;
export const chatPeekDegrees = 30;
export const defaultAvatar: Avatar = { hair: "curly", hairColor: "cocoa", skin: "warm", eyewear: "none", eyes: "dot", nose: "button", mouth: "smile", body: "round", outfit: "hoodie", clothes: "blue" };
export function changeAvatar<K extends AvatarPart>(avatar: Avatar, part: K, value: Avatar[K]): Avatar {
  return { ...avatar, [part]: value };
}
export function avatarForNickname(nickname: string): Avatar {
  const seed = Array.from(nickname).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return { ...defaultAvatar,
    hair: avatarOptions.hair[seed % 4] ?? "short",
    skin: avatarOptions.skin[seed % 6] ?? "warm",
    hairColor: avatarOptions.hairColor[seed % 5] ?? "ink",
    eyewear: avatarOptions.eyewear[seed % 3] ?? "none",
    eyes: avatarOptions.eyes[seed % 4] ?? "dot",
    clothes: avatarOptions.clothes[seed % 5] ?? "blue",
    outfit: avatarOptions.outfit[seed % 3] ?? "tee",
  };
}