import React, { useEffect, useRef, useState } from "react";
import type { ScriptTrigger } from "../editor/blockTypes";
import SpriteList from "../editor/SpriteList";
import type { CollisionPair } from "../playback/collisions";
import { startPlayback } from "../playback/playback";
import type { Sprite, SpriteFrame } from "../sprites/spriteTypes";
import Stage from "../stage/Stage";
import Icon from "./Icon";

type PreviewAreaProps = {
  sprites: Sprite[];
  selectedId: string;
  onSelectSprite: (id: string) => void;
  onAddSprite: () => void;
};

export default function PreviewArea({ sprites, selectedId, onSelectSprite, onAddSprite }: PreviewAreaProps) {
  const [frames, setFrames] = useState<Record<string, SpriteFrame>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastCollision, setLastCollision] = useState<CollisionPair | null>(null);
  const cancelPlayback = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelPlayback.current?.(), []);

  const finishPlayback = () => {
    cancelPlayback.current = null;
    setIsPlaying(false);
  };

  const run = (trigger: ScriptTrigger, spriteId?: string) => {
    if (cancelPlayback.current) return;
    const cancel = startPlayback(
      sprites.map(({ id, start, script }) => ({ id, pose: frames[id]?.pose ?? start, script })),
      trigger,
      spriteId,
      (nextFrames, collision) => {
        const updated: Record<string, SpriteFrame> = {};
        for (const frame of nextFrames) updated[frame.id] = frame;
        setFrames(updated);
        if (collision) setLastCollision(collision);
      },
      finishPlayback,
    );
    if (!cancel) return;
    cancelPlayback.current = cancel;
    setLastCollision(null);
    setIsPlaying(true);
  };

  const stop = () => {
    cancelPlayback.current?.();
    finishPlayback();
    setFrames((previous) => {
      const cleared = { ...previous };
      for (const id of Object.keys(cleared)) cleared[id] = { ...cleared[id], bubble: null };
      return cleared;
    });
  };

  const selectedSprite = sprites.find(({ id }) => id === selectedId) ?? sprites[0];
  const pose = frames[selectedId]?.pose ?? selectedSprite.start;
  const collisionNames = lastCollision?.map((id) => sprites.find((sprite) => sprite.id === id)?.name);

  return (
    <section aria-label="Playback" className="flex-1 overflow-y-auto p-2">
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          className="editor-button bg-green-100 text-green-800 hover:bg-green-200"
          onClick={() => run("flag-clicked")}
          disabled={isPlaying}
        >
          <Icon name="flag" size={15} className="text-green-700" />
          Play
        </button>
        <button
          type="button"
          className="editor-button bg-gray-100 text-gray-700 hover:bg-gray-200"
          onClick={stop}
          disabled={!isPlaying}
        >
          Stop
        </button>
      </div>
      <Stage
        sprites={sprites}
        frames={frames}
        onSpriteClick={(id) => {
          onSelectSprite(id);
          run("sprite-clicked", id);
        }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span>{selectedSprite.name}</span>
        <span>x {Math.round(pose.x)}</span>
        <span>y {Math.round(pose.y)}</span>
        <span>{Math.round((90 + pose.angle + 360) % 360)}°</span>
      </div>
      <p className="collision-status text-sm text-blue-800" role="status">
        {collisionNames && `${collisionNames.join(" and ")} swapped animations.`}
      </p>
      <SpriteList sprites={sprites} selectedId={selectedId} isPlaying={isPlaying} onSelect={onSelectSprite} onAdd={onAddSprite} />
    </section>
  );
}
