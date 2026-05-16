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
        "bg-[#03040a] py-20 md:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-[86.875rem] px-4 md:px-8">
        <h2 className="text-center text-sm font-medium text-white/55 text-pretty md:whitespace-nowrap">
          {title}
        </h2>
        <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex min-h-10 items-center justify-center px-4 text-center"
            >
              <span className="font-display text-[0.9375rem] font-medium text-white/35 md:text-base">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
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
