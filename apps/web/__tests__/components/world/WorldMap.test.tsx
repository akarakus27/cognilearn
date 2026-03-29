import { render, screen } from "@testing-library/react";
import { WorldMap } from "@/components/world/WorldMap";
import { mockWorld } from "@/__tests__/mocks/levels";

describe("WorldMap", () => {
  it("shows progress and unlocked level links", () => {
    render(
      <WorldMap
        world={mockWorld}
        completedLevels={{ "level-1": 3 }}
        worldIdParam="1"
      />
    );

    expect(screen.getByRole("heading", { name: /first steps/i })).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /world completion progress/i })).toHaveAttribute("aria-valuenow", "33");
    expect(screen.getByRole("link", { name: /level 2/i })).toBeInTheDocument();
    expect(screen.getByText(/complete previous level/i)).toBeInTheDocument();
  });
});
