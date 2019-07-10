import { create } from "d3-selection";
import { curveCatmullRom, line } from "d3-shape";
import { range } from "d3-array";

import { LatLng } from "../index";

export function generateCurvePoints(curvePoints: LatLng[]) {
  const _svg = create("svg");

  const lineGenerator = line<LatLng>()
    .x((d) => d.latitude)
    .y((d) => d.longitude)
    .curve(curveCatmullRom.alpha(0.75));

  const _path = _svg.append("path");

  if (curvePoints.length === 2) {
    const [
      { latitude: y1, longitude: x1 },
      { latitude: y2, longitude: x2 }
    ] = curvePoints;

    // some serious math shit
    const a = (y2 - y1) / (x2 - x1);
    const ax = Math.tan(Math.atan(a) + Math.PI / 2);
    const c = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

    const dx = c / (7 * (ax - a));
    const dy = ax * dx;

    const xl = x2 - x1;
    const yl = y2 - y1;

    curvePoints.splice(
      1,
      0,
      {
        latitude: y1 + yl / 3 + dy,
        longitude: x1 + xl / 3 + dx
      },
      {
        latitude: y1 + (2 * yl) / 3 + dy,
        longitude: x1 + (2 * xl) / 3 + dx
      }
    );
  }

  _path.attr("d", lineGenerator(curvePoints) as string);
  const svgLine = _path.node()!;
  const lineLength = svgLine.getTotalLength();
  const numPoints =
    Math.ceil(lineLength * 2.5) < 15 ? 15 : Math.ceil(lineLength * 2.5);

  let interval: number = lineLength / (numPoints - 1);

  if (numPoints === 1) {
    interval = 0;
  } else {
    interval = lineLength / (numPoints - 1);
  }

  return {
    path: range(numPoints).map(function(d) {
      const { x, y } = svgLine.getPointAtLength(d * interval);
      return new window.Microsoft.Maps.Location(x, y);
    }),
    length: lineLength
  };
}
