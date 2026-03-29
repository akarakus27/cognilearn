import type { GridState, GridCommand, LoopInstruction, ConditionalInstruction, Direction, Condition, RobotState } from "./types";
import { applyCommand, isAtGoal } from "./grid";

export interface CommandResult {
  grid: GridState;
  reachedGoal: boolean;
}

/** Execute a single command; return updated grid */
export function executeCommand(
  grid: GridState,
  command: GridCommand
): CommandResult {
  const nextGrid = applyCommand(grid, command);
  return {
    grid: nextGrid,
    reachedGoal: isAtGoal(nextGrid),
  };
}

/** Execute sequence of commands; return final grid and whether goal was reached */
export function runSequence(
  grid: GridState,
  commands: GridCommand[]
): CommandResult {
  let current = grid;
  for (const cmd of commands) {
    const result = executeCommand(current, cmd);
    current = result.grid;
    if (result.reachedGoal) {
      return { grid: current, reachedGoal: true };
    }
  }
  return { grid: current, reachedGoal: isAtGoal(current) };
}

/** Expand LoopInstructions into a flat GridCommand array */
export function expandInstructions(instructions: LoopInstruction[]): GridCommand[] {
  const flat: GridCommand[] = [];
  for (const inst of instructions) {
    if (typeof inst === "string") {
      flat.push(inst);
    } else {
      for (let i = 0; i < inst.count; i++) {
        flat.push(...inst.body);
      }
    }
  }
  return flat;
}

/** Count top-level instruction blocks (for reward calculation) */
export function countInstructions(instructions: LoopInstruction[]): number {
  return instructions.length;
}

// ─── Conditional simulation ───────────────────────────────────────────────────

const FACING_DELTA: Record<Direction, { dx: number; dy: number }> = {
  RIGHT: { dx: 1, dy: 0 },
  LEFT:  { dx: -1, dy: 0 },
  UP:    { dx: 0, dy: -1 },
  DOWN:  { dx: 0, dy: 1 },
};

/** Returns direction to the right of current facing */
function turnRight(d: Direction): Direction {
  return ({ RIGHT: "DOWN", DOWN: "LEFT", LEFT: "UP", UP: "RIGHT" } as Record<Direction, Direction>)[d];
}

/** Returns direction to the left of current facing */
function turnLeft(d: Direction): Direction {
  return ({ RIGHT: "UP", UP: "LEFT", LEFT: "DOWN", DOWN: "RIGHT" } as Record<Direction, Direction>)[d];
}

/** Returns direction behind current facing */
function behind(d: Direction): Direction {
  return ({ RIGHT: "LEFT", LEFT: "RIGHT", UP: "DOWN", DOWN: "UP" } as Record<Direction, Direction>)[d];
}

function isBlocked(robot: RobotState, dir: Direction, grid: GridState): boolean {
  const { dx, dy } = FACING_DELTA[dir];
  const nx = robot.x + dx;
  const ny = robot.y + dy;
  if (nx < 0 || nx >= grid.cols || ny < 0 || ny >= grid.rows) return true;
  return (grid.obstacles ?? []).some((o) => o.x === nx && o.y === ny);
}

function checkCondition(cond: Condition, robot: RobotState, grid: GridState): boolean {
  switch (cond) {
    case "WALL_AHEAD":   return isBlocked(robot, robot.facing, grid);
    case "WALL_RIGHT":   return isBlocked(robot, turnRight(robot.facing), grid);
    case "WALL_LEFT":    return isBlocked(robot, turnLeft(robot.facing), grid);
    case "WALL_BEHIND":  return isBlocked(robot, behind(robot.facing), grid);
    case "CLEAR_AHEAD":  return !isBlocked(robot, robot.facing, grid);
    case "GOAL_AHEAD": {
      const { dx, dy } = FACING_DELTA[robot.facing];
      return grid.goal.x === robot.x + dx && grid.goal.y === robot.y + dy;
    }
  }
}

export interface ConditionalSimResult {
  flatCommands: GridCommand[];
  finalRobot: RobotState;
  reachedGoal: boolean;
}

/** Simulate conditional instructions, tracking robot direction */
export function simulateConditional(
  instructions: ConditionalInstruction[],
  grid: GridState,
  initialFacing: Direction
): ConditionalSimResult {
  let robot: RobotState = { x: grid.position.x, y: grid.position.y, facing: initialFacing };
  const flat: GridCommand[] = [];
  let reached = false;

  function execCmd(cmd: GridCommand): void {
    if (reached) return;
    flat.push(cmd);
    const next = applyCommand({ ...grid, position: { x: robot.x, y: robot.y } }, cmd);
    robot = { ...robot, x: next.position.x, y: next.position.y, facing: cmd as Direction };
    if (next.position.x === grid.goal.x && next.position.y === grid.goal.y) {
      reached = true;
    }
  }

  function execList(cmds: GridCommand[]): void {
    for (const c of cmds) { if (!reached) execCmd(c); }
  }

  for (const inst of instructions) {
    if (reached) break;
    if (typeof inst === "string") {
      execCmd(inst);
    } else if (inst.type === "REPEAT") {
      for (let i = 0; i < inst.count; i++) {
        if (reached) break;
        execList(inst.body);
      }
    } else if (inst.type === "IF") {
      const taken = checkCondition(inst.condition, robot, grid);
      if (taken) execList(inst.then);
      else if (inst.else) execList(inst.else);
    }
  }

  return { flatCommands: flat, finalRobot: robot, reachedGoal: reached };
}
