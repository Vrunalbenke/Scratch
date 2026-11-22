import React from "react";
import CatSprite from "../components/CatSprite";
import { spriteSize, stageHeight, stageWidth, type Sprite, type SpriteFrame } from "../sprites/spriteTypes";

type SpriteViewProps = {
  sprite: Sprite;
  frame: SpriteFrame;
  onClick: () => void;
};

export default function SpriteView({ sprite, frame, onClick }: SpriteViewProps) {
  const { pose, bubble } = frame;

  return (
    <div
      className="stage-sprite"
      style={{
        left: `${50 + 100 * pose.x / stageWidth}%`,
        top: `${50 - 100 * pose.y / stageHeight}%`,
        width: `${100 * spriteSize / stageWidth}%`,
      }}
    >
      <button
        type="button"
        aria-label={`Select ${sprite.name} on stage`}
        className="sprite-art"
        style={{ transform: `rotate(${pose.angle}deg)`, filter: `hue-rotate(${sprite.hue}deg)` }}
        onClick={onClick}
      >
        <CatSprite />
      </button>
      <span className="stage-sprite-label" aria-hidden="true">{sprite.name}</span>
      {bubble && (
        <div
          role="status"
          aria-label={`${sprite.name} ${bubble.kind === "say" ? "says" : "thinks"}`}
          className={`sprite-bubble sprite-bubble-${bubble.kind} ${pose.x > 60 ? "sprite-bubble-left" : ""}`}
        >
          {bubble.text}
        </div>
      )}
    </div>
  );
}
