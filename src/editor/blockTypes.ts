export type Coordinates = {
  x: number;
  y: number;
};

export type Expression = {
  text: string;
  seconds: number;
};

export type ScriptTrigger = "flag-clicked" | "sprite-clicked";

export type Block = { id: string; blocks: Block[] } & (
  | { type: "motion"; action: "move" | "turn" | "anti-turn"; value: number }
  | { type: "motion"; action: "xy"; value: Coordinates }
  | { type: "events"; action: ScriptTrigger; value: null }
  | { type: "controls"; action: "repeat"; value: number }
  | { type: "looks"; action: "say" | "think"; value: Expression }
);

export type BlockAction = Block["action"];

export type BlockDrop = { parentId: string | null; index: number };

export const blockDragType = "application/x-scratch-block";
