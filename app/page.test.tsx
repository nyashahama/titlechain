import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the risk-first landing page with required buying paths", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /see transfer risk before the title moves/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /south africa's property transfer process still runs on fragmented checks, delays, and blind spots/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: /book demo/i }).length
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByRole("link", { name: /get api access/i }).length
    ).toBeGreaterThanOrEqual(2);

    expect(
      screen.getByRole("heading", {
        name: /built for the institutions that carry the risk/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText(/conveyancing attorneys/i)).toBeInTheDocument();
    expect(screen.getByText(/^banks$/i)).toBeInTheDocument();
    expect(screen.getByText(/^insurers$/i)).toBeInTheDocument();
  });

  it("renders the signal-room visual language and final conversion section", () => {
    render(<Home />);

    expect(
      screen.getByLabelText(/transaction intelligence preview/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /book a titlechain demo before your next transfer decision goes in blind/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/the moat is not access to the data/i)
    ).toBeInTheDocument();
  });
});
