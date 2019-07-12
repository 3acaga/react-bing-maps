import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";

import { LayerContext } from "./Layer";
import {
  HandlerDescriptor,
  LatLng,
  Point,
  PushpinEventHandler
} from "../index";

interface OwnProps {
  location: LatLng;
  anchor?: Point;
  textOffset?: Point;
  onClick?: PushpinEventHandler;
  onMouseDown?: PushpinEventHandler;
  onMouseUp?: PushpinEventHandler;
  onMouseOver?: PushpinEventHandler;
  onMouseOut?: PushpinEventHandler;
}

type PushpinProps = Omit<Microsoft.Maps.IPushpinOptions, keyof OwnProps> &
  OwnProps;
const Pushpin: React.FC<PushpinProps> = ({
  location: { latitude, longitude },
  anchor,
  textOffset,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseOver,
  onMouseOut,
  ...options
}) => {
  const map = useContext(MapContext);
  const { layer } = useContext(LayerContext);

  useEffect(() => {
    const _loc = new window.Microsoft.Maps.Location(latitude, longitude);
    const pin = new window.Microsoft.Maps.Pushpin(_loc, {
      anchor: anchor
        ? new window.Microsoft.Maps.Point(anchor.x, anchor.y)
        : undefined,
      textOffset: textOffset
        ? new window.Microsoft.Maps.Point(textOffset.x, textOffset.y)
        : undefined,
      ...options
    });

    // Add handlers to pushpin
    const handlers = [
      { eventName: "click", handler: onClick },
      { eventName: "mousedown", handler: onMouseDown },
      { eventName: "mouseup", handler: onMouseUp },
      { eventName: "mouseover", handler: onMouseOver },
      { eventName: "mouseout", handler: onMouseOut }
    ].filter(({ handler }) => !!handler) as HandlerDescriptor<
      PushpinEventHandler
    >[];

    handlers.forEach(({ eventName, handler }) => {
      window.Microsoft.Maps.Events.addHandler(pin, eventName, (e) => {
        handler(e, map);
      });
    });

    // Add the pushpin to the layer/map
    if (layer) {
      layer.add(pin);
    } else {
      map.entities.push(pin);
    }
    return () => {
      // Remove the pushpin from the layer/map
      if (layer) {
        layer.remove(pin);
      } else {
        map.entities.remove(pin);
      }
    };
  }, []);

  return null;
};

export default React.memo(Pushpin);
export { PushpinProps };
