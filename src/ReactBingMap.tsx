import React, { useEffect, useMemo, useState } from "react";
import ViewController from "./ViewController";

interface Point {
  latitude: number;
  longitude: number;
}

interface OwnProps {
  apiKey: string;
  onMapInit?: (map: Microsoft.Maps.Map) => void;
  center?: Point;
  onClick?: React.MouseEventHandler;
  onViewChange?: (e: any, map: Microsoft.Maps.Map) => void;
  children?: React.ReactNode;
}

export const MapContext = React.createContext<Microsoft.Maps.Map>(
  (null as unknown) as Microsoft.Maps.Map
);

const ReactBingMap: React.FC<
  Omit<Microsoft.Maps.IMapLoadOptions, keyof OwnProps> & OwnProps
> = ({
  apiKey,
  onMapInit,
  center: { latitude, longitude } = { latitude: 31, longitude: 52 },
  onClick,
  onViewChange,
  children,
  ...props
}) => {
  const [map, setMap] = useState<Microsoft.Maps.Map>(
    (null as unknown) as Microsoft.Maps.Map
  );

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
      const map = new window.Microsoft.Maps.Map("#react-bing-maps", options);

      onClick && window.Microsoft.Maps.Events.addHandler(map, "click", onClick);
      onViewChange &&
        window.Microsoft.Maps.Events.addThrottledHandler(
          map,
          "viewchange",
          (e: any) => {
            onViewChange(e, map);
          },
          150
        );
      setMap(map);

      ////////////////////////////////////////////////////////////////////////////////////////////
      //////////////////////////   removes map rotation on mobile   //////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////
      (map as any)._mapLoaded._handlers.push(() => {
        ////////////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////////////////////////////////

        onMapInit && onMapInit(map);
      });
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
