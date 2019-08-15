import React, { useEffect, useMemo, useRef, useState } from "react";

import ViewController from "./ViewController";
import addHandlers from "./helpers/addHandlers";
import { LatLng } from "./index";

interface OwnProps {
  apiKey: string;
  center?: LatLng;

  onMapInit?: (map: Microsoft.Maps.Map) => void;
  onViewChangeStart?: (e: unknown, map: Microsoft.Maps.Map) => void;
  onViewChange?: (e: unknown, map: Microsoft.Maps.Map) => void;
  onViewChangeEnd?: (e: unknown, map: Microsoft.Maps.Map) => void;
  onClick?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onDoubleClick?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onRightClick?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onMouseDown?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onMouseOut?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onMouseOver?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onMouseUp?: (e: React.MouseEvent, map: Microsoft.Maps.Map) => void;
  onWheel?: (e: React.WheelEvent, map: Microsoft.Maps.Map) => void;
  onMapTypeChanged?: (e: unknown, map: Microsoft.Maps.Map) => void;
  onViewChangeStartThrottleMs?: number;
  onViewChangeThrottleMs?: number;
  onViewChangeEndThrottleMs?: number;
  onClickThrottleMs?: number;
  onDoubleClickThrottleMs?: number;
  onRightClickThrottleMs?: number;
  onMouseDownThrottleMs?: number;
  onMouseOutThrottleMs?: number;
  onMouseOverThrottleMs?: number;
  onMouseUpThrottleMs?: number;
  onWheelThrottleMs?: number;
  onMapTypeChangedThrottleMs?: number;

  children?: React.ReactNode;
}

interface CustomMap extends Microsoft.Maps.Map {
  awaitInit: Promise<unknown>;
}

const MapContext = React.createContext<CustomMap>(
  (undefined as unknown) as CustomMap
);

type ReactBingMapProps = Omit<Microsoft.Maps.IMapLoadOptions, keyof OwnProps> &
  OwnProps;

const ReactBingMap: React.FC<ReactBingMapProps> = ({
  apiKey,
  onMapInit,
  center: { latitude, longitude } = { latitude: 31, longitude: 52 },
  onViewChangeStart,
  onViewChange,
  onViewChangeEnd,
  onClick,
  onDoubleClick,
  onRightClick,
  onMouseDown,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onWheel,
  onMapTypeChanged,
  children,
  onViewChangeStartThrottleMs,
  onViewChangeThrottleMs,
  onViewChangeEndThrottleMs,
  onClickThrottleMs,
  onDoubleClickThrottleMs,
  onRightClickThrottleMs,
  onMouseDownThrottleMs,
  onMouseOutThrottleMs,
  onMouseOverThrottleMs,
  onMouseUpThrottleMs,
  onWheelThrottleMs,
  onMapTypeChangedThrottleMs,
  ...props
}) => {
  const [map, setMap] = useState<CustomMap | undefined>(undefined);
  const rootElement = useRef<HTMLDivElement>(null);

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
        rootElement.current as HTMLDivElement,
        options
      ) as CustomMap;

      addHandlers({
        target: map,
        map,
        handlers: [
          {
            eventName: "viewchangestart",
            handler: onViewChangeStart,
            throttleMs: onViewChangeStartThrottleMs
          },
          {
            eventName: "viewchange",
            handler: onViewChange,
            throttleMs: onViewChangeThrottleMs
          },
          {
            eventName: "viewchangeend",
            handler: onViewChangeEnd,
            throttleMs: onViewChangeEndThrottleMs
          },
          {
            eventName: "click",
            handler: onClick,
            throttleMs: onClickThrottleMs
          },
          {
            eventName: "dblclick",
            handler: onDoubleClick,
            throttleMs: onDoubleClickThrottleMs
          },
          {
            eventName: "rightclick",
            handler: onRightClick,
            throttleMs: onRightClickThrottleMs
          },
          {
            eventName: "mousedown",
            handler: onMouseDown,
            throttleMs: onMouseDownThrottleMs
          },
          {
            eventName: "mouseout",
            handler: onMouseOut,
            throttleMs: onMouseOutThrottleMs
          },
          {
            eventName: "mouseover",
            handler: onMouseOver,
            throttleMs: onMouseOverThrottleMs
          },
          {
            eventName: "mouseup",
            handler: onMouseUp,
            throttleMs: onMouseUpThrottleMs
          },
          {
            eventName: "mousewheel",
            handler: onWheel,
            throttleMs: onWheelThrottleMs
          },
          {
            eventName: "maptypechanged",
            handler: onMapTypeChanged,
            throttleMs: onMapTypeChangedThrottleMs
          }
        ]
      });

      map.awaitInit = new Promise((resolve) => {
        ////////////////////////////////////////////////////////////////////////////////////////////
        (map as any)._mapLoaded._handlers.push(() => {
          const mapDiv = rootElement.current!.querySelector(".MicrosoftMap");

          if (mapDiv) {
            Object.entries(mapDiv).forEach(([key, value]) => {
              if (key.startsWith("jsEvent")) {
                const event = key.replace(/jsEvent([a-zA-Z]+)[^w]+/, "$1");

                mapDiv.removeEventListener(event, value);
                mapDiv.addEventListener(
                  event,
                  (e: Event & { _IGNORE?: boolean }) => {
                    if (!e._IGNORE) {
                      value(e);
                    }
                  }
                );
              }
            });

            // when everything ready
            delete window.__initBingmaps__;
            setMap(map);
            resolve(map);
            onMapInit && onMapInit(map);
          }
        });
        ////////////////////////////////////////////////////////////////////////////////////////////
      });
    };

    if (!window.Microsoft) {
      if (!window.__initBingmaps__) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.defer = true;
        script.src = `https://www.bing.com/api/maps/mapcontrol?callback=__initBingmaps__&key=${apiKey}`;
        window.__initBingmaps__ = init;

        document.body.appendChild(script);
      } else {
        window.__initBingmaps__ = init;
      }
    } else {
      init();
    }
  }, []);

  return (
    <div id="react-bing-maps" ref={rootElement}>
      {map && (
        <MapContext.Provider value={map}>
          <ViewController {...props} center={centerLoc}>
            {children}
          </ViewController>
        </MapContext.Provider>
      )}
    </div>
  );
};

export { MapContext };

export default React.memo(ReactBingMap);
export { ReactBingMapProps };
