import { readFileSync } from "fs";
import { resolve } from "path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthLayout } from "./AuthLayout";

describe("AuthLayout", () => {
  it("renders an Appwrite-style split auth shell with parcel intelligence visual", () => {
    render(
      <AuthLayout title="Sign in" subtitle="Access your TitleChain account">
        <form aria-label="Sign in form">
          <input aria-label="Email" />
        </form>
      </AuthLayout>,
    );

    expect(screen.getByTestId("auth-shell")).toHaveClass("lg:grid-cols-2");
    expect(screen.getByTestId("parcel-intelligence-visual")).toBeInTheDocument();
    expect(screen.getByText("Every parcel, resolved")).toBeInTheDocument();
    expect(screen.getByText("Verified registry chain")).toBeInTheDocument();
    expect(screen.getByTestId("auth-form-panel")).toHaveClass("max-w-[27.5rem]");
  });

  it("keeps the form-first mobile atmosphere available without duplicating the desktop headline", () => {
    render(
      <AuthLayout title="Sign in" subtitle="Access your TitleChain account">
        <form aria-label="Sign in form">
          <input aria-label="Email" />
        </form>
      </AuthLayout>,
    );

    expect(screen.getByTestId("auth-mobile-atmosphere")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getAllByText("Sign in")).toHaveLength(1);
  });

  it("keeps demo credentials compact and subordinate on the sign-in page", () => {
    const source = readFileSync(
      resolve(__dirname, "../../../auth/signin/page.tsx"),
      "utf-8",
    );

    expect(source).toContain("Demo access");
    expect(source).toContain("Copy these credentials into the form.");
    expect(source).toContain("rounded-lg border border-white/[0.08]");
    expect(source).not.toContain("rounded-xl border border-orange-500/20");
    expect(source).not.toContain("bg-orange-500/[0.07]");
    expect(source).not.toContain("orange-");
  });
});
