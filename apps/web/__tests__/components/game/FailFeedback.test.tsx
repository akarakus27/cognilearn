import { render, screen, fireEvent } from "@testing-library/react";
import { FailFeedback } from "@/components/game/FailFeedback";

jest.mock("@/lib/sound", () => ({ playSound: jest.fn() }));

describe("FailFeedback", () => {
  it("renders retry button", () => {
    render(<FailFeedback onRetry={jest.fn()} />);
    expect(screen.getByRole("button", { name: /try the level again/i })).toBeInTheDocument();
  });

  it("calls onRetry when button is clicked", () => {
    const onRetry = jest.fn();
    render(<FailFeedback onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /try the level again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("calls onRetry when Enter key is pressed", () => {
    const onRetry = jest.fn();
    render(<FailFeedback onRetry={onRetry} />);
    fireEvent.keyDown(window, { key: "Enter" });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows encouraging message", () => {
    render(<FailFeedback onRetry={jest.fn()} />);
    expect(screen.getByText(/no penalty/i)).toBeInTheDocument();
  });
});
