import { render, screen, fireEvent } from "@testing-library/react";
import { SuccessFeedback } from "@/components/game/SuccessFeedback";

jest.mock("@/lib/sound", () => ({ playSound: jest.fn() }));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const defaultProps = {
  stars: 3 as const,
  xp: 50,
  nextLevelHref: "/level/next",
  worldHref: "/world/1",
};

describe("SuccessFeedback", () => {
  it("renders congratulations message", () => {
    render(<SuccessFeedback {...defaultProps} />);
    expect(screen.getByText(/tebrikler/i)).toBeInTheDocument();
  });

  it("displays correct XP amount", () => {
    render(<SuccessFeedback {...defaultProps} xp={75} />);
    expect(screen.getByText(/\+75 xp/i)).toBeInTheDocument();
  });

  it("shows next level button when nextLevelHref is provided", () => {
    render(<SuccessFeedback {...defaultProps} />);
    expect(screen.getByRole("link", { name: /go to the next level/i })).toBeInTheDocument();
  });

  it("hides next level button when nextLevelHref is null", () => {
    render(<SuccessFeedback {...defaultProps} nextLevelHref={null} />);
    expect(screen.queryByRole("link", { name: /go to the next level/i })).not.toBeInTheDocument();
  });

  it("shows retry button when onRetry is provided", () => {
    render(<SuccessFeedback {...defaultProps} onRetry={jest.fn()} />);
    expect(screen.getByRole("button", { name: /retry this level/i })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = jest.fn();
    render(<SuccessFeedback {...defaultProps} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /retry this level/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders world map link", () => {
    render(<SuccessFeedback {...defaultProps} />);
    expect(screen.getByRole("link", { name: /return to the world map/i })).toBeInTheDocument();
  });

  it("shows 3 stars for 3-star completion", () => {
    render(<SuccessFeedback {...defaultProps} stars={3} />);
    expect(screen.getAllByText("⭐")).toHaveLength(3);
  });
});
