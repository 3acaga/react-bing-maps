export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface EntityDescriptor {
  type: string;
  length: number;
  level: number;
  startAnimation: (duration: number) => Promise<unknown>;
}

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

export interface HandlerDescriptor<T = any> {
  eventName: string;
  handler: T;
}

import ReactBingMap from "./ReactBingMap";
import Pushpin from "./components/Pushpin";
import Polyline from "./components/Polyline";
import Layer from "./components/Layer";
import Infobox from "./components/Infobox";

export { ReactBingMap, Pushpin, Polyline, Layer, Infobox };
export default ReactBingMap;
