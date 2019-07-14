import React, { useEffect, useMemo, useState } from "react";
import ViewController from "./ViewController";
import { LatLng } from "./index";

interface OwnProps {
  apiKey: string;
  onMapInit?: (map: Microsoft.Maps.Map) => void;
  center?: LatLng;
  onClick?: React.MouseEventHandler;
  onViewChange?: (e: unknown, map: Microsoft.Maps.Map) => void;
  children?: React.ReactNode;
}

interface MapContext extends Microsoft.Maps.Map {
  awaitInit: Promise<unknown>;
}

export const MapContext = React.createContext<MapContext>(
  (null as unknown) as MapContext
);

type ReactBingMapProps = Omit<Microsoft.Maps.IMapLoadOptions, keyof OwnProps> &
  OwnProps;

const ReactBingMap: React.FC<ReactBingMapProps> = ({
  apiKey,
  onMapInit,
  center: { latitude, longitude } = { latitude: 31, longitude: 52 },
  onClick,
  onViewChange,
  children,
  ...props
}) => {
  const [map, setMap] = useState<MapContext>((null as unknown) as MapContext);

  const centerLoc = useMemo(
    () => map && new window.Microsoft.Maps.Location(latitude, longitude),
    [map, latitude, longitude]
  );

  useEffect(() => {
    const options = {
      ...props,
      center: centerLoc
    };

    const init = function() {
      const map = new window.Microsoft.Maps.Map(
        "#react-bing-maps",
        options
      ) as MapContext;

      onClick && window.Microsoft.Maps.Events.addHandler(map, "click", onClick);
      onViewChange &&
        window.Microsoft.Maps.Events.addThrottledHandler(
          map,
          "viewchange",
          (e: unknown) => {
            onViewChange(e, map);
          },
          150
        );

      map.awaitInit = new Promise((resolve) => {
        ////////////////////////////////////////////////////////////////////////////////////////////
        (map as any)._mapLoaded._handlers.push(() => {
          setTimeout(() => {
            onMapInit && onMapInit(map);
            resolve();
          }, 0);
        });
        ////////////////////////////////////////////////////////////////////////////////////////////
      });

      setMap(map as MapContext);
    };

    if (!window.Microsoft) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.defer = true;
      script.src = `https://www.bing.com/api/maps/mapcontrol?callback=__initBingmaps__&key=${apiKey}`;
      window.__initBingmaps__ = init;

      document.body.appendChild(script);
    } else {
      init();
    }
  }, []);

  return (
    <MapContext.Provider value={map}>
      <div id="react-bing-maps">
        {map && (
          <ViewController {...props} center={centerLoc}>
            {children}
          </ViewController>
        )}
      </div>
    </MapContext.Provider>
  );
};

export default React.memo(ReactBingMap);
export { ReactBingMapProps };
