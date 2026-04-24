import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders default variant with correct classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByText("Default");
    expect(button).toHaveClass("bg-foreground", "text-background", "hover:opacity-80");
  });

  it("renders destructive variant with correct classes", () => {
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByText("Destructive");
    expect(button).toHaveClass("bg-destructive", "text-destructive-foreground", "hover:bg-destructive/90");
  });

  it("renders outline variant with correct classes", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByText("Outline");
    expect(button).toHaveClass("border", "border-border", "bg-transparent", "hover:bg-white/[0.05]");
  });

  it("renders secondary variant with correct classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText("Secondary");
    expect(button).toHaveClass("bg-secondary", "text-secondary-foreground", "hover:bg-secondary/80");
  });

  it("renders ghost variant with correct classes", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByText("Ghost");
    expect(button).toHaveClass("hover:bg-white/[0.05]", "hover:text-foreground", "text-muted");
  });

  it("renders link variant with correct classes", () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByText("Link");
    expect(button).toHaveClass("text-primary", "underline-offset-4", "hover:underline");
  });

  it("shows loading spinner and disables button when loading", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders as child via Slot when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByText("Link Button");
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link).toHaveAttribute("href", "/test");
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
