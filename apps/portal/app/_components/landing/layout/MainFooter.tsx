import Link from "next/link";
import { TitlechainMark } from "@/app/_components/solar/TitlechainMark";

const footerLinks = [
  {
    title: "Solutions",
    links: [
      { label: "Clear-to-Lodge", href: "/solutions/clear-to-lodge" },
      { label: "Risk Engine", href: "/solutions/risk-engine" },
      { label: "Deeds Search", href: "/solutions/deeds-search" },
      { label: "Coverage", href: "/solutions/coverage" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "mailto:hello@titlechain.co.za" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "POPIA", href: "/popia" },
    ],
  },
];

export function MainFooter() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-block">
            <TitlechainMark className="size-10" />
          </Link>
          <p className="mt-4 text-sm text-white/45">
            Property title intelligence for South Africa.
          </p>
        </div>

        {footerLinks.map((group) => (
          <div key={group.title}>
            <h4 className="mb-4 text-sm font-medium text-white/60">
              {group.title}
            </h4>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/40 transition-colors hover:text-white/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-white/[0.04] pt-6 text-center text-xs text-white/30">
        &copy; {new Date().getFullYear()} TitleChain. All rights reserved.
      </div>
    </footer>
  );
}
