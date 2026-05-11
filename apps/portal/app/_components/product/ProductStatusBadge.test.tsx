import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyAction } from "./CopyAction";
import { DataToolbar } from "./DataToolbar";
import { ProductPanel } from "./ProductPanel";
import { ProductStatusBadge } from "./ProductStatusBadge";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProductStatusBadge", () => {
  it("renders semantic labels", () => {
    render(<ProductStatusBadge label="Clear to Lodge" tone="success" />);
    expect(screen.getByText("Clear to Lodge")).toBeInTheDocument();
  });

  it("uses compact 8px radius", () => {
    render(<ProductStatusBadge label="Review Required" tone="warning" />);
    expect(screen.getByText("Review Required")).toHaveClass("rounded-md");
  });

  it("uses product token classes for semantic tones", () => {
    render(<ProductStatusBadge label="Failed" tone="danger" />);
    expect(screen.getByText("Failed")).toHaveClass("border-tc-danger/30", "bg-tc-danger/10", "text-tc-danger");
  });
});

describe("ProductPanel", () => {
  it("passes through section attributes", () => {
    render(
      <ProductPanel id="matter-panel" aria-label="Matter summary">
        Content
      </ProductPanel>
    );

    expect(screen.getByRole("region", { name: "Matter summary" })).toHaveAttribute("id", "matter-panel");
  });
});

describe("DataToolbar", () => {
  it("renders search inputs as search controls", () => {
    render(<DataToolbar searchLabel="Search matters" query="" onQueryChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Search matters" })).toHaveAttribute("type", "search");
  });
});

describe("CopyAction", () => {
  it("announces copied state after a successful copy", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<CopyAction text="TC-001" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    expect(await screen.findByRole("button", { name: "Copied" })).toHaveAttribute("title", "Copied");
  });

  it("announces copy failure without throwing", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<CopyAction text="TC-001" />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy failed" })).toHaveAttribute("title", "Copy failed");
    });
  });
});
