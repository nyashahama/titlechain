import { describe, it, expect } from "vitest";
import { fadeIn, slideUp, staggerContainer } from "./animations";

describe("animation variants", () => {
  it("fadeIn has correct hidden state", () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0 });
  });

  it("slideUp has correct visible y", () => {
    expect(slideUp.visible.y).toBe(0);
  });

  it("staggerContainer staggers children", () => {
    expect(staggerContainer.visible.transition.staggerChildren).toBe(0.04);
  });
});
