# @lp-labs/document-crop-tools

Page crop intersection and invertible quarter-turn page coordinate geometry.

Original, independent MIT implementation. Zero runtime, peer or sibling dependencies. Requires Node.js 18+; strict TypeScript declarations support both ESM and CommonJS.

## Install

```sh
npm install @lp-labs/document-crop-tools
```

## Quickstart

```js
import { mapPoint, mapBox, cropPage } from '@lp-labs/document-crop-tools';
const page = {
  media: { x: 0, y: 0, width: 600, height: 800 },
  crop: { x: 10, y: 20, width: 200, height: 300 },
  rotation: 90,
};
const point = mapPoint(page, { x: 10, y: 20 });
const rect = mapBox(page, page.crop);
const cropped = cropPage(page, { x: 20, y: 30, width: 100, height: 100 });
if (point.x !== 300 || rect.width !== 300 || cropped.crop.x !== 20)
  throw new Error('Geometry mismatch');
```

## API and types

`mapPoint(page: PageGeometry, point: Point, inverse = false): Point` maps page-space to rotated crop-space, or the inverse. `mapBox(page, input: PageBox, inverse = false): PageBox` maps all four corners and returns their bounds. `cropPage(page, selection): PageGeometry` intersects the current crop with a page-space selection without mutating input. `PageGeometry` has media and crop boxes and rotation 0/90/180/270. Points outside crop may be mapped; only cropPage clips.

## Customize

Choose page media/crop and quarter-turn rotation explicitly. Use inverse to map a UI selection back to unrotated page coordinates before cropping.

## Errors and bounds

All coordinates use top-left axes and the same caller-supplied unit (usually points). 90 degrees maps (x,y) relative to crop to (height-y,x); dimensions swap. Geometry magnitudes at most 1e9; positive boxes, crop inside media. O(1) time and memory. No PDF parsing or image pixel operations.

Invalid runtime inputs throw TypeError/RangeError or the documented typed error. Adapter errors propagate unchanged unless specifically noted; asynchronous methods reject. Inputs must be ordinary typed data, not hostile proxies or accessors. No I/O happens at import time. All runtime exports are documented above and the example executes without optional packages.

## Development

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

Build emits dist/esm and dist/cjs with matching declarations. Tests use Node's test runner; consumer.mts and consumer.cts validate meaningful bare-package imports and expected type errors. Only TypeScript ^5.9.3 and Prettier ^3.6.2 are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
