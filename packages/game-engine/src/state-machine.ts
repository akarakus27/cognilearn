import type { LevelPhase } from "./types";

export type StateMachineEvent =
  | "START"
  | "SUBMIT_SUCCESS"
  | "SUBMIT_FAIL";

/** Transition: (phase, event) -> new phase */
export function transition(
  phase: LevelPhase,
  event: StateMachineEvent
): LevelPhase {
  switch (phase) {
    case "intro":
      return event === "START" ? "play" : phase;
    case "play":
      if (event === "SUBMIT_SUCCESS") return "success";
      if (event === "SUBMIT_FAIL") return "fail";
      return phase;
    case "success":
    case "fail":
      return phase;
  }
}
