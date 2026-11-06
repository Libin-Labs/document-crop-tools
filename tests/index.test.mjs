import assert from 'node:assert/strict';
import test from 'node:test';
import { mapPoint, mapBox, cropPage } from '../dist/esm/index.js';

const box = { x: 10, y: 20, width: 100, height: 200 };
const page = (rotation) => ({
  media: { x: 0, y: 0, width: 600, height: 800 },
  crop: { ...box },
  rotation,
});
test('exact corner transforms for all rotations', () => {
  const expected = [
    [0, 0],
    [200, 0],
    [100, 200],
    [0, 100],
  ];
  [0, 90, 180, 270].forEach((r, i) =>
    assert.deepEqual(mapPoint(page(r), { x: 10, y: 20 }), { x: expected[i][0], y: expected[i][1] }),
  );
});
test('inverse roundtrip and box dimension swap', () => {
  for (const r of [0, 90, 180, 270]) {
    const p = { x: 45.5, y: 80.25 };
    assert.deepEqual(mapPoint(page(r), mapPoint(page(r), p), true), p);
    const mapped = mapBox(page(r), box);
    assert.deepEqual(mapBox(page(r), mapped, true), box);
    assert.equal(mapped.width, r % 180 ? 200 : 100);
  }
});
test('crop intersects actual page boxes and does not alias source', () => {
  const p = page(270),
    out = cropPage(p, { x: 0, y: 100, width: 80, height: 500 });
  assert.deepEqual(out.crop, { x: 10, y: 100, width: 70, height: 120 });
  out.media.width = 1;
  assert.equal(p.media.width, 600);
});
test('outside points map without implicit clipping', () => {
  assert.deepEqual(mapPoint(page(0), { x: 0, y: 0 }), { x: -10, y: -20 });
});
test('invalid rotation, crop, selection and point fail', () => {
  assert.throws(() => mapPoint(page(45), { x: 0, y: 0 }));
  assert.throws(() => mapPoint({ ...page(0), crop: { ...box, x: -1 } }, { x: 0, y: 0 }));
  assert.throws(() => mapPoint(page(0), { x: NaN, y: 0 }));
  assert.throws(() => cropPage(page(0), { x: 200, y: 200, width: 2, height: 2 }));
  assert.throws(() => mapBox(page(0), { ...box, width: -1 }));
});
