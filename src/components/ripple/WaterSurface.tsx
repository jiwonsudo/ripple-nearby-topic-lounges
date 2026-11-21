import { useEffect, useRef } from "react";
import type { PoolFrame, PoolTouch } from "./pool-motion";

const vertexShader = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uHighlight;
uniform sampler2D uFloor;
uniform vec3 uTouches[6];
uniform vec3 uSwimmers[12];

float ring(vec2 p, vec2 origin, float clock, float strength) {
  float d = length(p - origin);
  float age = mod(clock, 6.5);
  float front = age * 0.13;
  float envelope = exp(-pow((d-front)*10.0,2.0)) * exp(-age*0.34) * smoothstep(0.0,0.45,age) * (1.0-smoothstep(5.5,6.5,age));
  return sin(d*48.0-age*6.2) * envelope * strength;
}
float surface(vec2 p) {
  float t = uTime;
  float w = sin(p.x*8.0 + t*0.32) * cos(p.y*9.0-t*0.26) * 0.014;
  w += sin(p.x*19.0+p.y*12.0+t*0.38)*0.004;
  w += sin(p.x*38.0-p.y*25.0+t*0.55)*0.0015;
  w += ring(p, vec2(0.0,0.0), t+2.3, 0.012);
  w += ring(p, vec2(-0.29,0.24), t+0.8, 0.009);
  w += ring(p, vec2(0.3,-0.19), t+4.1, 0.01);
  for (int i = 0; i < 12; i++) {
    float d = length(p-uSwimmers[i].xy);
    float fade = exp(-d*38.0);
    w += sin(d*75.0-t*2.1+uSwimmers[i].z)*fade*0.0012;
  }
  for (int i = 0; i < 6; i++) {
    float age = t-uTouches[i].z;
    float d = length(p-uTouches[i].xy);
    if (age >= 0.0 && age < 6.0) {
      w += sin(d*52.0-age*9.0)*exp(-pow((d-age*0.16)*10.0,2.0))*exp(-age*0.6)*smoothstep(0.0,0.15,age)*0.009;
    }
  }
  return w;
}
void main() {
  vec2 p = (vUv-0.5)*vec2(uAspect,1.0);
  float e = 0.002;
  float h = surface(p);
  vec2 slope = vec2(surface(p+vec2(e,0.0))-surface(p-vec2(e,0.0)),surface(p+vec2(0.0,e))-surface(p-vec2(0.0,e)))/(2.0*e);
  vec3 normal = normalize(vec3(-slope*0.7,1.0));
  vec3 light = normalize(vec3(-0.5,0.65,1.2));
  float diffuse = max(dot(normal,light),0.0);
  float spec = pow(max(dot(reflect(-light,normal),vec3(0.0,0.0,1.0)),0.0),24.0);
  vec3 windowLight = normalize(vec3(0.3,-0.2,1.4));
  float softReflection = pow(max(dot(reflect(-windowLight,normal),vec3(0.0,0.0,1.0)),0.0),12.0);
  float broad = pow(max(dot(normal,normalize(vec3(0.25,0.3,1.0))),0.0),8.0);
  vec2 q = p + slope*0.025;
  float reflection = sin(q.x*5.0+q.y*3.0+uTime*0.16)*sin(q.y*6.0-q.x*2.0-uTime*0.12);
  float refractedLight = pow(0.5+0.5*sin(q.x*18.0+q.y*9.0+sin(q.y*13.0-uTime*0.25)*1.8),6.0);
  float depth = smoothstep(-0.6,0.7,p.y + h*3.0);
  vec2 floorUv = vUv + slope*0.026 + vec2(sin(p.y*11.0+uTime*0.4), cos(p.x*10.0-uTime*0.3))*0.002;
  vec3 floorColor = texture2D(uFloor,clamp(floorUv,0.001,0.999)).rgb;
  vec3 water = mix(floorColor,mix(uDeep,uShallow,depth*0.65+diffuse*0.2),0.24);
  float curvature = (surface(p+vec2(0.009,0.0))+surface(p-vec2(0.009,0.0))+surface(p+vec2(0.0,0.009))+surface(p-vec2(0.0,0.009))-4.0*h)*160.0;
  water = mix(water,uDeep,clamp(curvature*0.45,0.0,0.14));
  water = mix(water,uShallow,clamp(-curvature*0.55,0.0,0.22));
  water = mix(water,uHighlight,broad*0.12+reflection*0.035);
  water = mix(water,uHighlight,spec*0.32+softReflection*0.14+refractedLight*0.1);
  float fresnel = pow(1.0-normal.z,2.0);
  water = mix(water,uHighlight,fresnel*0.28);
  gl_FragColor = vec4(water,1.0);
}
`;

export default function WaterSurface({ dark, active = true, count = 12, onReady }: { dark: boolean; active?: boolean; count?: number; onReady?: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const resume = useRef<(() => void) | null>(null);
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  useEffect(() => { activeRef.current = active; resume.current?.(); }, [active]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("three").then((THREE) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" }); }
      catch { element.dataset['fallback'] = "true"; readyRef.current?.(); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      element.appendChild(renderer.domElement);
      const tokens = getComputedStyle(element);
      const color = (token: string) => {
        const canvas = document.createElement("canvas"); canvas.width = 1; canvas.height = 1;
        const context = canvas.getContext("2d");
        if (!context) return new THREE.Color();
        context.fillStyle = tokens.getPropertyValue(token).trim(); context.fillRect(0,0,1,1);
        const rgb = context.getImageData(0,0,1,1).data;
        return new THREE.Color().setRGB((rgb[0] ?? 0)/255,(rgb[1] ?? 0)/255,(rgb[2] ?? 0)/255);
      };
      const floorCanvas = document.createElement("canvas");
      const floorTexture = new THREE.CanvasTexture(floorCanvas);
      floorTexture.minFilter = THREE.LinearFilter;
      const paintFloor = () => {
        const width = 780;
        const height = Math.round(width * element.clientHeight / Math.max(element.clientWidth, 1));
        floorCanvas.width = width; floorCanvas.height = height;
        const ctx = floorCanvas.getContext("2d");
        if (!ctx) return;
        const paint = (token: string) => tokens.getPropertyValue(token).trim();
        ctx.fillStyle = paint("--pool-floor"); ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = paint("--pool-grout"); ctx.lineWidth = 1.5;
        const tile = 64;
        ctx.beginPath();
        for (let x = 0; x < width; x += tile) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
        for (let y = 0; y < height; y += tile) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
        ctx.stroke();
        const anchor = element.closest(".phone-shell")?.querySelector("[data-pool-floor-anchor]")?.getBoundingClientRect();
        const box = element.getBoundingClientRect();
        const center = anchor ? (anchor.top - box.top) / Math.max(box.height, 1) * height : height * 0.53;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = paint("--pool-lettering");
        ctx.font = '800 180px "Pretendard Variable", system-ui, sans-serif';
        ctx.fillText(String(count), width / 2, center - 15);
        ctx.font = '600 24px "Pretendard Variable", system-ui, sans-serif';
        ctx.fillText("명 · 지금 이곳의 ripplers", width / 2, center + 105);
        floorTexture.needsUpdate = true;
      };
      const uniforms = {
        uTime: { value: 0 }, uAspect: { value: 1 },
        uDeep: { value: color("--water-deep") }, uShallow: { value: color("--water-shallow") }, uHighlight: { value: color("--water-highlight") },
        uTouches: { value: Array.from({ length: 6 }, () => new THREE.Vector3(0,0,-10)) },
        uSwimmers: { value: Array.from({ length: 12 }, (_, i) => new THREE.Vector3(-10,-10,i)) },
        uFloor: { value: floorTexture },
      };
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneGeometry(2,2);
      scene.add(new THREE.Mesh(geometry, material));
      const camera = new THREE.Camera();
      const resize = () => {
        renderer.setSize(element.clientWidth, element.clientHeight);
        uniforms.uAspect.value = element.clientWidth / Math.max(element.clientHeight,1);
        paintFloor();
      };
      const observer = new ResizeObserver(resize); observer.observe(element); resize();
      const clock = new THREE.Clock();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let frame = 0;
      let lastPoolFrame = -1;
      let touches: PoolTouch[] = [];
      const shell = element.closest(".phone-shell");
      const render = () => {
        uniforms.uTime.value = reduced ? 1.5 : clock.getElapsedTime();
        renderer.render(scene,camera);
        if (activeRef.current && (reduced || uniforms.uTime.value - lastPoolFrame > 1 / 30)) {
          lastPoolFrame = uniforms.uTime.value;
          touches = touches.filter((touch) => uniforms.uTime.value - touch.time < 6);
          const detail: PoolFrame = { time: uniforms.uTime.value, width: element.clientWidth, height: element.clientHeight, touches };
          shell?.dispatchEvent(new CustomEvent<PoolFrame>("pool-frame", { detail }));
          const swimmers = shell?.querySelectorAll<HTMLElement>("[data-swimmer-id]");
          uniforms.uSwimmers.value.forEach((value, index) => {
            const row = swimmers?.[index];
            if (!row) { value.set(-10,-10,index); return; }
            const x = Number(row.dataset['poolX']); const y = Number(row.dataset['poolY']);
            value.set((x / element.clientWidth - 0.5) * uniforms.uAspect.value, 0.5 - y / element.clientHeight,index);
          });
        }
        if (!reduced && activeRef.current) frame = requestAnimationFrame(render);
      };
      let touchIndex = 0;
      const touch = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        const ripple = uniforms.uTouches.value[touchIndex];
        if (!ripple || reduced || !activeRef.current) return;
        ripple.set(((event.clientX-box.left)/box.width-0.5)*box.width/box.height,0.5-(event.clientY-box.top)/box.height,uniforms.uTime.value);
        touches = [...touches.slice(-5), { x: event.clientX - box.left, y: event.clientY - box.top, time: uniforms.uTime.value }];
        touchIndex = (touchIndex + 1) % uniforms.uTouches.value.length;
      };
      resume.current = () => {
        cancelAnimationFrame(frame);
        if (activeRef.current) {
          const stage = element.closest(".phone-shell")?.querySelector(".water-center");
          if (stage) observer.observe(stage);
          paintFloor(); render();
        }
      };
      element.addEventListener("pointerdown",touch); render();
      element.dataset['ready'] = "true";
      readyRef.current?.();
      dispose = () => { resume.current = null; cancelAnimationFrame(frame); observer.disconnect(); element.removeEventListener("pointerdown",touch); geometry.dispose(); material.dispose(); floorTexture.dispose(); renderer.dispose(); renderer.domElement.remove(); delete element.dataset['ready']; };
    });
    return () => { cancelled = true; dispose?.(); };
  }, [dark, count]);
  return <div ref={host} className="water-surface absolute inset-0" role="img" aria-label={`${count}명이 새겨진 수영장 바닥 위로 일렁이는 물결`} />;
}