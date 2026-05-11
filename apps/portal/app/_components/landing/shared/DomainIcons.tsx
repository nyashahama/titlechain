import type { SVGProps } from "react";

import { cn } from "@/app/_lib/cn";

type DomainIconName =
  | "deeds-office"
  | "sars"
  | "fic"
  | "lightstone"
  | "windeed"
  | "ghostconvey"
  | "clear-to-lodge"
  | "risk-engine"
  | "deeds-search"
  | "fraud-detection"
  | "bond-check"
  | "coverage";

type DomainIconProps = SVGProps<SVGSVGElement> & {
  name: DomainIconName;
};

const paths: Record<DomainIconName, React.ReactNode> = {
  "deeds-office": (
    <>
      <path d="M5 9.5 12 5l7 4.5" />
      <path d="M7 10.5h10" />
      <path d="M8 11v7M12 11v7M16 11v7" />
      <path d="M6.5 18.5h11" />
    </>
  ),
  sars: (
    <>
      <path d="M7 7.5h10v11H7z" />
      <path d="M9.5 10.5h5M9.5 13h5M9.5 15.5h2" />
      <path d="M15 15.5h2.5" />
      <path d="M15 18.5c0-2.4 3-2.4 3 0" />
    </>
  ),
  fic: (
    <>
      <path d="M12 4.5 18 7v4.4c0 3.8-2.5 6.7-6 8.1-3.5-1.4-6-4.3-6-8.1V7z" />
      <path d="M9.2 12.3 11.2 14.3 15.2 10" />
    </>
  ),
  lightstone: (
    <>
      <path d="M6 17.5V9l6-4.2L18 9v8.5" />
      <path d="M9 17.5v-5h6v5" />
      <path d="M8.5 9.5h7" />
    </>
  ),
  windeed: (
    <>
      <path d="M5.5 18.5h13" />
      <path d="M7 15.5h10" />
      <path d="M8 12.5h8" />
      <path d="M9.5 9.5h5" />
      <path d="M11 6.5h2" />
    </>
  ),
  ghostconvey: (
    <>
      <path d="M7 6.5h10v11H7z" />
      <path d="M9.5 9.5h5M9.5 12h5M9.5 14.5h2.5" />
      <path d="M14.5 15.5 17 18" />
      <path d="M15 18h2.5v-2.5" />
    </>
  ),
  "clear-to-lodge": (
    <>
      <path d="M7 5.5h8l2 2V18.5H7z" />
      <path d="M15 5.5v2h2" />
      <path d="M9.2 13.1 11.1 15 15 10.5" />
    </>
  ),
  "risk-engine": (
    <>
      <path d="M12 4.5 19 17.5H5z" />
      <path d="M12 9.5v3.5" />
      <path d="M12 15.6h.01" />
    </>
  ),
  "deeds-search": (
    <>
      <path d="M7 5.5h7l3 3v9H7z" />
      <path d="M14 5.5v3h3" />
      <path d="M9.5 11h4.5M9.5 13.5h3" />
      <circle cx="14.5" cy="15.5" r="1.8" />
      <path d="m16 17 2 2" />
    </>
  ),
  "fraud-detection": (
    <>
      <path d="M12 4.5 18 7v4.2c0 3.8-2.4 6.6-6 8.3-3.6-1.7-6-4.5-6-8.3V7z" />
      <path d="M9.5 12h5" />
      <path d="M12 9.5v5" />
    </>
  ),
  "bond-check": (
    <>
      <path d="M5.5 7.5h13v10h-13z" />
      <path d="M5.5 10.5h13" />
      <path d="M8 14.5h4" />
      <path d="m14.3 14.5 1.1 1.1 2-2.2" />
    </>
  ),
  coverage: (
    <>
      <path d="M6 16.5 10 6l4 11 4-8" />
      <path d="M6 16.5h12" />
      <path d="M10 6l4 11" />
      <path d="M8.2 12.5h7.5" />
    </>
  ),
};

export function DomainIcon({ name, className, ...props }: DomainIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5", className)}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
