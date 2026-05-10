import {
  ClearToLodgeTile,
  RiskEngineTile,
  DeedsSearchTile,
  FraudDetectionTile,
  BondCheckTile,
  CoverageTile,
} from "./animations";

export function Bento() {
  return (
    <div className="container py-20">
      <div className="mx-auto mb-16 flex max-w-5xl flex-col gap-8">
        <h2 className="mx-auto text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          All the intelligence you need <br />
          in one platform
        </h2>

        {/* Desktop product strip */}
        <div className="hidden justify-center gap-4 lg:flex">
          <div className="relative flex h-10 items-center gap-4 rounded-full border border-dashed border-white/[0.06] bg-[hsl(0_0%_4%)] p-1 text-sm after:absolute after:top-1/2 after:-right-22 after:h-px after:w-22 after:-translate-y-1/2 after:border-b after:border-dashed after:border-white/[0.06]">
            <span className="ml-3 text-[0.625rem] font-semibold uppercase tracking-wider text-white/40">
              Verify
            </span>
            <div className="flex h-full w-full justify-between gap-2">
              {[
                { name: "Clear-to-Lodge" },
                { name: "Risk Engine" },
                { name: "Deeds" },
                { name: "Bonds" },
                { name: "Fraud" },
              ].map((p) => (
                <a
                  key={p.name}
                  href="#"
                  className="flex h-full w-fit items-center justify-center gap-2 rounded-full bg-white/[0.04] px-3 text-xs font-medium text-white/70 backdrop-blur-lg transition-colors hover:bg-white/[0.08]"
                >
                  {p.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:grid md:grid-cols-12">
        <ClearToLodgeTile />
        <RiskEngineTile />
        <DeedsSearchTile />
        <FraudDetectionTile />
        <BondCheckTile />
        <CoverageTile />
      </div>
    </div>
  );
}
