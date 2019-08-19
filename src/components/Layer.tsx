import React, { useContext, useEffect, useMemo, useState } from "react";

import { MapContext } from "../ReactBingMap";
import MarkerPathAnimationManager from "../helpers/MarkerPathAnimationManager";
import {
  EntityDescriptor,
  EntityAggregator,
  LayerEventHandler
} from "../index";
import addHandlers from "../helpers/addHandlers";

interface OwnProps {
  id?: string;
  animationDuration?: number;

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

export interface LayerContextType {
  layer: Microsoft.Maps.Layer;

  entities: EntityAggregator;
  currentAnimatingLevel?: number;
}

export const LayerContext = React.createContext<LayerContextType>({
  layer: (null as unknown) as Microsoft.Maps.Layer,
  entities: ([] as unknown) as LayerContextType["entities"]
});

type LayerProps = OwnProps;

const Layer: React.FC<LayerProps> = ({
  id,
  animationDuration = 0,
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
  children
}) => {
  const map = useContext(MapContext);

  const [entities, setEntities] = useState<Readonly<EntityDescriptor[]>>([]);

  const context = useMemo<LayerContextType>(() => {
    let newEntities = ([
      ...entities
    ] as unknown) as LayerContextType["entities"];

    Object.defineProperty(newEntities, "add", {
      value: function(e: EntityDescriptor) {
        newEntities.push(e);
        setEntities(newEntities);
      },
      enumerable: false
    });

    Object.defineProperty(newEntities, "remove", {
      value: function(e: EntityDescriptor) {
        newEntities.splice(newEntities.findIndex((entity) => entity === e), 1);
        setEntities(newEntities);
      },
      enumerable: false
    });

    return {
      layer: new window.Microsoft.Maps.Layer(id),
      entities: newEntities
    };
  }, [entities]);

  useEffect(() => {
    const { layer } = context;

    addHandlers({
      target: layer,
      map,
      handlers: [
        { eventName: "click", handler: onClick, throttleMs: onClickThrottleMs },
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
          eventName: "rightclick",
          handler: onRightClick,
          throttleMs: onRightClickThrottleMs
        }
      ]
    });

    map.layers.insert(layer);
    layer.setVisible(true);
  }, []);

  useEffect(() => {
    let PAM: MarkerPathAnimationManager;

    if (entities.length) {
      PAM = new MarkerPathAnimationManager(entities, animationDuration);
      PAM.start();
    }

    return () => {
      if (PAM) {
        PAM.stop();
      }
    };
  }, [entities]);

  return (
    <LayerContext.Provider value={context}>{children}</LayerContext.Provider>
  );
};

export default React.memo(Layer);
export { LayerProps };
