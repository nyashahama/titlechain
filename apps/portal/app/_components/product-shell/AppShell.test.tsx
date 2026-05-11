import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/matters/matter-1",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/app/_providers/auth-provider", () => ({
  useAuth: () => ({
    user: {
      display_name: "Nyasha Hama",
      email: "demo@titlechain.co.za",
      role: "pilot_admin",
      organization: { name: "TitleChain Demo" },
    },
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

describe("AppShell", () => {
  it("renders workspace and operations navigation", () => {
    render(
      <AppShell>
        <main>Content</main>
      </AppShell>,
    );
    expect(screen.getByText("TitleChain Demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Matters/i })).toHaveAttribute("href", "/matters");
    expect(screen.getByRole("link", { name: /Cases/i })).toHaveAttribute("href", "/internal/cases");
  });

  it("renders children inside the shell", () => {
    render(
      <AppShell>
        <main>Route content</main>
      </AppShell>,
    );
    expect(screen.getByText("Route content")).toBeInTheDocument();
  });
});
