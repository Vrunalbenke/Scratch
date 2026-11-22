import React from "react";
import CatSprite from "../components/CatSprite";
import type { Sprite } from "../sprites/spriteTypes";

type SpriteListProps = {
  sprites: Sprite[];
  selectedId: string;
  isPlaying: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export default function SpriteList({ sprites, selectedId, isPlaying, onSelect, onAdd }: SpriteListProps) {
  return (
    <section aria-label="Sprites" className="mt-3 border-t border-gray-200 pt-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-bold">Sprites</h2>
        <button
          type="button"
          className="editor-button bg-blue-100 text-blue-800 hover:bg-blue-200"
          onClick={onAdd}
          disabled={isPlaying}
        >
          + Add sprite
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sprites.map(({ id, name, hue }) => (
          <button
            key={id}
            type="button"
            aria-pressed={selectedId === id}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-sm ${selectedId === id
              ? "border-blue-300 bg-blue-100 text-blue-800"
              : "border-gray-200 bg-white hover:bg-blue-50"}`}
            onClick={() => onSelect(id)}
          >
            <span className="sprite-thumbnail" aria-hidden="true" style={{ filter: `hue-rotate(${hue}deg)` }}><CatSprite /></span>
            {name}
          </button>
        ))}
      </div>
    </section>
  );
}
