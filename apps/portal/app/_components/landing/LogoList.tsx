import { cn } from "@/app/_lib/cn";

interface LogoListProps {
  title?: string;
  className?: string;
}

const logos = [
  { name: "Conveyancing Firms" },
  { name: "Bond Originators" },
  { name: "Property Banks" },
  { name: "Legal Operations" },
  { name: "Deeds Analysts" },
  { name: "Compliance Teams" },
  { name: "Estate Transfers" },
  { name: "Mortgage Risk" },
  { name: "Municipal Clearances" },
  { name: "FIC Review" },
  { name: "Audit Teams" },
  { name: "Matter Operations" },
];

export function LogoList({
  title = "Built for regulated conveyancing teams, lenders, and title operations",
  className,
}: LogoListProps) {
  return (
    <section
      className={cn(
        "border-y border-dashed border-white/[0.06] bg-[#03040a] py-14 md:py-16",
        className
      )}
    >
      <div className="mx-auto max-w-[86.875rem] px-4 md:px-8">
        <h2 className="text-center text-sm font-medium text-white/55 text-pretty md:whitespace-nowrap">
          {title}
        </h2>
        <div className="relative mt-8 grid grid-cols-2 overflow-hidden rounded-xl border border-dashed border-white/[0.06] bg-white/[0.02] sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex min-h-16 items-center justify-center border-r border-b border-dashed border-white/[0.06] px-4 text-center"
            >
              <span className="text-sm font-medium text-white/35">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a
            href="mailto:hello@titlechain.co.za?subject=TitleChain%20pilot%20evidence"
            className="text-sm font-medium text-indigo-500 hover:underline"
          >
            Discuss pilot evidence &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
