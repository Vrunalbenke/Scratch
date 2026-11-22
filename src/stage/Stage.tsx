import React from "react";
import type { Sprite, SpriteFrame } from "../sprites/spriteTypes";
import SpriteView from "./SpriteView";

type StageProps = {
  sprites: Sprite[];
  frames: Record<string, SpriteFrame>;
  onSpriteClick: (id: string) => void;
};

export default function Stage({ sprites, frames, onSpriteClick }: StageProps) {
  return (
    <div className="stage border border-gray-200 bg-white" role="group" aria-label="Stage">
      {sprites.map((sprite) => (
        <SpriteView
          key={sprite.id}
          sprite={sprite}
          frame={frames[sprite.id] ?? { id: sprite.id, pose: sprite.start, bubble: null }}
          onClick={() => onSpriteClick(sprite.id)}
        />
      ))}
    </div>
  );
}
