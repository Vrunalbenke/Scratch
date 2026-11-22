import React, { useRef, useState } from "react";
import BlockPalette from "./editor/BlockPalette";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import type { Block, BlockDrop } from "./editor/blockTypes";
import { editBlock, insertBlock, moveBlock } from "./editor/scriptTree";
import { createSprite } from "./sprites/spriteTypes";
import "./editor/editor.css";

const App = () => {
  const [sprites, setSprites] = useState(() => [createSprite(1)]);
  const [selectedId, setSelectedId] = useState(sprites[0].id);
  const paletteBlock = useRef<Block | null>(null);
  const selectedSprite = sprites.find(({ id }) => id === selectedId) ?? sprites[0];

  const editScript = (edit: (script: Block[]) => Block[]) => {
    setSprites((previous) => previous.map((sprite) => (
      sprite.id === selectedSprite.id ? { ...sprite, script: edit(sprite.script) } : sprite
    )));
  };

  const handleDrop = (source: string, target: BlockDrop) => {
    if (source === "palette") {
      const block = paletteBlock.current;
      if (block) editScript((script) => insertBlock(script, block, target));
    } else {
      editScript((script) => moveBlock(script, source, target));
    }
  };

  const addSprite = () => {
    const sprite = createSprite(sprites.length + 1);
    setSprites((previous) => [...previous, sprite]);
    setSelectedId(sprite.id);
  };

  const discardBlock = (id: string) => editScript((script) => editBlock(script, id, () => null));

  return (
    <main className="min-h-screen bg-blue-100 pt-6 font-sans">
      <div className="playground-layout flex flex-col gap-4 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-tr-xl border-t border-r border-gray-200 bg-white sm:flex-row">
          <BlockPalette
            onAdd={(block) => editScript((script) => insertBlock(script, block, { parentId: null, index: script.length }))}
            onDragBlock={(block) => { paletteBlock.current = block; }}
            onDiscardBlock={discardBlock}
          />
          <MidArea
            key={selectedSprite.id}
            spriteName={selectedSprite.name}
            actions={selectedSprite.script}
            onDropBlock={handleDrop}
            onUpdateBlock={(block) => editScript((script) => (
              editBlock(script, block.id, (current) => ({ ...block, blocks: current.blocks }))
            ))}
            onRemoveBlock={discardBlock}
          />
        </div>
        <div className="flex min-w-0 flex-col overflow-hidden rounded-tl-xl border-t border-l border-gray-200 bg-white md:w-1/3">
          <PreviewArea
            sprites={sprites}
            selectedId={selectedSprite.id}
            onSelectSprite={setSelectedId}
            onAddSprite={addSprite}
          />
        </div>
      </div>
    </main>
  );
};

export default App;