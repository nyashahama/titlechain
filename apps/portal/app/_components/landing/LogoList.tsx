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
    <div className={cn("py-16 md:py-20 lg:py-24", className)}>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="text-center text-sm font-medium text-white/50 text-pretty md:whitespace-nowrap">
          {title}
        </h2>
        <div className="relative grid grid-cols-3 gap-8 py-10 md:grid-cols-4 md:gap-10 lg:grid-cols-6 lg:gap-12">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center"
            >
              <span className="text-sm font-medium text-white/30">
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
    </div>
  );
}
