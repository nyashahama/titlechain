import { cn } from "@/app/_lib/cn";

interface HeroDashboardMockupProps {
  placement?: "aside" | "below";
}

const MOCKUP_SRC = "/assets/visuals/titlechain-dashboard.svg";
const MOCKUP_WIDTH = 1280;
const MOCKUP_HEIGHT = 483;
const MOCKUP_ALT =
  "TitleChain console overview with property title verification metrics and risk status";

export function HeroDashboardMockup({
  placement = "aside",
}: HeroDashboardMockupProps) {
  return (
    <div
      className={cn(
        placement === "aside" &&
          "bg-[hsl(0_0%_4%)] max-w-[150vw] -translate-y-32 translate-x-8 scale-70 overflow-hidden rounded-t-2xl border-x border-t border-white/10 px-2 pt-2 backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] md:mt-10 md:mb-0 md:translate-y-0 md:translate-x-1/4 md:scale-100 md:[mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)] lg:ml-12",
        placement === "below" &&
          "bg-[#080a14] mx-auto mt-8 max-h-[min(66vw,360px)] w-full max-w-[min(1206px,calc(100vw-1rem))] overflow-hidden rounded-t-2xl border-x border-t border-indigo-100/15 px-2 pt-2 shadow-[0_0_110px_rgba(101,115,255,0.16)] backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)] sm:mt-9 sm:max-h-[min(62vw,400px)] md:mt-16 md:max-h-[min(54vw,440px)] lg:max-h-[min(48vw,480px)]"
      )}
    >
      <div className="h-full overflow-hidden rounded-t-xl bg-[#03040a]">
        <img
          src={MOCKUP_SRC}
          alt={MOCKUP_ALT}
          width={MOCKUP_WIDTH}
          height={MOCKUP_HEIGHT}
          className="block h-auto w-full"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
