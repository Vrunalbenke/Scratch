import type { Block, Coordinates } from "../editor/blockTypes";

export type SpritePose = Coordinates & { angle: number };
export type SpriteBubble = { kind: "say" | "think"; text: string };

export type Sprite = {
  id: string;
  name: string;
  script: Block[];
  start: SpritePose;
  hue: number;
};

export type SpriteFrame = {
  id: string;
  pose: SpritePose;
  bubble: SpriteBubble | null;
};

export const stageWidth = 480;
export const stageHeight = 360;
export const spriteSize = 64;

const startingPositions: Coordinates[] = [
  { x: 0, y: 0 }, { x: 110, y: 0 }, { x: -110, y: 0 },
  { x: 0, y: 100 }, { x: 110, y: 100 }, { x: -110, y: 100 },
  { x: 0, y: -100 }, { x: 110, y: -100 }, { x: -110, y: -100 },
  { x: 195, y: 0 }, { x: -195, y: 0 },
  { x: 195, y: 100 }, { x: -195, y: 100 },
  { x: 195, y: -100 }, { x: -195, y: -100 },
];

export function createSprite(number: number): Sprite {
  const position = startingPositions[(number - 1) % startingPositions.length];
  return {
    id: `sprite-${number}`,
    name: `Sprite ${number}`,
    script: [],
    start: { ...position, angle: 0 },
    hue: (number - 1) * 75 % 360,
  };
}
