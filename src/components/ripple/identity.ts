export type UserIdentity = { id: string; nickname: string };
export type BlockedUser = { userId: string; nickname: string };
export type ReportRecord = { id: number; userId: string; nickname: string; roomId: string; messageId: number; text: string; date: string; status: string };
export const initialUser: UserIdentity = { id: "rippler-demo-self", nickname: "느긋한 곰" };
export const bannedNicknameWords = ["시발", "씨발", "씨팔", "병신", "개새끼", "좆", "fuck", "shit", "bitch", "운영자", "관리자", "admin", "moderator", "ripple공식"];
export const nicknameAdjectives = ["느긋한", "다정한", "유쾌한", "차분한", "명랑한", "용감한", "포근한", "든든한"];
export const nicknameAnimals = ["곰", "토끼", "고양이", "판다", "수달", "여우", "펭귄", "고래"];
export function validateNickname(value: string): string | null {
  const nickname = value.normalize("NFKC").trim();
  if (/[\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/u.test(value + nickname)) return "초성이나 낱자 대신 완성된 한글을 입력해 주세요";
  const compact = nickname.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  if (/^[il1]{4,}$/.test(compact) || /[il1]{6,}/.test(compact) || /^[o0]{6,}$/.test(compact)) return "구분하기 어려운 바코드 닉네임은 사용할 수 없어요";
  if (bannedNicknameWords.some((word) => compact.includes(word))) return "사용할 수 없는 표현이 포함되어 있어요";
  if (!nickname) return "닉네임을 입력해 주세요";
  if (!/^[A-Za-z가-힣0-9 ]+$/u.test(nickname)) return "한글, 영어, 숫자와 띄어쓰기를 사용할 수 있어요";
  if (Array.from(nickname).length > 20) return "닉네임은 20자 이내로 입력해 주세요";
  return null;
}
export function randomNickname(current: string, random = Math.random): string {
  const combinations = nicknameAdjectives.flatMap((adjective) => nicknameAnimals.map((animal) => `${adjective} ${animal}`)).filter((name) => name !== current);
  return combinations[Math.min(combinations.length-1, Math.max(0, Math.floor(random()*combinations.length)))] ?? "다정한 수달";
}
export function rememberRoomNickname(names: Record<string, string>, roomId: string, nickname: string): Record<string, string> {
  return names[roomId] !== undefined ? names : { ...names, [roomId]: nickname };
}
export function blockUser(blocked: BlockedUser[], user: BlockedUser): BlockedUser[] {
  return blocked.some((entry) => entry.userId === user.userId) ? blocked : [...blocked, user];
}
export function visibleMessages<T extends { userId: string }>(messages: T[], blocked: BlockedUser[]): T[] {
  const ids = new Set(blocked.map((entry) => entry.userId));
  return messages.filter((message) => !ids.has(message.userId));
}
export function createReport(message: { id: number; userId: string; nick: string; text: string }, roomId: string, id: number, date: string): ReportRecord {
  return { id, userId: message.userId, nickname: message.nick, roomId, messageId: message.id, text: message.text, date, status: "검토 중" };
}