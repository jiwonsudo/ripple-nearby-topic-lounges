import { useEffect, useRef } from "react";

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
uniform vec3 uTouches[6];

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
  vec3 water = mix(uDeep,uShallow,depth*0.65+diffuse*0.2);
  float curvature = (surface(p+vec2(0.009,0.0))+surface(p-vec2(0.009,0.0))+surface(p+vec2(0.0,0.009))+surface(p-vec2(0.0,0.009))-4.0*h)*160.0;
  water = mix(water,uDeep,clamp(curvature*0.45,0.0,0.14));
  water = mix(water,uShallow,clamp(-curvature*0.55,0.0,0.22));
  water = mix(water,uHighlight,broad*0.12+reflection*0.035);
  water = mix(water,uHighlight,spec*0.6+softReflection*0.22+refractedLight*0.08);
  float fresnel = pow(1.0-normal.z,2.0);
  water = mix(water,uHighlight,fresnel*0.28);
  gl_FragColor = vec4(water,1.0);
}
`;

export default function WaterSurface({ dark }: { dark: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import("three").then((THREE) => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" }); }
      catch { element.dataset['fallback'] = "true"; return; }
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
      const uniforms = {
        uTime: { value: 0 }, uAspect: { value: 1 },
        uDeep: { value: color("--water-deep") }, uShallow: { value: color("--water-shallow") }, uHighlight: { value: color("--water-highlight") },
        uTouches: { value: Array.from({ length: 6 }, () => new THREE.Vector3(0,0,-10)) },
      };
      const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
      const scene = new THREE.Scene();
      const geometry = new THREE.PlaneGeometry(2,2);
      scene.add(new THREE.Mesh(geometry, material));
      const camera = new THREE.Camera();
      const resize = () => {
        renderer.setSize(element.clientWidth, element.clientHeight);
        uniforms.uAspect.value = element.clientWidth / Math.max(element.clientHeight,1);
      };
      const observer = new ResizeObserver(resize); observer.observe(element); resize();
      const clock = new THREE.Clock();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let frame = 0;
      const render = () => {
        uniforms.uTime.value = reduced ? 1.5 : clock.getElapsedTime();
        renderer.render(scene,camera);
        if (!reduced) frame = requestAnimationFrame(render);
      };
      let touchIndex = 0;
      const touch = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        const ripple = uniforms.uTouches.value[touchIndex];
        if (!ripple || reduced) return;
        ripple.set(((event.clientX-box.left)/box.width-0.5)*box.width/box.height,0.5-(event.clientY-box.top)/box.height,uniforms.uTime.value);
        touchIndex = (touchIndex + 1) % uniforms.uTouches.value.length;
      };
      element.addEventListener("pointerdown",touch); render();
      dispose = () => { cancelAnimationFrame(frame); observer.disconnect(); element.removeEventListener("pointerdown",touch); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove(); };
    });
    return () => { cancelled = true; dispose?.(); };
  }, [dark]);
  return <div ref={host} className="water-surface absolute inset-0" role="img" aria-label="주변에서 퍼지는 실시간 물결" />;
}