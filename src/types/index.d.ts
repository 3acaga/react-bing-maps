import "bingmaps/types/MicrosoftMaps/Microsoft.Maps.All";

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface EntityDescriptor {
  type: string;
  length: number;
  level: number;
  startAnimation: (duration: number) => Promise<unknown>;
}

type PushpinEventHandler = (
  e:
    | Microsoft.Maps.IMouseEventArgs
    | Microsoft.Maps.IPrimitiveChangedEventArgs
    | undefined,
  map: Microsoft.Maps.Map
) => void;

type InfoboxEventHandler = (
  e: Microsoft.Maps.IInfoboxEventArgs,
  map: Microsoft.Maps.Map
) => void;

type MapEventHandler = (
  e:
    | Microsoft.Maps.IMouseEventArgs
    | Microsoft.Maps.IPrimitiveChangedEventArgs
    | Microsoft.Maps.IMapTypeChangeEventArgs
    | undefined,
  map: Microsoft.Maps.Map
) => void;

interface HandlerDescriptor<T = any> {
  eventName: string;
  handler: T;
}

declare global {
  interface Window {
    Microsoft: typeof Microsoft;
    __initBingmaps__: () => void;
  }
}
