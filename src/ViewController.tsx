import React, { useContext, useEffect, useRef } from "react";
import { MapContext } from "./ReactBingMap";

const clearQ = (q: ReturnType<typeof setTimeout>[]) => {
  q.forEach(clearTimeout);
  q.splice(0, q.length);
};

const ViewController: React.FC<
  Microsoft.Maps.IMapLoadOptions & { children: React.ReactNode }
> = ({
  center = new window.Microsoft.Maps.Location(0, 0),
  zoom = 2,
  children
}) => {
  const map = useContext(MapContext);
  const { current: animationQueue } = useRef<ReturnType<typeof setTimeout>[]>(
    []
  );
  const prevZoomRef = useRef(zoom);

  useEffect(() => {
    const prevZoom = prevZoomRef.current;
    prevZoomRef.current = zoom;

    const { latitude: latOld, longitude: lngOld } = map.getCenter();
    const { latitude: latNew, longitude: lngNew } = center;

    if (
      Math.abs(zoom - prevZoom) < 1 - 1e-6 &&
      (latNew === latOld && lngNew === lngOld)
    ) {
      return;
    }

    clearQ(animationQueue);

    if (
      (Math.abs(zoom - prevZoom) >= 1e-6 &&
        (latNew === latOld && lngNew === lngOld)) ||
      Math.abs(zoom - prevZoom) < 1e-6
    ) {
      map.setView({
        zoom: zoom,
        center: center,
        // @ts-ignore-next-line
        animate: true
      });

      return;
    }

    const iterCount =
      Math.abs(prevZoom - zoom) >= 1
        ? Math.floor(Math.abs(prevZoom - zoom))
        : 1;

    const dt = 100; // ms

    const dZoom = (zoom - prevZoom) / iterCount;
    const dLat = (latNew - latOld) / iterCount;
    const dLng = (lngNew - lngOld) / iterCount;

    for (let i = 1; i <= iterCount; i++) {
      const timeout = setTimeout(() => {
        map.setView({
          center: new window.Microsoft.Maps.Location(
            latOld + dLat * i,
            lngOld + dLng * i
          ),
          zoom: prevZoom + dZoom * i,
          // @ts-ignore-next-line
          animate: true
        });

        animationQueue.splice(
          animationQueue.findIndex((to) => to === timeout),
          1
        );
      }, dt * (i - 1));

      animationQueue.push(timeout);
    }

    const vcc = window.Microsoft.Maps.Events.addHandler(
      map,
      "viewchange",
      (e: any) => {
        if (e.cause !== 0) {
          clearQ(animationQueue);
          window.Microsoft.Maps.Events.removeHandler(vcc);
        }
      }
    );

    setTimeout(() => {
      window.Microsoft.Maps.Events.removeHandler(vcc);
    }, dt * iterCount);
  }, [zoom, center.latitude, center.longitude]);

  return <>{children}</>;
};

export default React.memo(ViewController);
