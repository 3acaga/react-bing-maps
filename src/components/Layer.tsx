import React, { useContext, useEffect, useMemo } from "react";

import { MapContext } from "../ReactBingMap";
import MarkerPathAnimationManager from "../helpers/MarkerPathAnimationManager";
import { EntityDescriptor } from "../types";

interface OwnProps {
  id?: string;
  animationDuration?: number;
  children: React.ReactNode;
}

interface LayerContextType {
  layer: Microsoft.Maps.Layer;
  entities: EntityDescriptor[];

  currentAnimatingLevel?: number;
}

export const LayerContext = React.createContext<LayerContextType>({
  layer: (null as unknown) as Microsoft.Maps.Layer,
  entities: []
});

const Layer: React.FC<OwnProps> = ({ id, animationDuration = 0, children }) => {
  const map = useContext(MapContext);
  const context: LayerContextType = useMemo(
    () => ({
      layer: new window.Microsoft.Maps.Layer(id),
      entities: []
    }),
    [id]
  );

  useEffect(() => {
    const { layer, entities } = context;
    let PAM: MarkerPathAnimationManager;

    map.layers.insert(layer);
    layer.setVisible(true);

    if (entities.length) {
      PAM = new MarkerPathAnimationManager(entities, animationDuration);
      PAM.start();
    }

    return () => {
      if (entities.length) {
        PAM.stop();
      }
    };
  }, []);

  return (
    <LayerContext.Provider value={context}>{children}</LayerContext.Provider>
  );
};

export default React.memo(Layer);
