"use client";

import { GradientText, Noise } from "@/app/_components/landing/Fancy";
import { cn } from "@/app/_lib/cn";
import { DomainIcon } from "./shared/DomainIcons";

const platforms = [
  { name: "Deeds Office", icon: "deeds-office" },
  { name: "SARS", icon: "sars" },
  { name: "FIC", icon: "fic" },
  { name: "Lightstone", icon: "lightstone" },
  { name: "Windeed", icon: "windeed" },
  { name: "GhostConvey", icon: "ghostconvey" },
] as const;

const confidenceSignals = [
  "Registry source trace",
  "KYC and tax clearance",
  "Matter-system sync",
];

interface PlatformsProps {
  headline?: string;
  className?: string;
}

export function Platforms({
  headline = "Integrated with South Africa's leading property data sources",
  className,
}: PlatformsProps) {
  return (
    <div className={cn("relative z-10", className)}>
      <div className="container flex flex-col items-center pt-1 md:pt-2">
        <h2 className="m-0 w-full px-4 text-center">
          <GradientText className="text-[0.9375rem] leading-snug font-normal tracking-tight text-pretty lg:text-[1rem]">
            <span className="mx-auto mb-1.5 block max-w-[22rem] text-center lg:mb-2 lg:max-w-3xl">
              {headline}
            </span>
          </GradientText>
        </h2>
      </div>

      <div className="border-y border-dashed border-white/[0.06]">
        <div className="container flex flex-col items-center py-0">
          <div className="w-full" role="region" aria-label="Partner integrations">
            <div className="flex h-14 w-full min-w-0 flex-nowrap items-stretch gap-x-1 sm:gap-x-1.5 lg:gap-x-2">
              <div className="scrollbar-none relative min-h-14 w-full overflow-x-auto overflow-y-hidden [mask-image:linear-gradient(to_right,black_92%,transparent_100%),linear-gradient(to_left,black_92%,transparent_100%)] [mask-composite:intersect] lg:overflow-clip">
                <div className="flex h-14 min-h-14 w-max min-w-full flex-nowrap items-stretch lg:w-full">
                  {platforms.map((platform, i) => (
                    <div
                      key={platform.name}
                      className="group relative flex h-14 min-h-14 min-w-[9.5rem] flex-none cursor-pointer overflow-hidden border-r border-dashed border-white/[0.06] animate-fade-in lg:min-w-0 lg:flex-1 lg:basis-0"
                      style={{ animationDelay: `${i * 12}ms` }}
                    >
                      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tl from-indigo-500/10 to-indigo-400/5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Noise opacity={0.1} />
                      </div>
                      <span className="relative z-10 flex size-full min-h-0 min-w-0 items-center justify-center px-4 py-2">
                        <span className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-white/60 transition-colors group-hover:text-white/90">
                          <DomainIcon
                            name={platform.icon}
                            className="size-4 shrink-0 text-indigo-300/80"
                          />
                          {platform.name}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container hidden py-4 md:block">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/30">
          {confidenceSignals.map((signal, index) => (
            <span key={signal} className="flex items-center gap-3">
              <span>{signal}</span>
              {index < confidenceSignals.length - 1 && (
                <span className="h-px w-10 bg-white/[0.08]" aria-hidden="true" />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
