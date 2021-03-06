export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface EntityDescriptor {
  type: string;
  length: number;
  level: number;
  startAnimation: (duration: number) => Promise<unknown>;
}

export type EntityAggregator = EntityDescriptor[] & {
  add: (e: EntityDescriptor) => void;
  remove: (e: EntityDescriptor) => void;
};

export type LayerEventHandler = (
  e: Microsoft.Maps.IMouseEventArgs,
  map: Microsoft.Maps.Map
) => void;

export type PushpinEventHandler = (
  e:
    | Microsoft.Maps.IMouseEventArgs
    | Microsoft.Maps.IPrimitiveChangedEventArgs
    | undefined,
  map: Microsoft.Maps.Map
) => void;

export type InfoboxEventHandler = (
  e: Microsoft.Maps.IInfoboxEventArgs,
  map: Microsoft.Maps.Map
) => void;

export type MapEventHandler = (
  e:
    | Microsoft.Maps.IMouseEventArgs
    | Microsoft.Maps.IPrimitiveChangedEventArgs
    | Microsoft.Maps.IMapTypeChangeEventArgs
    | undefined,
  map: Microsoft.Maps.Map
) => void;

export interface HandlerDescriptor<
  T = (e: any, map: Microsoft.Maps.Map) => void
> {
  eventName: string;
  handler?: T;
  throttleMs?: number;
}

import ReactBingMap, { ReactBingMapProps } from "./ReactBingMap";
import Pushpin, { PushpinProps } from "./components/Pushpin";
import Polyline, { PolylineProps } from "./components/Polyline";
import Layer, { LayerProps } from "./components/Layer";
import ClusterLayer, { ClusterLayerProps } from "./components/ClusterLayer";
import Infobox, { InfoboxProps } from "./components/Infobox";

export {
  ReactBingMap,
  ReactBingMapProps,
  Pushpin,
  PushpinProps,
  Polyline,
  PolylineProps,
  Layer,
  LayerProps,
  ClusterLayer,
  ClusterLayerProps,
  Infobox,
  InfoboxProps
};

export default ReactBingMap;
