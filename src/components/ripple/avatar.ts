export const avatarOptions = {
  hair: ["short", "bob", "curly", "bun", "none"],
  hairColor: ["ink", "cocoa", "gold", "blue", "rose"],
  skin: ["porcelain", "peach", "warm", "tan", "deep", "espresso"],
  eyewear: ["none", "snorkel", "sun", "round", "square"],
  eyes: ["dot", "oval", "happy", "sleepy"],
  nose: ["button", "round", "triangle"],
  mouth: ["smile", "grin", "small", "surprised"],
  body: ["round", "slim", "broad"],
  outfit: ["rashguard", "onepiece", "shorts"],
  clothes: ["blue", "mint", "lemon", "rose", "ink"],
  float: ["none", "ring", "flamingo", "dolphin"],
  floatColor: ["blue", "mint", "lemon", "rose", "coral", "lilac", "aqua", "tangerine", "cherry", "lime", "lavender", "ice"],
  prop: ["none", "cocktail", "juice", "watergun"],
} as const;
export type Avatar = { [K in keyof typeof avatarOptions]: typeof avatarOptions[K][number] };
export type AvatarPart = keyof Avatar;
export const chatPeekDegrees = 30;
export const defaultAvatar: Avatar = { hair: "curly", hairColor: "cocoa", skin: "warm", eyewear: "snorkel", eyes: "dot", nose: "button", mouth: "smile", body: "round", outfit: "rashguard", clothes: "blue", float: "ring", floatColor: "blue", prop: "none" };
export function changeAvatar<K extends AvatarPart>(avatar: Avatar, part: K, value: Avatar[K]): Avatar {
  return { ...avatar, [part]: value };
}
export function avatarForNickname(nickname: string): Avatar {
  const seed = Array.from(nickname).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return { ...defaultAvatar,
    hair: avatarOptions.hair[seed % 4] ?? "short",
    skin: avatarOptions.skin[seed % 6] ?? "warm",
    hairColor: avatarOptions.hairColor[seed % 5] ?? "ink",
    eyewear: avatarOptions.eyewear[seed % 5] ?? "none",
    eyes: avatarOptions.eyes[seed % 4] ?? "dot",
    clothes: avatarOptions.clothes[seed % 5] ?? "blue",
    outfit: avatarOptions.outfit[seed % 3] ?? "rashguard",
    float: avatarOptions.float[seed % 4] ?? "none",
    floatColor: avatarOptions.floatColor[seed % 12] ?? "blue",
    prop: avatarOptions.prop[(seed + 2) % 4] ?? "none",
  };
}

export function distinctPoolAvatars(ids: readonly string[], ownColor: Avatar["floatColor"]): Avatar[] {
  const colors = avatarOptions.floatColor.filter((color) => color !== ownColor);
  return ids.map((id, index) => ({ ...avatarForNickname(id), floatColor: colors[index % colors.length] ?? "rose" }));
}