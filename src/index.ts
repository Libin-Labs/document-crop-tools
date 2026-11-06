export interface PageBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PageGeometry {
  media: PageBox;
  crop: PageBox;
  rotation: 0 | 90 | 180 | 270;
}
export interface Point {
  x: number;
  y: number;
}
function valid(b: PageBox): void {
  if (
    ![b.x, b.y, b.width, b.height].every((n) => Number.isFinite(n) && Math.abs(n) <= 1e9) ||
    b.width <= 0 ||
    b.height <= 0
  )
    throw new RangeError('Invalid page box');
}
function check(page: PageGeometry): void {
  valid(page.media);
  valid(page.crop);
  if (![0, 90, 180, 270].includes(page.rotation)) throw new RangeError('Quarter-turn required');
  const m = page.media,
    c = page.crop;
  if (c.x < m.x || c.y < m.y || c.x + c.width > m.x + m.width || c.y + c.height > m.y + m.height)
    throw new RangeError('Crop outside media');
}
/** Maps top-left page coordinates into rotated crop coordinates (or inversely). */
export function mapPoint(page: PageGeometry, point: Point, inverse = false): Point {
  check(page);
  if (![point.x, point.y].every(Number.isFinite)) throw new RangeError('Invalid point');
  const c = page.crop,
    r = page.rotation;
  if (inverse) {
    const { x, y } = point;
    const p =
      r === 0
        ? { x, y }
        : r === 90
          ? { x: y, y: c.height - x }
          : r === 180
            ? { x: c.width - x, y: c.height - y }
            : { x: c.width - y, y: x };
    return { x: p.x + c.x, y: p.y + c.y };
  }
  const x = point.x - c.x,
    y = point.y - c.y;
  return r === 0
    ? { x, y }
    : r === 90
      ? { x: c.height - y, y: x }
      : r === 180
        ? { x: c.width - x, y: c.height - y }
        : { x: y, y: c.width - x };
}
export function mapBox(page: PageGeometry, input: PageBox, inverse = false): PageBox {
  valid(input);
  const points = [
    { x: input.x, y: input.y },
    { x: input.x + input.width, y: input.y },
    { x: input.x, y: input.y + input.height },
    { x: input.x + input.width, y: input.y + input.height },
  ].map((p) => mapPoint(page, p, inverse));
  const x = Math.min(...points.map((p) => p.x)),
    y = Math.min(...points.map((p) => p.y));
  return {
    x,
    y,
    width: Math.max(...points.map((p) => p.x)) - x,
    height: Math.max(...points.map((p) => p.y)) - y,
  };
}
/** Intersects a page-space selection with the existing crop; never enlarges it. */
export function cropPage(page: PageGeometry, selection: PageBox): PageGeometry {
  check(page);
  valid(selection);
  const c = page.crop;
  const x = Math.max(c.x, selection.x),
    y = Math.max(c.y, selection.y);
  const right = Math.min(c.x + c.width, selection.x + selection.width);
  const bottom = Math.min(c.y + c.height, selection.y + selection.height);
  if (right <= x || bottom <= y) throw new RangeError('Selection misses page');
  return {
    media: { ...page.media },
    crop: { x, y, width: right - x, height: bottom - y },
    rotation: page.rotation,
  };
}
