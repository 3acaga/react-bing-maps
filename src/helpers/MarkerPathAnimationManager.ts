import { EntityDescriptor } from "../index";

class MarkerPathAnimationManager {
  private isRunning = false;
  private lvlMin: number;
  private lvlMax: number;

  private entities: EntityDescriptor[];
  private timeParts: { [T: string]: number };

  constructor(entities: EntityDescriptor[], animationDuration: number) {
    const { lvlMin, lvlMax, lengths } = entities.reduce<{
      lvlMin: number;
      lvlMax: number;
      lengths: { [T: number]: number };
    }>(
      (acc, ent) => {
        acc.lvlMin = acc.lvlMin > ent.level ? ent.level : acc.lvlMin;
        acc.lvlMax = acc.lvlMax < ent.level ? ent.level : acc.lvlMax;

        acc.lengths[ent.level] =
          acc.lengths[ent.level] > ent.length
            ? acc.lengths[ent.level]
            : ent.length;

        return acc;
      },
      { lvlMin: Number.MAX_VALUE, lvlMax: Number.MIN_VALUE, lengths: {} }
    );

    let timeParts;
    const fullLength = Object.values(lengths).reduce((acc, cur) => acc + cur);
    const paths = Object.entries(lengths).sort((a, b) => b[1] - a[1]);

    const [maxPathLevel, maxPath] = paths[0];
    let restPaths = 1;
    let delta = 0;

    if (maxPath / fullLength > 0.75) {
      const tempMax = maxPath;
      restPaths = paths.slice(1).reduce((acc, cur) => acc + cur[1], 0);
      delta = tempMax - 0.7 * fullLength;
    }

    timeParts = Object.entries(lengths).reduce<{
      [T: string]: number;
    }>((acc, [key, len]) => {
      if (key === maxPathLevel) {
        acc[key] = (animationDuration * (len - delta)) / fullLength;
      } else {
        acc[key] =
          (animationDuration * ((len / restPaths) * delta)) / fullLength;
      }
      return acc;
    }, {});

    this.entities = entities;
    this.lvlMin = lvlMin;
    this.lvlMax = lvlMax;
    this.timeParts = timeParts;
  }

  private animate = (level: number) => {
    return this.entities.reduce<Promise<any>[]>((acc, ent) => {
      if (ent.level === level && ent.startAnimation) {
        acc.push(ent.startAnimation(this.timeParts[level]));
      }

      return acc;
    }, []);
  };

  start = async () => {
    this.isRunning = true;

    while (this.isRunning) {
      for (let i = 0; i < this.lvlMax + Math.abs(this.lvlMin) + 1; i++)
        await Promise.all(this.animate(this.lvlMin + i));
    }
  };

  stop() {
    this.isRunning = false;
  }
}

export default MarkerPathAnimationManager;
