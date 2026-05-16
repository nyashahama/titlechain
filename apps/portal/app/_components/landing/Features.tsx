const features = [
  {
    label: "Matter permissions",
    kicker: "Access",
    description:
      "Limit who can view, verify, approve, and export sensitive title records.",
    preview: (
      <div className="grid grid-cols-3 gap-1.5">
        {["Bank", "Firm", "Ops", "View", "Verify", "Approve"].map((item, i) => (
          <span
            key={item}
            className="grid h-8 place-items-center rounded-md border border-[#d8d8df] bg-white/60 text-[10px] text-[#60606a]"
          >
            {i > 2 ? <span className="size-1.5 rounded-full bg-indigo-500" /> : item}
          </span>
        ))}
      </div>
    ),
  },
  {
    label: "Encrypted title packet",
    kicker: "Security",
    description:
      "Keep title deeds, ID documents, mandates, and bond records protected end-to-end.",
    preview: (
      <div className="rounded-xl border border-[#d8d8df] bg-white/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#70707a]">
            Packet
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            sealed
          </span>
        </div>
        <div className="mt-3 grid grid-cols-9 gap-1">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full bg-[#cfd0d8]"
              style={{ opacity: i % 3 === 0 ? 0.75 : 0.3 }}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Audit-ready decisions",
    kicker: "Traceability",
    description:
      "Preserve a defensible trail behind every Clear-to-Lodge recommendation.",
    preview: (
      <div className="space-y-2">
        {["Deed pulled", "Bond checked", "Decision issued"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-[11px] text-[#60606a]">
            <span className="size-2 rounded-full bg-indigo-400" />
            <span className="text-[#60606a]">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Data residency",
    kicker: "Infrastructure",
    description:
      "Operate with controlled storage and processing boundaries for regulated matters.",
    preview: (
      <div className="relative h-20 rounded-xl border border-[#d8d8df] bg-white/60">
        <span className="absolute left-8 top-8 size-2 rounded-full bg-indigo-400 shadow-[0_0_24px_rgba(101,115,255,0.55)]" />
        <span className="absolute right-10 top-5 size-2 rounded-full bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.55)]" />
        <span className="absolute bottom-5 left-1/2 size-2 rounded-full bg-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.55)]" />
        <span className="absolute left-9 right-11 top-9 border-t border-dashed border-indigo-300/30" />
      </div>
    ),
  },
  {
    label: "Risk exceptions",
    kicker: "Review",
    description:
      "Surface ownership mismatches, interdicts, missing consent, and matter anomalies.",
    preview: (
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Clear", "85%", "text-emerald-600 bg-emerald-500/10"],
          ["Review", "12%", "text-sky-600 bg-sky-500/10"],
          ["Stop", "3%", "text-red-600 bg-red-500/10"],
        ].map(([label, pct, tone]) => (
          <span key={label} className={`rounded-lg p-2 text-center ${tone}`}>
            <b className="block text-sm">{pct}</b>
            <span className="text-[10px]">{label}</span>
          </span>
        ))}
      </div>
    ),
  },
  {
    label: "Verification backups",
    kicker: "Recovery",
    description:
      "Keep evidence snapshots available for later review, dispute handling, and reporting.",
    preview: (
      <div className="space-y-1.5">
        {[82, 64, 91].map((width, i) => (
          <div key={width} className="rounded-md border border-[#d8d8df] bg-white/60 p-1.5">
            <div className="h-1.5 rounded-full bg-[#d8d8df]">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-[#70707a]">restore point 0{i + 1}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Legal policy controls",
    kicker: "Compliance",
    description:
      "Map firm policy, retention, and review rules to the way teams process matters.",
    preview: (
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-[#d8d8df] bg-white/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70707a]">
            Deeds Act
          </p>
          <div className="mt-3 h-1.5 w-16 rounded-full bg-[#cfd0d8]" />
          <div className="mt-1.5 h-1.5 w-10 rounded-full bg-[#d8d8df]" />
        </div>
        <div className="grid size-12 place-items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 text-[10px] font-semibold text-indigo-600">
          FIC
        </div>
      </div>
    ),
  },
  {
    label: "Operational SLA",
    kicker: "Reliability",
    description:
      "Track matter throughput, uptime, and service health for production conveyancing work.",
    preview: (
      <div className="flex h-20 items-end gap-1">
        {[22, 36, 28, 52, 44, 62, 48, 68, 58, 74, 70, 82].map((height, i) => (
          <span
            key={`${height}-${i}`}
            className="flex-1 rounded-t bg-emerald-500/70"
            style={{ height }}
          />
        ))}
      </div>
    ),
  },
];

export function Features() {
  return (
    <section
      className="scroll-mt-24 border-y border-dashed border-[#d8d8df] bg-[#ededf0] py-24 text-[#1c1c20] md:py-32"
      id="security"
    >
      <div className="container mx-auto">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-baseline lg:gap-x-20">
          <h2 className="font-display max-w-[700px] text-4xl font-medium leading-tight text-[#1c1c20] text-pretty md:text-5xl">
            Safely scale with built-in{" "}
            <span className="md:whitespace-nowrap">security and compliance</span>
            <span className="text-indigo-500">_</span>
          </h2>
          <p className="mt-4 max-w-full text-sm font-medium leading-6 text-[#5c5c66] lg:max-w-xl">
            Give conveyancing teams the controls, evidence trail, and
            operational resilience they need to make high-stakes title
            decisions with confidence.
          </p>
        </section>
      </div>

      <div className="mt-20 border-y border-dashed border-[#d8d8df]">
        <div className="container grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {features.map((box) => (
            <article
              key={box.label}
              className="group relative min-h-[260px] border-dashed border-[#d8d8df] px-4 py-6 transition-colors hover:bg-white/45 sm:border-r sm:border-b md:p-8"
            >
              <div className="mb-5 h-28 overflow-hidden rounded-xl border border-[#d8d8df] bg-[radial-gradient(circle_at_20%_0%,rgba(101,115,255,0.13),transparent_34%),rgba(255,255,255,0.58)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {box.preview}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-600/75">
                {box.kicker}
              </p>
              <h3 className="mt-2 flex flex-wrap items-center gap-1 text-sm font-semibold text-[#1c1c20]">
                {box.label}
                <span
                  className="translate-x-0 text-[#8c8c96] opacity-100 transition-all group-hover:translate-x-0.5 group-hover:text-[#303038] lg:opacity-0 lg:group-hover:opacity-100"
                  aria-hidden="true"
                >
                  →
                </span>
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#5c5c66]">
                {box.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
