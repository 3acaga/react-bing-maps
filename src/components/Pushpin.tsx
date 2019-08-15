import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";
import addHandlers from "../helpers/addHandlers";

import { LayerContext, SimpleLayerContextType } from "./Layer";
import { ClusterLayerContextType } from "./ClusterLayer";
import { LatLng, Point, PushpinEventHandler } from "../index";

interface OwnProps {
  location: LatLng;
  anchor?: Point;
  textOffset?: Point;

  onClick?: PushpinEventHandler;
  onDoubleClick?: PushpinEventHandler;
  onDrag?: PushpinEventHandler;
  onDragEnd?: PushpinEventHandler;
  onDragStart?: PushpinEventHandler;
  onMouseDown?: PushpinEventHandler;
  onMouseOut?: PushpinEventHandler;
  onMouseOver?: PushpinEventHandler;
  onMouseUp?: PushpinEventHandler;

  onClickThrottleMs?: number;
  onDoubleClickThrottleMs?: number;
  onDragThrottleMs?: number;
  onDragEndThrottleMs?: number;
  onDragStartThrottleMs?: number;
  onMouseDownThrottleMs?: number;
  onMouseOutThrottleMs?: number;
  onMouseOverThrottleMs?: number;
  onMouseUpThrottleMs?: number;
}

type PushpinProps = Omit<Microsoft.Maps.IPushpinOptions, keyof OwnProps> &
  OwnProps;
const Pushpin: React.FC<PushpinProps> = ({
  location: { latitude, longitude },
  anchor,
  textOffset,
  onClick,
  onDoubleClick,
  onDrag,
  onDragEnd,
  onDragStart,
  onMouseDown,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onClickThrottleMs,
  onDoubleClickThrottleMs,
  onDragThrottleMs,
  onDragEndThrottleMs,
  onDragStartThrottleMs,
  onMouseDownThrottleMs,
  onMouseOutThrottleMs,
  onMouseOverThrottleMs,
  onMouseUpThrottleMs,
  ...options
}) => {
  const map = useContext(MapContext);
  const { layer, type } = useContext(LayerContext);

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

    addHandlers({
      target: pin,
      map,
      handlers: [
        { eventName: "click", handler: onClick, throttleMs: onClickThrottleMs },
        {
          eventName: "dblclick",
          handler: onDoubleClick,
          throttleMs: onDoubleClickThrottleMs
        },
        {
          eventName: "drag",
          handler: onDrag,
          throttleMs: onDragThrottleMs
        },
        {
          eventName: "dragend",
          handler: onDragEnd,
          throttleMs: onDragEndThrottleMs
        },
        {
          eventName: "dragstart",
          handler: onDragStart,
          throttleMs: onDragStartThrottleMs
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
        }
      ]
    });

    // Add the pushpin to the layer/cluster/map
    if (layer) {
      switch (type) {
        case "Layer":
          (layer as SimpleLayerContextType["layer"]).add(pin);
          break;
        case "ClusterLayer":
          //
          const cl = layer as ClusterLayerContextType["layer"];
          const currentPushpins = cl.getPushpins();
          currentPushpins.push(pin);
          cl.setPushpins(currentPushpins.slice(0));
          break;
      }
    } else {
      map.entities.push(pin);
    }

    return () => {
      // Remove the pushpin from the layer/cluster/map
      if (layer) {
        switch (type) {
          case "Layer":
            (layer as SimpleLayerContextType["layer"]).remove(pin);
            break;
          case "ClusterLayer":
            const cl = layer as ClusterLayerContextType["layer"];

            const currentPushpins = cl.getPushpins();
            currentPushpins.splice(
              currentPushpins.findIndex((value) => value === pin),
              1
            );
            cl.setPushpins(currentPushpins);
            break;
        }
      } else {
        map.entities.remove(pin);
      }
    };
  }, []);

  return null;
};

export default React.memo(Pushpin);
export { PushpinProps };
