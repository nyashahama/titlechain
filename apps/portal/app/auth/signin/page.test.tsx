import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SignInPage from "./page";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  signIn: vi.fn(() => Promise.resolve()),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock("../../_providers/auth-provider", () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}));

describe("SignInPage", () => {
  beforeEach(() => {
    mocks.push.mockClear();
    mocks.signIn.mockClear();
  });

  it("starts with empty credentials and fills them from the demo workspace action", () => {
    render(<SignInPage />);

    const email = screen.getByLabelText("Email") as HTMLInputElement;
    const password = screen.getByLabelText("Password") as HTMLInputElement;

    expect(email).toHaveValue("");
    expect(password).toHaveValue("");
    expect(
      screen.queryByText("Copy these credentials into the form."),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Use demo workspace" }));

    expect(email).toHaveValue("demo@titlechain.co.za");
    expect(password).toHaveValue("demo1234");
  });

  it("toggles password visibility without changing the entered value", () => {
    render(<SignInPage />);

    const password = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "demo1234" } });

    expect(password).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("demo1234");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));

    expect(password).toHaveAttribute("type", "password");
  });

  it("frames the form as a TitleChain workspace session", () => {
    render(<SignInPage />);

    expect(screen.getByText("Pilot workspace")).toBeInTheDocument();
    expect(screen.getByText("Registry session")).toBeInTheDocument();
    expect(screen.getByText("Demo workspace")).toBeInTheDocument();
  });
});
