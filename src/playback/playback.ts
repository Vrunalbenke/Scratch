import type { Block, ScriptTrigger } from "../editor/blockTypes";
import type { SpriteFrame, SpritePose } from "../sprites/spriteTypes";
import { crossed, touching, type CollisionPair } from "./collisions";
import { advancePose, executeScript, type Effect } from "./executeBlock";

type Animation = {
  steps: Generator<Effect>;
  effect: Effect;
  remaining: number;
  started: boolean;
};

type Actor = {
  id: string;
  pose: SpritePose;
  animation: Animation | null;
};

type PlaybackSprite = {
  id: string;
  pose: SpritePose;
  script: Block[];
};

export function startPlayback(
  sprites: PlaybackSprite[],
  trigger: ScriptTrigger,
  clickedId: string | undefined,
  onFrame: (frames: SpriteFrame[], collision: CollisionPair | null) => void,
  onFinish: () => void,
): (() => void) | undefined {
  const actors: Actor[] = sprites.map(({ id, pose, script }) => {
    const steps = executeScript(clickedId === undefined || clickedId === id ? script : [], trigger);
    const first = steps.next();
    return { id, pose, animation: first.done ? null : { steps, effect: first.value, remaining: first.value.duration, started: false } };
  });
  if (!actors.some((actor) => actor.animation)) return;

  let frameId: number;
  let previousTime: number | undefined;
  let previousFrames: SpriteFrame[] = [];
  const contacts = new Set<string>();

  for (let i = 0; i < actors.length; i++) {
    for (let j = i + 1; j < actors.length; j++) {
      if (touching(actors[i].pose, actors[j].pose)) contacts.add(`${i}:${j}`);
    }
  }

  const frame = (time: number) => {
    const elapsed = time - (previousTime ?? time);
    previousTime = time;
    const paths = actors.map((actor) => {
      const from = actor.pose;
      const animation = actor.animation;
      if (!animation) return { from, to: from };

      if (animation.started) {
        const duration = Math.min(elapsed, animation.remaining);
        if (duration > 0) actor.pose = advancePose(actor.pose, animation.effect, duration / animation.effect.duration);
        animation.remaining -= duration;
      }

      if (animation.remaining <= 0) {
        const next = animation.steps.next();
        if (next.done) {
          actor.animation = null;
          return { from, to: actor.pose };
        }
        animation.effect = next.value;
        animation.remaining = next.value.duration;
        animation.started = false;
      }

      if (!animation.started) {
        animation.started = true;
        if (animation.effect.kind === "go") {
          const to = actor.pose;
          actor.pose = { ...actor.pose, ...animation.effect.position };
          return { from, to };
        }
      }
      return { from, to: actor.pose };
    });

    let collision: CollisionPair | null = null;
    for (let i = 0; i < actors.length; i++) {
      for (let j = i + 1; j < actors.length; j++) {
        const key = `${i}:${j}`;
        const a = actors[i];
        const b = actors[j];
        const contact = touching(a.pose, b.pose);
        const entered = !contacts.has(key) && (contact || crossed(paths[i], paths[j]));

        if (contact || entered) contacts.add(key);
        else contacts.delete(key);

        if (entered && (a.animation || b.animation)) {
          [a.animation, b.animation] = [b.animation, a.animation];
          collision = [a.id, b.id];
        }
      }
    }

    const frames = actors.map(({ id, pose, animation }) => ({
      id,
      pose,
      bubble: animation?.effect.kind === "bubble" ? animation.effect.bubble : null,
    }));
    if (collision || frames.some(({ pose, bubble }, i) => pose !== previousFrames[i]?.pose || bubble !== previousFrames[i]?.bubble)) {
      onFrame(frames, collision);
      previousFrames = frames;
    }

    if (actors.some((actor) => actor.animation)) frameId = requestAnimationFrame(frame);
    else onFinish();
  };

  frameId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(frameId);
}
