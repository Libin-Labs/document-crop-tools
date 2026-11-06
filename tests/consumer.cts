import {
  mapPoint,
  mapBox,
  cropPage,
  type PageGeometry,
  type PageBox,
  type Point,
} from '@lp-labs/document-crop-tools';
const box: PageBox = { x: 0, y: 0, width: 100, height: 200 };
const page: PageGeometry = { media: box, crop: box, rotation: 90 };
const point: Point = mapPoint(page, { x: 0, y: 0 });
const cropped: PageGeometry = cropPage(page, mapBox(page, box, true));
// @ts-expect-error only quarter turns are supported
const invalid: PageGeometry = { media: box, crop: box, rotation: 45 };
void [point, cropped, invalid];
