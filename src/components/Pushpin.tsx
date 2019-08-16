import React, { useContext, useEffect } from "react";

import { MapContext } from "../ReactBingMap";
import addHandlers from "../helpers/addHandlers";

import { LayerContext } from "./Layer";
import { ClusterLayerContext } from "./ClusterLayer";
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
  const { layer } = useContext(LayerContext);
  const { layer: clusterLayer } = useContext(ClusterLayerContext);

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

    // Add the pushpin to the cluster/layer/map
    if (clusterLayer) {
      const currentPushpins = clusterLayer.getPushpins();
      currentPushpins.push(pin);
      clusterLayer.setPushpins(currentPushpins.slice(0));
    } else if (layer) {
      layer.add(pin);
    } else {
      map.entities.push(pin);
    }

    return () => {
      // Remove the pushpin from the cluster/layer/map
      if (clusterLayer) {
        const currentPushpins = clusterLayer.getPushpins();
        currentPushpins.splice(
          currentPushpins.findIndex((value) => value === pin),
          1
        );
        clusterLayer.setPushpins(currentPushpins);
      } else if (layer) {
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
