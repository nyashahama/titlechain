import { render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getAllByRole("link", { name: /Matters/i })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: /Matters/i })[0]).toHaveAttribute("href", "/matters");
    expect(screen.getAllByRole("link", { name: /Cases/i })[0]).toHaveAttribute("href", "/internal/cases");
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
