import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";
import { LayerContext } from "./Layer";
import { generatePathPoints } from "../helpers/generatePathPoints";
import { EntityDescriptor, LatLng } from "../index";

interface OwnProps {
  path: LatLng[];
  pathPointsCount?: number;

  withMovingMarker?: boolean;
  curved?: boolean;
  level?: number;
  movingMarkerConfig?: Microsoft.Maps.IPushpinOptions;
}

type PolylineProps = Omit<Microsoft.Maps.IPolylineOptions, keyof OwnProps> &
  OwnProps;
const Polyline: React.FC<PolylineProps> = ({
  curved = false,
  level = 0,
  path,
  pathPointsCount,
  withMovingMarker,
  movingMarkerConfig,
  ...options
}) => {
  const map = useContext(MapContext);
  const { layer, entities } = useContext(LayerContext);

  useEffect(() => {
    // TODO use spatial math cardinal curve
    // https://www.bing.com/api/maps/sdkrelease/mapcontrol/isdk/getcardinalspline#TS
    const points = generatePathPoints(path, curved, pathPointsCount);

    const { path: linePath, length: lineLength } = points;

    const polyline = new window.Microsoft.Maps.Polyline(linePath, options);
    let entityDescriptor: EntityDescriptor;
    let disposeMovingMarker: () => void;

    // Add the pushpin to the map
    if (layer) {
      layer.add(polyline);

      if (withMovingMarker) {
        const movingMarker = new window.Microsoft.Maps.Pushpin(linePath[0], {
          ...movingMarkerConfig,
          visible: false
        });
        // @ts-ignore
        movingMarker.zIndex = 1;
        const speed = linePath.length > 100 ? lineLength / 100 : 1;

        entityDescriptor = {
          level,
          type: "polyline",
          length: lineLength,
          startAnimation: (duration: number) => {
            const awaitEnd = new Promise(async (resolve, reject) => {
              // show marker
              movingMarker.setLocation(linePath[0]);
              movingMarker.setOptions({ visible: true });
              layer.add(movingMarker);

              // move marker
              for (let i = 0; i < Math.ceil(linePath.length); i += speed) {
                await new Promise((resolve, reject) => {
                  disposeMovingMarker = reject;

                  setTimeout(
                    requestAnimationFrame,
                    (speed * duration) / Math.floor(linePath.length),
                    () => {
                      movingMarker.setLocation(linePath[Math.floor(i)]);
                      resolve();
                    }
                  );
                }).catch((e) => reject(e));
              }

              await new Promise((_resolve, _reject) => {
                disposeMovingMarker = _reject;
                setTimeout(resolve, 500);
              }).catch((e) => reject(e));
            }).catch(() => {});

            awaitEnd.finally(() => {
              movingMarker.setOptions({
                visible: false
              });
              layer.remove(movingMarker);
            });

            return awaitEnd;
          }
        };

        entities.add(entityDescriptor);
      }
    } else {
      try {
        // wtf is happening on late mount?
        map.entities.push(polyline);
      } catch {}
    }

    return () => {
      if (layer) {
        layer.remove(polyline);
        if (withMovingMarker) {
          entities.remove(entityDescriptor);
          disposeMovingMarker && disposeMovingMarker();
        }
      } else {
        map.entities.remove(polyline);
      }
    };
  }, []);

  return null;
};

export default React.memo(Polyline);
export { PolylineProps };
