import type { LevelSchema } from "@cognitive/content-schema";
import type { EngineState, Action } from "./types";
import { createGridState } from "./grid";
import { executeCommand } from "./command";
import { validate as validateSolution } from "./validator";
import { transition } from "./state-machine";

const initialState: EngineState = {
  level: null,
  grid: null,
  phase: "intro",
  commandHistory: [],
};

/** Game engine — framework-agnostic, pure logic */
export class Engine {
  private state: EngineState = { ...initialState };

  /** Load level and initialize state */
  loadLevel(level: LevelSchema): EngineState {
    const grid = createGridState(level);
    this.state = {
      level: { ...level },
      grid: grid ? { ...grid } : null,
      phase: "intro",
      commandHistory: [],
    };
    return this.getState();
  }

  /** Execute action; return updated state */
  executeAction(action: Action): EngineState {
    switch (action.type) {
      case "START_LEVEL":
        if (this.state.phase === "intro") {
          this.state.phase = transition(this.state.phase, "START");
        }
        break;

      case "EXECUTE_COMMAND":
        if (this.state.phase === "play" && this.state.grid) {
          const result = executeCommand(this.state.grid, action.command);
          this.state.grid = result.grid;
          this.state.commandHistory = [
            ...this.state.commandHistory,
            action.command,
          ];
          if (result.reachedGoal && this.state.level) {
            const validation = validateSolution(
              this.state.level,
              this.state.commandHistory
            );
            this.state.phase = validation.valid
              ? transition(this.state.phase, "SUBMIT_SUCCESS")
              : transition(this.state.phase, "SUBMIT_FAIL");
          }
        }
        break;

      case "RUN_SEQUENCE":
        if (this.state.phase === "play" && this.state.grid) {
          const cmds = action.commands;
          for (const cmd of cmds) {
            const result = executeCommand(this.state.grid, cmd);
            this.state.grid = result.grid;
            this.state.commandHistory = [
              ...this.state.commandHistory,
              cmd,
            ];
            if (result.reachedGoal) break;
          }
          if (this.state.level) {
            const validation = validateSolution(
              this.state.level,
              this.state.commandHistory
            );
            this.state.phase = validation.valid
              ? transition(this.state.phase, "SUBMIT_SUCCESS")
              : transition(this.state.phase, "SUBMIT_FAIL");
          }
        }
        break;

      case "RETRY":
        if (this.state.level && this.state.phase === "fail") {
          const grid = createGridState(this.state.level);
          this.state = {
            level: { ...this.state.level },
            grid: grid ? { ...grid } : null,
            phase: "play",
            commandHistory: [],
          };
        }
        break;

      case "RESET_PLAY":
        if (this.state.level && this.state.phase === "play") {
          const grid = createGridState(this.state.level);
          this.state.grid = grid ? { ...grid } : null;
          this.state.commandHistory = [];
        }
        break;
    }
    return this.getState();
  }

  /** Return current engine state (immutable snapshot) */
  getState(): EngineState {
    return {
      level: this.state.level ? { ...this.state.level } : null,
      grid: this.state.grid
        ? { ...this.state.grid, position: { ...this.state.grid.position } }
        : null,
      phase: this.state.phase,
      commandHistory: [...this.state.commandHistory],
    };
  }
}

export { createGridState, isValidCell, applyCommand } from "./grid";
export { executeCommand, runSequence } from "./command";
export { validate } from "./validator";
export { transition } from "./state-machine";
export {
  computeStars,
  computeXp,
  computeReward,
  type RewardResult,
} from "./reward";
export type {
  EngineState,
  Action,
  GridCommand,
  GridState,
  ValidationResult,
  LevelPhase,
} from "./types";
