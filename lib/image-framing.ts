/**
 * Single source of truth for how an image's saved framing
 * (imageScale / imagePositionX / imagePositionY) maps to an actual CSS
 * transform inside a given container.
 *
 * Storage model:
 * - imageScale is stored as-is: a plain, container-independent zoom
 *   factor (1..3). Nothing here changes its meaning.
 * - imagePositionX / imagePositionY are stored NORMALIZED, as a
 *   fraction of the maximum pan range for the given scale: -1 means
 *   "panned fully to one edge", 0 means centered, 1 means fully to the
 *   other edge. This is what makes a single saved value replay
 *   correctly across containers of different sizes (editor preview,
 *   owner dashboard card, customer thumbnail) — the previous
 *   implementation stored raw pixel offsets, which only meant what
 *   they meant relative to the exact container the value was captured
 *   in, so the same stored value produced different crops everywhere
 *   else.
 *
 * Every place that renders or edits a framed image should go through
 * this module rather than reimplementing this math locally.
 */

export const MIN_SCALE = 1;

export interface ContainerSize {
  width: number;
  height: number;
}

export interface PixelPosition {
  x: number;
  y: number;
}

export interface NormalizedPosition {
  x: number;
  y: number;
}

function clampNormalizedValue(value: number): number {
  return Math.min(1, Math.max(-1, value));
}

/**
 * The maximum number of pixels the image can be panned away from
 * center along one axis, for a given scale and container size along
 * that axis. At scale === 1 an object-cover image already fully covers
 * the container, so there is no room to pan and this is 0.
 */
export function getMaxOffset(scale: number, containerSize: number): number {
  const maxOffset = (Math.max(scale, MIN_SCALE) - 1) * (containerSize / 2);
  return maxOffset > 0 ? maxOffset : 0;
}

/**
 * Clamp a raw pixel position so the (scaled) image can never be panned
 * far enough to reveal empty space inside its container.
 */
export function clampPixelPosition(
  position: PixelPosition,
  scale: number,
  container: ContainerSize,
): PixelPosition {
  const maxOffsetX = getMaxOffset(scale, container.width);
  const maxOffsetY = getMaxOffset(scale, container.height);

  return {
    x: maxOffsetX > 0 ? Math.min(maxOffsetX, Math.max(-maxOffsetX, position.x)) : 0,
    y: maxOffsetY > 0 ? Math.min(maxOffsetY, Math.max(-maxOffsetY, position.y)) : 0,
  };
}

/**
 * Convert a raw pixel offset (captured in a container of the given
 * size) into a normalized, container-independent position. This is
 * what gets persisted.
 */
export function pixelsToNormalized(
  position: PixelPosition,
  scale: number,
  container: ContainerSize,
): NormalizedPosition {
  const maxOffsetX = getMaxOffset(scale, container.width);
  const maxOffsetY = getMaxOffset(scale, container.height);

  return {
    x: clampNormalizedValue(maxOffsetX > 0 ? position.x / maxOffsetX : 0),
    y: clampNormalizedValue(maxOffsetY > 0 ? position.y / maxOffsetY : 0),
  };
}

/**
 * Convert a persisted normalized position back into raw pixels for a
 * specific container. This is what every renderer (editor preview,
 * owner card, customer card) calls with its own live container size.
 */
export function normalizedToPixels(
  normalized: NormalizedPosition,
  scale: number,
  container: ContainerSize,
): PixelPosition {
  const maxOffsetX = getMaxOffset(scale, container.width);
  const maxOffsetY = getMaxOffset(scale, container.height);

  return {
    x: clampNormalizedValue(normalized.x) * maxOffsetX,
    y: clampNormalizedValue(normalized.y) * maxOffsetY,
  };
}

/**
 * Build the actual CSS transform string for a given normalized
 * position, scale, and container size. Every consumer should call this
 * instead of hand-writing `translate(...) scale(...)`, so there is
 * exactly one place that decides how those pieces combine.
 */
export function getImageTransform(
  normalized: NormalizedPosition,
  scale: number,
  container: ContainerSize,
): string {

  const px = normalizedToPixels(
    normalized,
    scale,
    container,
  );

  console.log(
    "IMAGE FRAMING",
    "normalized=", normalized,
    "scale=", scale,
    "container=", container,
    "px=", px,
);

  return `translate(${px.x}px, ${px.y}px) scale(${scale})`;
}