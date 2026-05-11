import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentPilotUser,
  requirePilotAdmin,
  requirePilotUser,
} from "./server-auth";

const { mockCookies, mockRedirect } = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockRedirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("server auth", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.unstubAllEnvs();
    mockCookies.mockResolvedValue({
      getAll: () => [
        { name: "pilot_session", value: "session-1" },
        { name: "csrf", value: "token-1" },
      ],
    });
    mockRedirect.mockClear();
  });

  it("forwards cookies to /api/pilot/me and returns the user when OK", async () => {
    const user = {
      id: "user-1",
      email: "demo@titlechain.co.za",
      display_name: "Nyasha Hama",
      role: "pilot_admin",
      organization: { name: "TitleChain Demo" },
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(user),
    } as unknown as Response);

    await expect(getCurrentPilotUser()).resolves.toEqual(user);
    expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/pilot/me", {
      cache: "no-store",
      headers: {
        cookie: "pilot_session=session-1; csrf=token-1",
      },
    });
  });

  it("returns null when /api/pilot/me fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    await expect(getCurrentPilotUser()).resolves.toBeNull();
  });

  it("redirects requirePilotUser to sign in when no user exists", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    await expect(requirePilotUser()).rejects.toThrow("redirect:/auth/signin");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/signin");
  });

  it("redirects requirePilotAdmin to dashboard for non-admin users", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ role: "pilot_user" }),
    } as unknown as Response);

    await expect(requirePilotAdmin()).rejects.toThrow("redirect:/dashboard");
    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns admin users from requirePilotAdmin", async () => {
    const user = { role: "pilot_admin", email: "admin@titlechain.co.za" };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(user),
    } as unknown as Response);

    await expect(requirePilotAdmin()).resolves.toEqual(user);
  });
});
