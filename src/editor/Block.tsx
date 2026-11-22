import React, { useState, type ReactNode } from "react";
import Icon from "../components/Icon";
import { blockDefinitions } from "./blockDefinitions";
import type { Block as BlockData } from "./blockTypes";

type BlockProps = {
  block: BlockData;
  onChange: (block: BlockData) => void;
  onRemove?: () => void;
  children?: ReactNode;
};

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const blockColors = {
  events: "bg-yellow-500",
  motion: "bg-blue-500",
  looks: "bg-purple-500",
  controls: "bg-pink-500",
};

const NumberInput = ({ label, value, onChange, min }: NumberInputProps) => {
  const [editingText, setEditingText] = useState<string | null>(null);

  return (
    <input
      aria-label={label}
      className="block-number rounded-xl border mx-1 text-gray-900 text-center"
      type="number"
      step="any"
      min={min}
      value={editingText ?? value}
      onBlur={() => setEditingText(null)}
      onChange={(event) => {
        const { value: text, valueAsNumber: nextValue } = event.currentTarget;
        setEditingText(text);
        if (Number.isFinite(nextValue)) onChange(nextValue);
      }}
    />
  );
}

const TextInput = ({ label, value, onChange }: TextInputProps) => {
  return (
    <input
      aria-label={label}
      className="block-text rounded-xl border mx-1 px-1 text-gray-900"
      type="text"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

const Block = ({ block, onChange, onRemove, children }: BlockProps) => {
  const renderAction = () => {
    switch (block.action) {
      case "flag-clicked":
        return <>When <Icon name="flag" size={15} className="mx-2 text-green-600" /> clicked</>;
      case "sprite-clicked":
        return blockDefinitions[block.action].label;
      case "move":
        return <>Move <NumberInput label="Steps" value={block.value} onChange={(value) => onChange({ ...block, value })} /> steps</>;

      case "turn":
      case "anti-turn":
        return <>
          Turn <Icon name={blockDefinitions[block.action].icon ?? "undo"} size={15} className="ml-2" />
          <NumberInput label={block.action === "turn" ? "Counterclockwise degrees" : "Clockwise degrees"} value={block.value} onChange={(value) => onChange({ ...block, value })} />
          degrees
        </>;

      case "xy":
        return <>
          Go to x:
          <NumberInput label="X coordinate" value={block.value.x} onChange={(x) => onChange({ ...block, value: { ...block.value, x } })} />
          y:
          <NumberInput label="Y coordinate" value={block.value.y} onChange={(y) => onChange({ ...block, value: { ...block.value, y } })} />
        </>;

      case "repeat":
        return <>
          Repeat <NumberInput label="Repeat count" value={block.value} min={0} onChange={(value) => {
            onChange({ ...block, value: Math.max(0, Math.trunc(value)) });
          }} /> times
        </>;

      case "say":
      case "think":
        return <>
          {blockDefinitions[block.action].label}
          <TextInput label={blockDefinitions[block.action].label} value={block.value.text} onChange={(text) => {
            onChange({ ...block, value: { ...block.value, text } });
          }} />
          for <NumberInput label="Seconds" value={block.value.seconds} min={0} onChange={(seconds) => {
            onChange({ ...block, value: { ...block.value, seconds: Math.max(0, seconds) } });
          }} /> seconds
        </>;

    }
  }

  return (
    <div className={`editor-block editor-block-${block.type} ${blockColors[block.type]} rounded-sm`}>
      <div className="block-header flex flex-wrap items-center px-2 py-1 text-sm text-white">
        {renderAction()}
        {onRemove && (
          <button type="button" aria-label={`Remove ${blockDefinitions[block.action].label}`} className="ml-2 rounded p-1 hover:bg-black hover:bg-opacity-20" onClick={onRemove}>
            <Icon name="x" size={11} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}


export default Block;
