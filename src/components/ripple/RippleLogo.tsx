import logo from "@/assets/brand/ripple-logo-a.png.asset.json";

export function RippleLogo({ large = false, symbolOnly = false, shimmer = false }: { large?: boolean; symbolOnly?: boolean; shimmer?: boolean }) {
  return <span className={`items-center gap-2 ${large ? "flex flex-col gap-3" : "inline-flex"}`}><span className="relative inline-flex"><img src={logo.url} alt="리플 물방울 로고" className={large ? "h-20 w-20 object-contain" : "h-10 w-10 object-contain"} />{shimmer && <span aria-hidden="true" className="splash-logo-reflection absolute inset-0" style={{ maskImage: `url(${logo.url})` }} />}</span>{!symbolOnly && <span className={`${large ? "text-[32px] font-black" : "text-[28px] font-black"} ${shimmer ? "splash-wordmark" : ""}`}>Ripple</span>}</span>;
}