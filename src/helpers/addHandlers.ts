import { HandlerDescriptor } from "../index";

type EventTarget =
  | Microsoft.Maps.Map
  | Microsoft.Maps.Pushpin
  | Microsoft.Maps.Polyline
  | Microsoft.Maps.Infobox
  | Microsoft.Maps.Layer;

const addHandlers = ({
  target,
  map,
  handlers
}: {
  target: EventTarget;
  map: Microsoft.Maps.Map;
  handlers: HandlerDescriptor[];
}) => {
  // Add handlers to pushpin
  handlers
    .filter(({ handler }) => !!handler)
    .forEach(({ eventName, handler, throttleMs }) => {
      const _handler = (e: unknown) => {
        handler(e, map);
      };

      if (throttleMs) {
        window.Microsoft.Maps.Events.addThrottledHandler(
          target,
          eventName,
          _handler,
          throttleMs
        );
      } else {
        window.Microsoft.Maps.Events.addHandler(target, eventName, _handler);
      }
    });
};

export default addHandlers;
