import React, { useContext, useEffect, useState } from "react";

import { MapContext } from "../ReactBingMap";
import { LayerEventHandler } from "../index";
import addHandlers from "../helpers/addHandlers";

export interface ClusterLayerContextType {
  layer: Microsoft.Maps.ClusterLayer;
}

interface OwnProps {
  onClick?: LayerEventHandler;
  onDoubleClick?: LayerEventHandler;
  onMouseDown?: LayerEventHandler;
  onMouseOut?: LayerEventHandler;
  onMouseOver?: LayerEventHandler;
  onMouseUp?: LayerEventHandler;
  onRightClick?: LayerEventHandler;

  onClickThrottleMs?: number;
  onDoubleClickThrottleMs?: number;
  onMouseDownThrottleMs?: number;
  onMouseOutThrottleMs?: number;
  onMouseOverThrottleMs?: number;
  onMouseUpThrottleMs?: number;
  onRightClickThrottleMs?: number;

  children: React.ReactNode;
}

type ClusterLayerProps = Omit<
  Microsoft.Maps.IClusterLayerOptions,
  keyof OwnProps
> &
  OwnProps;

export const ClusterLayerContext = React.createContext<ClusterLayerContextType>(
  {
    layer: (null as unknown) as Microsoft.Maps.ClusterLayer
  }
);

const ClusterLayer: React.FC<ClusterLayerProps> = ({
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  onRightClick,
  onClickThrottleMs,
  onDoubleClickThrottleMs,
  onMouseDownThrottleMs,
  onMouseOutThrottleMs,
  onMouseOverThrottleMs,
  onMouseUpThrottleMs,
  onRightClickThrottleMs,
  children,
  ...options
}) => {
  const map = useContext(MapContext);
  const [context, setContext] = useState<ClusterLayerContextType>(
    (null as unknown) as ClusterLayerContextType
  );

  if (context) {
    context.layer.setOptions(options);
  }

  useEffect(() => {
    let clusterLayer: Microsoft.Maps.ClusterLayer;

    const initializeClusterLayer = () => {
      //Create a ClusterLayer and add it to the map.
      clusterLayer = new Microsoft.Maps.ClusterLayer([], options);
      map.layers.insert(clusterLayer);

      addHandlers({
        target: clusterLayer,
        map,
        handlers: [
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
            eventName: "mousedown",
            handler: onMouseDown,
            throttleMs: onMouseDownThrottleMs
          },
          {
            eventName: "mouseover",
            handler: onMouseOver,
            throttleMs: onMouseOverThrottleMs
          },
          {
            eventName: "mouseout",
            handler: onMouseOut,
            throttleMs: onMouseOutThrottleMs
          },
          {
            eventName: "mouseup",
            handler: onMouseUp,
            throttleMs: onMouseUpThrottleMs
          },
          {
            eventName: "rightclick",
            handler: onRightClick,
            throttleMs: onRightClickThrottleMs
          }
        ]
      });

      setContext({
        layer: clusterLayer
      });
    };

    if (window.Microsoft.Maps.ClusterLayer) {
      initializeClusterLayer();
    } else {
      window.Microsoft.Maps.loadModule("Microsoft.Maps.Clustering", {
        callback: initializeClusterLayer
      });
    }

    return () => {
      clusterLayer.clear();
      map.layers.remove(clusterLayer);
    };
  }, []);

  return (
    <ClusterLayerContext.Provider value={context}>
      {context && children}
    </ClusterLayerContext.Provider>
  );
};

export default React.memo(ClusterLayer);
export { ClusterLayerProps };
