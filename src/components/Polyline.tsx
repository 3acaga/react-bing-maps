import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";
import { LayerContext } from "./Layer";
import { generateCurvePoints } from "../helpers/generateCurvePoints";
import { EntityDescriptor, LatLng } from "../index";

interface OwnProps {
  path: LatLng[];

  withMovingMarker?: boolean;
  level?: number;
  movingMarkerConfig?: Microsoft.Maps.IPushpinOptions;
}

type PolylineProps = OwnProps & Microsoft.Maps.IPolylineOptions;
const Polyline: React.FC<PolylineProps> = ({
  level = 0,
  path,
  withMovingMarker,
  movingMarkerConfig,
  ...options
}) => {
  const map = useContext(MapContext);
  const { layer, entities } = useContext(LayerContext);

  useEffect(() => {
    const points = generateCurvePoints(path);

    const { path: linePath, length: lineLength } = points;

    const polyline = new window.Microsoft.Maps.Polyline(linePath, options);
    let entityDescriptor: EntityDescriptor;

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
            return new Promise(async (resolve) => {
              // show marker
              movingMarker.setLocation(linePath[0]);
              movingMarker.setOptions({ visible: true });
              layer.add(movingMarker);

              // move marker
              for (let i = 0; i < Math.ceil(linePath.length); i += speed) {
                await new Promise((resolve) => {
                  setTimeout(
                    requestAnimationFrame,
                    (speed * duration) / Math.floor(linePath.length),
                    () => {
                      movingMarker.setLocation(linePath[Math.floor(i)]);
                      resolve();
                    }
                  );
                });
              }

              // hide marker
              setTimeout(() => {
                movingMarker.setOptions({
                  visible: false
                });
                layer.remove(movingMarker);
                resolve();
              }, 500);
            });
          }
        };

        entities.push(entityDescriptor);
      }
    } else {
      map.entities.push(polyline);
    }

    return () => {
      if (layer) {
        layer.remove(polyline);
        if (withMovingMarker) {
          entities.splice(entities.findIndex((e) => entityDescriptor === e), 1);
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
