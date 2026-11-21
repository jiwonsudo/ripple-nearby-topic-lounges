import { describe, expect, it } from "vitest";
import { createPoolBody, stepPoolBody, throwPoolBody, poolActivity, poolCharacterSize, poolPosition } from "./pool-motion";

describe("pool character rules", () => {
  it("throws from the release point with bounded momentum", () => {
    const thrown = throwPoolBody(createPoolBody(0,390,400,true),120,180,600,800);
    expect(thrown.x).toBe(120); expect(thrown.y).toBe(180);
    expect(Math.hypot(thrown.vx,thrown.vy)).toBe(240);
    const moved = stepPoolBody({...thrown,lastTime:0},0.08,390,400,true);
    expect(moved.x).toBeGreaterThan(120); expect(moved.y).toBeGreaterThan(180);
  });
  it("keeps wave displacement instead of pulling the rider back", () => {
    const initial = { ...createPoolBody(4, 390, 400, true), x: 190, y: 200, vx: 0, vy: 0, lastTime: 0 };
    let body = stepPoolBody(initial, 0.05, 390, 400, true, [{ x: 170, y: 200, time: 0 }]);
    expect(body.vx).toBeGreaterThan(30);
    for (let time = 0.1; time < 5; time += 0.05) body = stepPoolBody(body, time, 390, 400, true);
    expect(body.x).toBeGreaterThan(initial.x + 35);
    const displaced = body.x;
    body = stepPoolBody(body, 5.05, 390, 400, true);
    expect(body.x).toBeGreaterThanOrEqual(displaced);
  });
  it("bounces inward off all four walls", () => {
    const seed = createPoolBody(0, 390, 400, true);
    for (const edge of [{x:41,y:200,vx:-80,vy:0}, {x:349,y:200,vx:80,vy:0}, {x:190,y:41,vx:0,vy:-80}, {x:190,y:359,vx:0,vy:80}]) {
      const result = stepPoolBody({ ...seed, ...edge, lastTime:0 }, 0.08,390,400,true);
      if (edge.vx) expect(result.vx * edge.vx).toBeLessThan(0);
      if (edge.vy) expect(result.vy * edge.vy).toBeLessThan(0);
    }
  });
  it("swims only when there is no tube", () => { expect(poolActivity({ float: "none" })).toBe("swimming"); });
  it("floats without swimming for ring, flamingo and dolphin tubes", () => {
    for (const float of ["ring", "flamingo", "dolphin"] as const) expect(poolActivity({ float })).toBe("floating");
  });
  it("keeps home characters compact at 32px", () => { expect(poolCharacterSize).toBe(32); });
  it("keeps all 12 characters inside the pool even while moving and reacting", () => {
    for (const [width, height] of [[360, 210], [390, 400]] as const) {
      for (let index = 0; index < 12; index++) for (let time = 0; time <= 60; time += 0.5) {
        const pos = poolPosition(index, time, width, height, index % 2 === 0, [{ x: 80, y: 100, time: time - 0.8 }]);
        expect(pos.x).toBeGreaterThanOrEqual(40); expect(pos.x).toBeLessThanOrEqual(width - 40);
        expect(pos.y).toBeGreaterThanOrEqual(40); expect(pos.y).toBeLessThanOrEqual(height - 40);
      }
    }
  });
  it("pushes a rider away when the water's expanding touch wave reaches them", () => {
    const base = poolPosition(4, 2, 390, 400, true);
    const reacted = poolPosition(4, 2, 390, 400, true, [{ x: base.x - 51.2, y: base.y, time: 1.2 }]);
    expect(reacted.x).toBeGreaterThan(base.x + 5); expect(reacted.push).toBeGreaterThan(5);
  });
  it("moves both swimmers and floating riders over time", () => {
    for (const floating of [true, false]) expect(poolPosition(2, 0, 390, 400, floating)).not.toEqual(poolPosition(2, 4, 390, 400, floating));
  });
});