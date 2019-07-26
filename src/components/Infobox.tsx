import React, { useContext, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";

import { MapContext } from "../ReactBingMap";
import { HandlerDescriptor, InfoboxEventHandler, LatLng } from "../index";

interface OwnProps {
  location: LatLng;
  onClick?: InfoboxEventHandler;
  onInfoboxChanged?: InfoboxEventHandler;
  onMouseEnter?: InfoboxEventHandler;
  onMouseLeave?: InfoboxEventHandler;
  onMount?: (node?: HTMLElement) => void;
  onUnmount?: () => void;
  children?: React.ReactNode;
}

type InfoboxProps = Omit<
  Microsoft.Maps.IInfoboxOptions,
  keyof OwnProps | "htmlContent"
> &
  OwnProps;

const dummy = function(this: Event) {};

const Infobox: React.FC<InfoboxProps> = ({
  location: { latitude, longitude },
  onClick,
  onInfoboxChanged,
  onMouseEnter,
  onMouseLeave,
  onMount,
  onUnmount,
  children,
  ...options
}) => {
  const map = useContext(MapContext);
  const { current: id } = useRef(uuid());

  useEffect(() => {
    const _loc = new window.Microsoft.Maps.Location(latitude, longitude);
    const customContent =
      children || (!options.actions && !options.description);

    const infobox = new window.Microsoft.Maps.Infobox(_loc, {
      ...options,
      htmlContent: customContent ? `<div id="${id}"></div>` : undefined
    });

    const handlers = [
      { eventName: "click", handler: onClick },
      { eventName: "infoboxChanged", handler: onInfoboxChanged },
      { eventName: "mouseenter", handler: onMouseEnter },
      { eventName: "mouseleave", handler: onMouseLeave }
    ].filter(({ handler }) => !!handler) as HandlerDescriptor<
      InfoboxEventHandler
    >[];

    infobox.setMap(map);

    // Add handlers to pushpin ONLY AFTER .setMap()
    handlers.forEach(({ eventName, handler }) => {
      window.Microsoft.Maps.Events.addHandler(
        infobox,
        eventName,
        (e: Microsoft.Maps.IInfoboxEventArgs) => {
          handler(e, map);
        }
      );
    });

    map.awaitInit.then(() => {
      let node: HTMLElement | null;

      if (customContent) {
        node = document.getElementById(id);
        const ci = node && node.closest(".InfoboxCustom");
        const wrapper = ci && ci.parentElement;

        node && ReactDOM.render(<>{children}</>, node);

        if (wrapper) {
          Object.entries(wrapper).forEach(([key, value]) => {
            if (key.match("jsEvent")) {
              const event = key.replace(/jsEvent([a-zA-Z]+)[^w]+/, "$1");

              // wrapper = div z-index: 1002 - destructive handlers
              wrapper.removeEventListener(event, value);
              wrapper.addEventListener(
                event,
                (e: Event & { _IGNORE?: boolean }) => {
                  e.stopPropagation = dummy;
                  value(e);
                  delete e.stopPropagation;
                  e._IGNORE = true;
                }
              );
            }
          });
        }
      }

      onMount && onMount(node! || undefined);
    });

    return () => {
      onUnmount && onUnmount();
      infobox.setMap((null as unknown) as Microsoft.Maps.Map);
    };
  }, []);

  return null;
};

export default React.memo(Infobox);
export { InfoboxProps };
