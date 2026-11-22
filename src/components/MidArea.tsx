import React, { useState, type DragEvent } from "react";
import Block from "../editor/Block";
import { blockDragType, type Block as BlockData, type BlockDrop } from "../editor/blockTypes";
import { acceptsChildren } from "../editor/scriptTree";

type MidAreaProps = {
  spriteName: string;
  actions: BlockData[];
  onDropBlock: (source: string, target: BlockDrop) => void;
  onUpdateBlock: (block: BlockData) => void;
  onRemoveBlock: (id: string) => void;
};

export default function MidArea({ spriteName, actions, onDropBlock, onUpdateBlock, onRemoveBlock }: MidAreaProps) {
  const [activeTarget, setActiveTarget] = useState<string | null>(null);

  const targetKey = ({ parentId, index }: BlockDrop) => `${parentId ?? "root"}:${index}`;

  const allowDrop = (event: DragEvent, target: BlockDrop) => {
    if (!event.dataTransfer.types.includes(blockDragType)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = event.dataTransfer.effectAllowed === "copy" ? "copy" : "move";
    setActiveTarget(targetKey(target));
  };

  const handleDrop = (event: DragEvent, target: BlockDrop) => {
    const source = event.dataTransfer.getData(blockDragType);
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    setActiveTarget(null);
    onDropBlock(source, target);
  };

  const renderDropSlot = (target: BlockDrop) => (
    <div
      className={`script-slot ${activeTarget === targetKey(target) ? "script-slot-active" : ""}`}
      onDragOver={(event) => allowDrop(event, target)}
      onDrop={(event) => handleDrop(event, target)}
    />
  );

  const renderBlocks = (blocks: BlockData[], parentId: string | null) => (
    <>
      {blocks.map((block, index) => {
        const nested = acceptsChildren(block);
        const targetAt = (event: DragEvent<HTMLDivElement>) => {
          if (nested) return { parentId: block.id, index: block.blocks.length };
          const { top, height } = event.currentTarget.getBoundingClientRect();
          return { parentId, index: event.clientY < top + height / 2 ? index : index + 1 };
        };

        return (
          <React.Fragment key={block.id}>
            {renderDropSlot({ parentId, index })}
            <div
              className="script-block cursor-grab"
              draggable
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData(blockDragType, block.id);
              }}
              onDragEnd={() => setActiveTarget(null)}
              onDragOver={(event) => allowDrop(event, targetAt(event))}
              onDrop={(event) => handleDrop(event, targetAt(event))}
            >
              <Block block={block} onChange={onUpdateBlock} onRemove={() => onRemoveBlock(block.id)}>
                {nested && (
                  <div className="script-children">
                    {block.blocks.length ? renderBlocks(block.blocks, block.id) : (
                      <div
                        className={`script-empty ${activeTarget === targetKey({ parentId: block.id, index: 0 }) ? "script-slot-active" : ""}`}
                      >
                        Drop blocks here
                      </div>
                    )}
                  </div>
                )}
              </Block>
            </div>
          </React.Fragment>
        );
      })}
      {renderDropSlot({ parentId, index: blocks.length })}
    </>
  );

  const endOfScript = { parentId: null, index: actions.length };
  return (
    <section
      aria-label={`${spriteName} script`}
      className="workspace min-w-0 flex-1 overflow-auto p-2"
      onDragOver={(event) => allowDrop(event, endOfScript)}
      onDrop={(event) => handleDrop(event, endOfScript)}
      onDragLeave={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setActiveTarget(null);
      }}
    >
      <h2 className="font-bold">{spriteName} script</h2>
      <div className="script-stack mt-2">
        {actions.length ? renderBlocks(actions, null) : (
          <div
            className={`script-empty workspace-empty ${activeTarget === targetKey(endOfScript) ? "script-slot-active" : ""}`}
          >
            Drag blocks here to build a script.
          </div>
        )}
      </div>
    </section>
  );
}
