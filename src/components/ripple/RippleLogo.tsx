import logo from "@/assets/brand/ripple-logo-a.png.asset.json";

export function RippleLogo({ large = false, symbolOnly = false }: { large?: boolean; symbolOnly?: boolean }) {
  return <span className={`items-center gap-2 ${large ? "flex flex-col gap-3" : "inline-flex"}`}><img src={logo.url} alt="리플 물방울 로고" className={large ? "h-20 w-20 object-contain" : "h-10 w-10 object-contain"} />{!symbolOnly && <span className={large ? "text-[32px] font-black" : "text-[28px] font-black"}>Ripple</span>}</span>;
}