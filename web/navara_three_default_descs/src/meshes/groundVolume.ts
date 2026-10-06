import type ThreeView from "@navaramap/three";
import type { GeographicExtent, HeightRange } from "@navaramap/three";

/**
 * Keeps the volume heights of one extent current: computed by `volume` from
 * {@link ThreeView.sampleTerrainHeightRange} when the extent is set, then
 * from the engine's observer, which calls `onChange`.
 */
export class GroundVolumeWatch {
  /** `[min, max]`, or `undefined` while no extent is watched. */
  heights?: [number, number];
  private readonly view: ThreeView;
  private readonly volume: (
    range: HeightRange,
    extent: GeographicExtent,
  ) => [number, number];
  private readonly onChange: () => void;
  private range?: HeightRange;
  private unobserve?: () => void;

  constructor(
    view: ThreeView,
    volume: (range: HeightRange, extent: GeographicExtent) => [number, number],
    onChange: () => void,
  ) {
    this.view = view;
    this.volume = volume;
    this.onChange = onChange;
  }

  /** Watches `extent`, or stops watching when it is `undefined`. */
  watch(extent: GeographicExtent | undefined) {
    this.unobserve?.();
    this.unobserve = undefined;
    this.range = undefined;
    this.heights = undefined;
    if (!extent) return;

    // The ellipsoid surface until the engine has a terrain quadtree.
    this.update(
      this.view.sampleTerrainHeightRange(extent) ?? { min: 0, max: 0 },
      extent,
    );
    this.unobserve = this.view.observeTerrainHeightRange(extent, (range) => {
      if (this.range?.min === range.min && this.range.max === range.max) {
        return;
      }
      this.update(range, extent);
      this.onChange();
    });
  }

  private update(range: HeightRange, extent: GeographicExtent) {
    this.range = range;
    this.heights = this.volume(range, extent);
  }
}
