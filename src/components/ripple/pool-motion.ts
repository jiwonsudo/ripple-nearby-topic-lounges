import type { Avatar } from "./avatar";

export type PoolTouch = { x: number; y: number; time: number };
export type PoolFrame = { time: number; width: number; height: number; touches: PoolTouch[] };
export type PoolPosition = { x: number; y: number; rotation: number; push: number };
export type PoolBody = PoolPosition & { vx: number; vy: number; lastTime: number; hitWaves: number[] };
export const poolCharacterSize = 32;
export function throwPoolBody(body: PoolBody, x: number, y: number, vx: number, vy: number): PoolBody {
  const speed = Math.hypot(vx, vy);
  const scale = speed > 240 ? 240 / speed : 1;
  return { ...body, x, y, vx: vx * scale, vy: vy * scale, hitWaves: [], push: 0 };
}
export function poolActivity(avatar: Pick<Avatar, "float">) { return avatar.float === "none" ? "swimming" : "floating"; }

export function createPoolBody(index: number, width: number, height: number, floating: boolean): PoolBody {
  const pos = poolPosition(index, 0, width, height, floating);
  const angle = index * 2.17;
  const speed = floating ? 3 : 9;
  return { ...pos, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, lastTime: -1, hitWaves: [] };
}

export function stepPoolBody(body: PoolBody, time: number, width: number, height: number, floating: boolean, touches: PoolTouch[] = [], waveHeight = height): PoolBody {
  const dt = body.lastTime < 0 || time < body.lastTime ? 0 : Math.min(time - body.lastTime, 0.08);
  let { x, y, vx, vy } = body;
  let push = 0;
  const hitWaves = body.hitWaves.filter((stamp) => touches.some((touch) => touch.time === stamp));
  for (const touch of touches) {
    const age = time - touch.time;
    if (age <= 0 || age > 6 || hitWaves.includes(touch.time)) continue;
    const dx = x - touch.x; const dy = y - touch.y;
    const distance = Math.hypot(dx, dy);
    if (Math.abs(distance - age * 0.16 * waveHeight) > 25) continue;
    const strength = 65 * Math.exp(-age * 0.28);
    vx += (distance > 1 ? dx / distance : 1) * strength;
    vy += (distance > 1 ? dy / distance : 0) * strength;
    hitWaves.push(touch.time); push = strength;
  }
  // Drag slows movement; there is deliberately no spring to a starting position.
  const drag = Math.exp(-dt * (floating ? 0.45 : 0.28));
  vx *= drag; vy *= drag;
  if (!floating) {
    const speed = Math.hypot(vx, vy);
    if (speed > 0.01 && speed < 9) { vx *= 9 / speed; vy *= 9 / speed; }
  }
  x += vx * dt; y += vy * dt;
  const padding = 40;
  const minX = Math.min(padding, width / 2); const maxX = Math.max(width - padding, width / 2);
  const minY = Math.min(padding, height / 2); const maxY = Math.max(height - padding, height / 2);
  if (x < minX) { x = minX; vx = Math.abs(vx) * 0.85; }
  if (x > maxX) { x = maxX; vx = -Math.abs(vx) * 0.85; }
  if (y < minY) { y = minY; vy = Math.abs(vy) * 0.85; }
  if (y > maxY) { y = maxY; vy = -Math.abs(vy) * 0.85; }
  const angle = Math.atan2(vx, -vy) * 180 / Math.PI;
  const rotation = floating ? body.rotation + Math.sin(time * 0.8 + x * 0.01) * dt * 3 : angle;
  return { x, y, vx, vy, rotation, push, lastTime: time, hitWaves };
}

// Padding includes the entire rotated character, wake and the self label.
export function poolPosition(index: number, time: number, width: number, height: number, floating: boolean, touches: PoolTouch[] = []): PoolPosition {
  const padding = 40;
  const usableW = Math.max(0, width - padding * 2);
  const usableH = Math.max(0, height - padding * 2);
  const cols = [0.12, 0.49, 0.86];
  const rows = [0.06, 0.31, 0.69, 0.94];
  const column = cols[index % 3] ?? 0.5;
  const row = rows[Math.floor(index / 3) % 4] ?? 0.5;
  const speed = floating ? 0.14 : 0.27;
  const phase = time * speed + index * 2.17;
  const ampX = Math.min(usableW * 0.085, floating ? 12 : 24);
  const ampY = Math.min(usableH * 0.07, floating ? 10 : 20);
  let x = padding + column * usableW + Math.sin(phase) * ampX;
  let y = padding + row * usableH + Math.cos(phase * 0.8) * ampY;
  let pushX = 0; let pushY = 0;
  for (const touch of touches) {
    const age = time - touch.time;
    if (age <= 0 || age >= 6) continue;
    const dx = x - touch.x; const dy = y - touch.y;
    const distance = Math.hypot(dx, dy);
    const front = age * 0.16 * height;
    const force = Math.exp(-(((distance - front) / 38) ** 2)) * Math.exp(-age * 0.6) * Math.min(age / 0.15, 1) * 18;
    pushX += (distance > 1 ? dx / distance : 1) * force;
    pushY += (distance > 1 ? dy / distance : 0) * force;
  }
  // The same calm ambient waves that deform the floor gently rock all riders.
  const bob = Math.sin(time * 1.2 + x * 0.018 - y * 0.013) * 1.8;
  x += pushX; y += pushY + bob;
  const clamp = (n: number, max: number) => Math.min(Math.max(n, Math.min(padding, max / 2)), Math.max(max - padding, max / 2));
  const heading = floating ? Math.sin(phase * 0.7) * 18 + index * 29 : Math.atan2(Math.cos(phase) * ampX, -Math.sin(phase * 0.8) * ampY * 0.8) * 180 / Math.PI;
  return { x: clamp(x, width), y: clamp(y, height), rotation: heading + bob * 2 + pushX * 0.8, push: Math.hypot(pushX, pushY) };
}