/**
 * Accessibility tests using jest-axe (Phase 6A requirement)
 * Checks WCAG 2.1 AA compliance for core game components
 */
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { FailFeedback } from "@/components/game/FailFeedback";
import { SuccessFeedback } from "@/components/game/SuccessFeedback";

expect.extend(toHaveNoViolations);

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

describe("Accessibility (WCAG 2.1 AA)", () => {
  it("FailFeedback has no critical a11y violations", async () => {
    const { container } = render(<FailFeedback onRetry={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("SuccessFeedback has no critical a11y violations", async () => {
    const { container } = render(
      <SuccessFeedback
        stars={3}
        xp={50}
        nextLevelHref="/level/next"
        worldHref="/world/1"
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
