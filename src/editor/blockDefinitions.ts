import type { BlockAction, Coordinates, Expression, ScriptTrigger } from "./blockTypes";

type BlockDefinition<Action extends BlockAction> = {
  type: Action extends ScriptTrigger ? "events" : Action extends "repeat"
    ? "controls"
    : Action extends "say" | "think"
      ? "looks"
      : "motion";
  label: string;
  value: Action extends ScriptTrigger ? null : Action extends "xy"
    ? Coordinates
    : Action extends "say" | "think"
      ? Expression
      : number;
  icon?: "undo" | "redo";
};

export const blockDefinitions: { [Action in BlockAction]: BlockDefinition<Action> } = {
  "flag-clicked": { type: "events", label: "When green flag clicked", value: null },
  "sprite-clicked": { type: "events", label: "When this sprite clicked", value: null },
  move: { type: "motion", label: "Move steps", value: 10 },
  turn: { type: "motion", label: "Turn counterclockwise", value: 15, icon: "undo" },
  "anti-turn": { type: "motion", label: "Turn clockwise", value: 15, icon: "redo" },
  xy: { type: "motion", label: "Go to x and y", value: { x: 10, y: 10 } },
  repeat: { type: "controls", label: "Repeat", value: 10 },
  say: { type: "looks", label: "Say", value: { text: "JusPay, Design to simplify.", seconds: 5 } },
  think: { type: "looks", label: "Think", value: { text: "Hmm...", seconds: 5 } },
};
