import Link from "next/link";
import { TitlechainMark } from "@/app/_components/landing/shared/TitlechainMark";

const footerLinks = [
  {
    title: "Solutions",
    links: [
      { label: "Clear-to-Lodge", href: "#solutions" },
      { label: "Risk Engine", href: "#security" },
      { label: "Deeds Search", href: "#solutions" },
      { label: "Coverage", href: "#coverage" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pilot Evidence", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20pilot%20evidence" },
      { label: "Security Review", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20security%20review" },
      { label: "Partner Access", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20partner%20access" },
      { label: "Contact", href: "mailto:hello@titlechain.co.za" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Security Controls", href: "#security" },
      { label: "Coverage Model", href: "#coverage" },
      { label: "Access Request", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20access%20request" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Pack", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20privacy%20pack" },
      { label: "Terms Pack", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20terms%20pack" },
      { label: "POPIA Review", href: "mailto:hello@titlechain.co.za?subject=TitleChain%20POPIA%20review" },
    ],
  },
];

export function MainFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#151518] py-16">
      <div className="mx-auto max-w-[86.875rem] px-4 md:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <TitlechainMark className="size-10" />
            </Link>
            <p className="mt-4 max-w-56 text-sm leading-6 text-white/45">
              Property title intelligence for South Africa.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display mb-4 text-sm font-medium text-white/70">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 transition-colors hover:text-white/75"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.06] pt-6 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} TitleChain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
