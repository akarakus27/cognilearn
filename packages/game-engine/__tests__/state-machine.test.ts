import { describe, it, expect } from "vitest";
import { transition } from "../src/state-machine";

describe("Level State Machine", () => {
  it("intro -> play on START", () => {
    expect(transition("intro", "START")).toBe("play");
  });

  it("intro stays on other events", () => {
    expect(transition("intro", "SUBMIT_SUCCESS")).toBe("intro");
    expect(transition("intro", "SUBMIT_FAIL")).toBe("intro");
  });

  it("play -> success on SUBMIT_SUCCESS", () => {
    expect(transition("play", "SUBMIT_SUCCESS")).toBe("success");
  });

  it("play -> fail on SUBMIT_FAIL", () => {
    expect(transition("play", "SUBMIT_FAIL")).toBe("fail");
  });

  it("play stays on START", () => {
    expect(transition("play", "START")).toBe("play");
  });

  it("success and fail are terminal", () => {
    expect(transition("success", "START")).toBe("success");
    expect(transition("success", "SUBMIT_SUCCESS")).toBe("success");
    expect(transition("fail", "SUBMIT_FAIL")).toBe("fail");
  });
});
