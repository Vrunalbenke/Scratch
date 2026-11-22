import React, { useState } from "react";
import Block from "./Block";
import { blockDefinitions } from "./blockDefinitions";
import { blockDragType, type Block as BlockData, type BlockAction } from "./blockTypes";

const motionActions = ["move", "turn", "anti-turn", "xy"] as const;
const looksActions = ["say", "think"] as const;
const eventActions = ["flag-clicked", "sprite-clicked"] as const;
const actions = [...eventActions, ...motionActions, "repeat", ...looksActions] as const;
let nextBlockId = 1;

function createDrafts(): Record<BlockAction, BlockData> {
  const drafts = {} as Record<BlockAction, BlockData>;
  for (const action of actions) {
    const draft = { id: action, blocks: [] };
    if (action === "flag-clicked" || action === "sprite-clicked") {
      drafts[action] = { ...draft, action, type: "events", value: blockDefinitions[action].value };
    } else if (action === "xy") {
      drafts[action] = { ...draft, action, type: "motion", value: { ...blockDefinitions.xy.value } };
    } else if (action === "repeat") {
      drafts[action] = { ...draft, action, type: "controls", value: blockDefinitions.repeat.value };
    } else if (action === "think" || action === "say") {
      drafts[action] = { ...draft, action, type: "looks", value: blockDefinitions[action].value };
    } else {
      drafts[action] = { ...draft, action, type: "motion", value: blockDefinitions[action].value };
    }
  }
  return drafts;
}

type BlockPaletteProps = {
  onAdd: (block: BlockData) => void;
  onDragBlock: (block: BlockData | null) => void;
  onDiscardBlock: (id: string) => void;
};

export default function BlockPalette({ onAdd, onDragBlock, onDiscardBlock }: BlockPaletteProps) {
  const [drafts, setDrafts] = useState(createDrafts);

  const renderDraft = (action: BlockAction) => {
    const draft = drafts[action];
    const newBlock = () => ({ ...draft, id: `block-${nextBlockId++}` });
    return (
      <div
        key={action}
        className="flex max-w-full cursor-grab items-center gap-1"
        draggable
        onDragStart={(event) => {
          onDragBlock(newBlock());
          event.dataTransfer.effectAllowed = "copy";
          event.dataTransfer.setData(blockDragType, "palette");
        }}
        onDragEnd={() => onDragBlock(null)}
      >
        <Block
          block={draft}
          onChange={(block) => setDrafts((previous) => ({ ...previous, [action]: block }))}
        />
        <button
          type="button"
          className="block-add flex-shrink-0 rounded-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
          aria-label={`Add ${blockDefinitions[action].label}`}
          onClick={() => onAdd(newBlock())}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Block palette"
      className="palette flex flex-none flex-col items-start gap-2 overflow-y-auto border-b border-gray-200 p-2 sm:w-60 sm:border-b-0 sm:border-r"
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(blockDragType) && event.dataTransfer.effectAllowed === "move") {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(event) => {
        const id = event.dataTransfer.getData(blockDragType);
        if (!id || id === "palette") return;
        event.preventDefault();
        onDiscardBlock(id);
      }}
    >
      <h2 className="font-bold">Events</h2>
      {eventActions.map(renderDraft)}
      <h2 className="mt-2 font-bold">Motion</h2>
      {motionActions.map(renderDraft)}
      <h2 className="mt-2 font-bold">Looks</h2>
      {looksActions.map(renderDraft)}
      <h2 className="mt-2 font-bold">Controls</h2>
      {renderDraft("repeat")}
    </aside>
  );
}
