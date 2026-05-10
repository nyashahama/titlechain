interface HeroDashboardMockupProps {
  placement?: "aside" | "below";
}

export function HeroDashboardMockup({
  placement = "aside",
}: HeroDashboardMockupProps) {
  if (placement === "below") {
    return (
      <div className="bg-[hsl(0_0%_4%)] mx-auto -mb-8 max-h-[min(60vw,320px)] w-full max-w-[min(1185px,calc(100vw-1rem))] scale-[0.88] overflow-hidden rounded-t-2xl border-x border-t border-white/10 px-2 pt-2 backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,black_44%,transparent_100%)] sm:max-h-[min(56vw,360px)] sm:scale-95 md:mb-0 md:max-h-[min(50vw,400px)] md:scale-100 md:[mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)] lg:max-h-[min(48vw,440px)]">
        <div className="bg-[hsl(0_0%_2%)] h-full overflow-hidden rounded-t-xl">
          <div className="flex h-full items-center justify-center px-8 py-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-orange-500/10">
                <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8.5" y="10.5" width="15" height="19" rx="6.5" transform="rotate(-45 16 20)" stroke="#F97316" strokeWidth="3.2"/>
                  <rect x="18.5" y="10.5" width="15" height="19" rx="6.5" transform="rotate(-45 26 20)" stroke="#FDBA74" strokeWidth="3.2"/>
                  <path d="M21 12.5V29.5" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                  <path d="M16.1 20H25.9" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Clear-to-Lodge Intelligence</p>
                <p className="mt-1 text-sm text-white/45">Instantly verify property titles across South Africa</p>
              </div>
              <div className="flex items-center justify-center gap-3 text-xs text-white/30">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Verified</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" />Review</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-400" />Stop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(0_0%_4%)] max-w-[150vw] -translate-y-32 translate-x-8 scale-70 overflow-hidden rounded-t-2xl border-x border-t border-white/10 px-2 pt-2 backdrop-blur-2xl [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] md:mt-12 md:mb-0 md:translate-y-0 md:translate-x-1/4 md:scale-100 md:[mask-image:linear-gradient(to_bottom,black_100%,transparent_100%)] lg:ml-12">
      <div className="bg-[hsl(0_0%_2%)] h-full overflow-hidden rounded-t-xl">
        <div className="flex h-full items-center justify-center px-8 py-16 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-orange-500/10">
              <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8.5" y="10.5" width="15" height="19" rx="6.5" transform="rotate(-45 16 20)" stroke="#F97316" strokeWidth="3.2"/>
                <rect x="18.5" y="10.5" width="15" height="19" rx="6.5" transform="rotate(-45 26 20)" stroke="#FDBA74" strokeWidth="3.2"/>
                <path d="M21 12.5V29.5" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
                <path d="M16.1 20H25.9" stroke="white" strokeWidth="3.6" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Clear-to-Lodge Intelligence</p>
              <p className="mt-1 text-sm text-white/45">Instantly verify property titles across South Africa</p>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-white/30">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />Verified</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" />Review</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-400" />Stop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
