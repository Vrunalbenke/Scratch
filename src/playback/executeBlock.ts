import type { Block, Coordinates, ScriptTrigger } from "../editor/blockTypes";
import type { SpriteBubble, SpritePose } from "../sprites/spriteTypes";

const motionDuration = 180;

export type Effect =
  | { kind: "move" | "turn"; amount: number; duration: number }
  | { kind: "go"; position: Coordinates; duration: number }
  | { kind: "bubble"; bubble: SpriteBubble; duration: number };

function* executeBlock(block: Block): Generator<Effect> {
  switch (block.action) {
    case "move":
      yield { kind: "move", amount: block.value, duration: motionDuration };
      break;
    case "turn":
    case "anti-turn":
      yield { kind: "turn", amount: block.action === "turn" ? -block.value : block.value, duration: motionDuration };
      break;
    case "xy":
      yield { kind: "go", position: block.value, duration: motionDuration };
      break;
    case "say":
    case "think":
      if (block.value.seconds > 0) {
        yield {
          kind: "bubble",
          bubble: { kind: block.action, text: block.value.text },
          duration: block.value.seconds * 1000,
        };
      }
      break;
    case "repeat":
      for (let iteration = 0; iteration < block.value; iteration++) {
        let hasEffects = false;
        for (const child of block.blocks) {
          for (const effect of executeBlock(child)) {
            hasEffects = true;
            yield effect;
          }
        }
        if (!hasEffects) break;
      }
      break;
  }
}

export function* executeScript(script: Block[], trigger: ScriptTrigger): Generator<Effect> {
  for (const block of script) {
    if (block.type === "events") {
      if (block.action === trigger) {
        for (const child of block.blocks) yield* executeBlock(child);
      }
    } else if (trigger === "flag-clicked") {
      yield* executeBlock(block);
    }
  }
}

export function advancePose(pose: SpritePose, effect: Effect, fraction: number): SpritePose {
  if (effect.kind === "turn") {
    const angle = (pose.angle + effect.amount * fraction) % 360;
    return { ...pose, angle };
  }
  if (effect.kind === "move") {
    const direction = pose.angle * Math.PI / 180;
    const distance = effect.amount * fraction;
    return {
      ...pose,
      x: pose.x + distance * Math.cos(direction),
      y: pose.y - distance * Math.sin(direction),
    };
  }
  return pose;
}
