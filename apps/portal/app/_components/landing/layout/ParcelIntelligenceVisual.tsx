import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";

export function ParcelIntelligenceVisual({
  compact = false,
  testId = "parcel-intelligence-visual",
}: {
  compact?: boolean;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="relative isolate flex h-full min-h-[22rem] overflow-hidden bg-[#020203] text-white lg:min-h-[34rem]"
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: "skewY(-8deg) scale(1.12)",
          transformOrigin: "left center",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_72%,rgba(101,115,255,0.32),transparent_30%),radial-gradient(circle_at_76%_16%,rgba(216,195,106,0.16),transparent_22%),linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.62)_92%)]" />
      <div className="absolute left-[7%] top-[18%] h-[25rem] w-[38rem] -rotate-6 rounded-[2.5rem] border border-white/[0.12] bg-white/[0.035] shadow-[0_2rem_7rem_rgba(0,0,0,0.5)]" />
      <div className="absolute left-[11%] top-[28%] h-[10rem] w-[18rem] -skew-x-12 rounded-3xl border-2 border-indigo-300/80 bg-indigo-400/[0.08] shadow-[0_0_5rem_rgba(101,115,255,0.4)]" />
      <div className="absolute left-[29%] top-[47%] h-20 w-20 rounded-full border border-[#d8c36a]/70 bg-[#d8c36a]/[0.12] shadow-[0_0_3rem_rgba(216,195,106,0.36)]" />
      <div className="absolute left-[16%] top-[40%] flex -rotate-6 items-center gap-3">
        <span className="h-11 w-20 rounded-full border-2 border-indigo-200/80" />
        <span className="-ml-7 h-11 w-20 rounded-full border-2 border-indigo-400/80" />
        <span className="-ml-7 h-11 w-20 rounded-full border-2 border-indigo-500/80" />
      </div>
      <div className="absolute bottom-12 left-12 right-12 z-10 max-w-[28rem]">
        {!compact && (
          <>
            <p className="mb-4 inline-flex rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/62">
              Verified registry chain
            </p>
            <h1 className="font-display text-5xl font-semibold leading-none text-white lg:text-[5rem]">
              Every parcel, resolved
              <span className="text-indigo-400">_</span>
            </h1>
          </>
        )}
      </div>
      {!compact && (
        <div className="absolute left-10 top-10 z-10">
          <TitlechainLogo className="h-8 w-auto text-white" />
        </div>
      )}
    </div>
  );
}
