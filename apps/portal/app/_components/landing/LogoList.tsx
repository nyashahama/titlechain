import { cn } from "@/app/_lib/cn";

interface LogoListProps {
  title?: string;
  className?: string;
}

const logos = [
  { name: "VDM Attorneys" },
  { name: "Werksmans" },
  { name: "ENSafrica" },
  { name: "Bowmans" },
  { name: "Cliffe Dekker" },
  { name: "Webber Wentzel" },
  { name: "Nedbank" },
  { name: "Standard Bank" },
  { name: "Absa" },
  { name: "FNB" },
  { name: "Investec" },
  { name: "Rand Merchant Bank" },
];

export function LogoList({
  title = "Trusted by leading conveyancing firms and banks",
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
            href="/case-studies"
            className="text-sm font-medium text-orange-500 hover:underline"
          >
            Read our case studies &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
