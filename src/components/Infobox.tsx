import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";
import { HandlerDescriptor, InfoboxEventHandler, LatLng } from "../types";

interface OwnProps {
  location: LatLng;
  onClick?: InfoboxEventHandler;
  onInfoboxChanged?: InfoboxEventHandler;
  onMouseEnter?: InfoboxEventHandler;
  onMouseLeave?: InfoboxEventHandler;
  onMount?: () => void;
  onUnmount?: () => void;
}

const Infobox: React.FC<
  OwnProps & Omit<Microsoft.Maps.IInfoboxOptions, keyof OwnProps>
> = ({
  location: { latitude, longitude },
  onClick,
  onInfoboxChanged,
  onMouseEnter,
  onMouseLeave,
  onMount,
  onUnmount,
  ...options
}) => {
  const map = useContext(MapContext);

  useEffect(() => {
    const _loc = new window.Microsoft.Maps.Location(latitude, longitude);
    const infobox = new window.Microsoft.Maps.Infobox(_loc, options);

    const handlers = [
      { eventName: "click", handler: onClick },
      { eventName: "infoboxChanged", handler: onInfoboxChanged },
      { eventName: "mouseenter", handler: onMouseEnter },
      { eventName: "mouseleave", handler: onMouseLeave }
    ].filter(({ handler }) => !!handler) as HandlerDescriptor<
      InfoboxEventHandler
    >[];

    infobox.setMap(map);

    // ONLY AFTER .setMap()
    // Add handlers to pushpin
    handlers.forEach(({ eventName, handler }) => {
      window.Microsoft.Maps.Events.addHandler(infobox, eventName, (e: any) => {
        handler(e, map);
      });
    });

    onMount && setTimeout(onMount, 1000);
    return () => {
      onUnmount && onUnmount();
    };
  }, []);

  return null;
};

export default React.memo(Infobox);
