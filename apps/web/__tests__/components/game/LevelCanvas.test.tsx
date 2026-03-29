import { fireEvent, render, screen } from "@testing-library/react";
import { LevelCanvas } from "@/components/game/LevelCanvas";
import { introState, mockState } from "@/__tests__/mocks/levels";

describe("LevelCanvas", () => {
  it("renders the puzzle grid with accessible cells", () => {
    render(
      <LevelCanvas
        state={mockState}
        onAction={jest.fn()}
        worldId="1"
        levelId="level-1"
        nextLevelHref="/level/2"
      />
    );

    expect(screen.getByRole("grid", { name: /reach the goal puzzle grid/i })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(9);
    expect(screen.getByLabelText(/cell 1, 1, player/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cell 3, 2, goal/i)).toBeInTheDocument();
  });

  it("dispatches directional and reset actions", () => {
    const onAction = jest.fn();

    render(
      <LevelCanvas
        state={mockState}
        onAction={onAction}
        worldId="1"
        levelId="level-1"
        nextLevelHref="/level/2"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /move up/i }));
    fireEvent.click(screen.getByRole("button", { name: /move right/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset current level attempt/i }));

    expect(onAction).toHaveBeenNthCalledWith(1, { type: "EXECUTE_COMMAND", command: "UP" });
    expect(onAction).toHaveBeenNthCalledWith(2, { type: "EXECUTE_COMMAND", command: "RIGHT" });
    expect(onAction).toHaveBeenNthCalledWith(3, { type: "RESET_PLAY" });
  });

  it("starts intro levels from the call to action button", () => {
    const onAction = jest.fn();

    render(
      <LevelCanvas
        state={introState}
        onAction={onAction}
        worldId="1"
        levelId="level-1"
        nextLevelHref="/level/2"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /start level reach the goal/i }));
    expect(onAction).toHaveBeenCalledWith({ type: "START_LEVEL" });
  });
});
