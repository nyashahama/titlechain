import {
  Activity,
  Building2,
  FilePlus2,
  FolderKanban,
  Home,
  ListChecks,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type ProductRole = "pilot_admin" | "pilot_user" | string | undefined;

export type ProductNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
};

export type ProductNavGroup = {
  label: "Workspace" | "Operations";
  items: ProductNavItem[];
};

export const productNavigation: ProductNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: Home },
      { label: "Matters", href: "/matters", icon: FolderKanban },
      { label: "New Check", href: "/matters/new", icon: FilePlus2 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Cases", href: "/internal/cases", icon: ListChecks, roles: ["pilot_admin"] },
      { label: "Properties", href: "/internal/properties", icon: Building2, roles: ["pilot_admin"] },
      { label: "Runs", href: "/internal/ops/runs", icon: Activity, roles: ["pilot_admin"] },
    ],
  },
];

export function getVisibleProductNavigation(role: ProductRole): ProductNavGroup[] {
  return productNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(role ?? "")),
    }))
    .filter((group) => group.items.length > 0);
}

export function resolveActiveProductRoute(pathname: string): string {
  const routes = productNavigation.flatMap((group) => group.items.map((item) => item.href));
  const exact = routes.find((route) => route === pathname);
  if (exact) return exact;

  return (
    routes
      .filter((route) => pathname.startsWith(`${route}/`))
      .sort((a, b) => b.length - a.length)[0] ?? "/dashboard"
  );
}
