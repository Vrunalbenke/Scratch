import type { Block, BlockDrop } from "./blockTypes";

export function acceptsChildren(block: Block) {
  return block.action === "repeat" || block.type === "events";
}

function findBlock(
  script: Block[],
  id: string,
  parentId: string | null = null,
): { block: Block; position: BlockDrop } | undefined {
  for (const [index, block] of script.entries()) {
    if (block.id === id) return { block, position: { parentId, index } };
    const child = findBlock(block.blocks, id, block.id);
    if (child) return child;
  }
}

export function editBlock(
  script: Block[],
  id: string,
  edit: (block: Block) => Block | null,
): Block[] {
  for (const [index, block] of script.entries()) {
    if (block.id === id) {
      const replacement = edit(block);
      return [...script.slice(0, index), ...(replacement ? [replacement] : []), ...script.slice(index + 1)];
    }

    const blocks = editBlock(block.blocks, id, edit);
    if (blocks !== block.blocks) {
      return [...script.slice(0, index), { ...block, blocks }, ...script.slice(index + 1)];
    }
  }
  return script;
}

export function insertBlock(script: Block[], block: Block, { parentId, index }: BlockDrop): Block[] {
  const insert = (blocks: Block[]) => [...blocks.slice(0, index), block, ...blocks.slice(index)];
  if (parentId === null) return insert(script);
  if (block.type === "events") return script;

  const parent = findBlock(script, parentId)?.block;
  if (!parent || !acceptsChildren(parent)) return script;
  return editBlock(script, parentId, (current) => ({ ...current, blocks: insert(current.blocks) }));
}

export function moveBlock(script: Block[], id: string, target: BlockDrop): Block[] {
  const source = findBlock(script, id);
  if (!source) return script;

  const { block, position } = source;
  const { parentId } = target;
  const index = position.parentId === parentId && position.index < target.index
    ? target.index - 1
    : target.index;
  if (position.parentId === parentId && position.index === index) return script;
  const remaining = editBlock(script, id, () => null);
  const updated = insertBlock(remaining, block, { parentId, index });

  return updated === remaining ? script : updated;
}
