import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProgressCodeForm from "@/components/settings/ProgressCodeForm";
import * as utils from "@cognitive/utils";

jest.mock("@cognitive/utils", () => ({
  encodeProgress: jest.fn(),
  decodeProgress: jest.fn(),
  loadProgress: jest.fn(),
  saveProgress: jest.fn(),
}));

describe("ProgressCodeForm", () => {
  const clipboardWriteText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: clipboardWriteText,
      },
    });
    (utils.loadProgress as jest.Mock).mockReturnValue({
      completedLevels: { "level-1": 2 },
      xp: 20,
      lastLevelId: "level-1",
      lastWorldId: "1",
    });
    clipboardWriteText.mockResolvedValue(undefined);
  });

  it("copies an exported progress code", async () => {
    (utils.encodeProgress as jest.Mock).mockReturnValue("ABC123");

    render(<ProgressCodeForm />);
    fireEvent.click(screen.getByRole("button", { name: /copy progress code to clipboard/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith("ABC123");
    });
    expect(screen.getByRole("status")).toHaveTextContent(/copied to clipboard/i);
  });

  it("imports and merges decoded progress", async () => {
    (utils.decodeProgress as jest.Mock).mockReturnValue({
      completedLevels: { "level-2": 3 },
      xp: 50,
      lastLevelId: "level-2",
      lastWorldId: "1",
    });

    render(<ProgressCodeForm />);
    fireEvent.change(screen.getByRole("textbox", { name: /^progress code$/i }), { target: { value: "IMPORTME" } });
    fireEvent.click(screen.getByRole("button", { name: /import progress code/i }));

    await waitFor(() => {
      expect(utils.saveProgress).toHaveBeenCalledWith({
        completedLevels: { "level-1": 2, "level-2": 3 },
        xp: 50,
        lastLevelId: "level-2",
        lastWorldId: "1",
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(/progress imported/i);
  });

  it("shows an accessible error message when decoding fails", async () => {
    (utils.decodeProgress as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid code");
    });

    render(<ProgressCodeForm />);
    fireEvent.change(screen.getByRole("textbox", { name: /^progress code$/i }), { target: { value: "bad" } });
    fireEvent.click(screen.getByRole("button", { name: /import progress code/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid code/i);
  });
});
