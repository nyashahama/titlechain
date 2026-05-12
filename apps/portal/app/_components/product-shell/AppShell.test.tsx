import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

const { authState, mockRouter } = vi.hoisted(() => ({
  authState: {
    user: {
      display_name: "Nyasha Hama",
      email: "demo@titlechain.co.za",
      role: "pilot_admin",
      organization: { name: "TitleChain Demo" },
    },
    isLoading: false,
    signOut: vi.fn(),
  },
  mockRouter: { replace: vi.fn(), push: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/matters/matter-1",
  useRouter: () => mockRouter,
}));

vi.mock("@/app/_providers/auth-provider", () => ({
  useAuth: () => authState,
}));

describe("AppShell", () => {
  beforeEach(() => {
    authState.user = {
      display_name: "Nyasha Hama",
      email: "demo@titlechain.co.za",
      role: "pilot_admin",
      organization: { name: "TitleChain Demo" },
    };
    authState.isLoading = false;
    authState.signOut = vi.fn();
    mockRouter.replace.mockClear();
    mockRouter.push.mockClear();
  });

  it("renders workspace and operations navigation", () => {
    render(
      <AppShell>
        <main>Content</main>
      </AppShell>,
    );
    expect(screen.getByText("TitleChain Demo")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Matters/i })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /Matters/i })[0]).toHaveAttribute("href", "/matters");
    expect(screen.getAllByRole("link", { name: /Cases/i })[0]).toHaveAttribute("href", "/internal/cases");
  });

  it("exposes operations links through the mobile navigation menu for pilot admins", async () => {
    render(
      <AppShell>
        <main>Content</main>
      </AppShell>,
    );

    fireEvent.pointerDown(screen.getByRole("button", { name: "Open navigation" }), {
      button: 0,
      ctrlKey: false,
    });

    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /Cases/i })).toHaveAttribute("href", "/internal/cases");
    expect(within(menu).getByRole("menuitem", { name: /Properties/i })).toHaveAttribute("href", "/internal/properties");
    expect(within(menu).getByRole("menuitem", { name: /Analytics/i })).toHaveAttribute("href", "/internal/analytics");
    expect(within(menu).getByRole("menuitem", { name: /Runs/i })).toHaveAttribute("href", "/internal/ops/runs");
  });

  it("renders children inside the shell", () => {
    render(
      <AppShell>
        <main>Route content</main>
      </AppShell>,
    );
    expect(screen.getByText("Route content")).toBeInTheDocument();
  });

  it("renders loading state while auth is loading", () => {
    authState.user = null;
    authState.isLoading = true;

    render(
      <AppShell>
        <main>Route content</main>
      </AppShell>,
    );

    expect(screen.getByText("Loading workspace")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to sign in", async () => {
    authState.user = null;
    authState.isLoading = false;

    render(
      <AppShell>
        <main>Route content</main>
      </AppShell>,
    );

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith("/auth/signin"));
  });
});
