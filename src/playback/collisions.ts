import type { Coordinates } from "../editor/blockTypes";
import { spriteSize } from "../sprites/spriteTypes";

type Path = { from: Coordinates; to: Coordinates };
export type CollisionPair = [string, string];

const contactDistanceSquared = (spriteSize - 8) ** 2;

export function touching(a: Coordinates, b: Coordinates) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 <= contactDistanceSquared;
}

export function crossed(a: Path, b: Path) {
  const x = a.from.x - b.from.x;
  const y = a.from.y - b.from.y;
  const dx = a.to.x - b.to.x - x;
  const dy = a.to.y - b.to.y - y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return false;
  const fraction = Math.max(0, Math.min(1, -(x * dx + y * dy) / lengthSquared));
  return (x + fraction * dx) ** 2 + (y + fraction * dy) ** 2 <= contactDistanceSquared;
}
