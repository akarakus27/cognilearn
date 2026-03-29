import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { LevelCanvas } from "@/components/game/LevelCanvas";
import ProgressCodeForm from "@/components/settings/ProgressCodeForm";
import { mockState } from "@/__tests__/mocks/levels";

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
jest.mock("@cognitive/utils", () => ({
  encodeProgress: jest.fn(() => "CODE"),
  decodeProgress: jest.fn(() => ({ completedLevels: {}, xp: 0 })),
  loadProgress: jest.fn(() => ({ completedLevels: {}, xp: 0 })),
  saveProgress: jest.fn(),
  setLastPosition: jest.fn(),
}));

describe("Accessibility Audit (axe)", () => {
  it("finds no critical accessibility issues in the level canvas", async () => {
    const { container } = render(
      <LevelCanvas
        state={mockState}
        onAction={jest.fn()}
        worldId="1"
        levelId="level-1"
        nextLevelHref="/level/2"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("finds no critical accessibility issues in the progress code form", async () => {
    const { container } = render(<ProgressCodeForm />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
