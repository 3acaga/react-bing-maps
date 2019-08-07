import React, { useContext, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import uuid from "uuid";

import { MapContext } from "../ReactBingMap";
import { InfoboxEventHandler, LatLng } from "../index";
import addHandlers from "../helpers/addHandlers";

interface OwnProps {
  location: LatLng;
  onClick?: InfoboxEventHandler;
  onInfoboxChanged?: InfoboxEventHandler;
  onMouseEnter?: InfoboxEventHandler;
  onMouseLeave?: InfoboxEventHandler;
  onMount?: (node?: HTMLElement) => void;
  onUnmount?: () => void;

  onClickThrottleMs?: number;
  onInfoboxChangedThrottleMs?: number;
  onMouseEnterThrottleMs?: number;
  onMouseLeaveThrottleMs?: number;
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
  onClickThrottleMs,
  onInfoboxChangedThrottleMs,
  onMouseEnterThrottleMs,
  onMouseLeaveThrottleMs,
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

    infobox.setMap(map);

    // Add handlers to pushpin ONLY AFTER .setMap()
    addHandlers({
      target: infobox,
      map,
      handlers: [
        { eventName: "click", handler: onClick, throttleMs: onClickThrottleMs },
        {
          eventName: "infoboxChanged",
          handler: onInfoboxChanged,
          throttleMs: onInfoboxChangedThrottleMs
        },
        {
          eventName: "mouseenter",
          handler: onMouseEnter,
          throttleMs: onMouseEnterThrottleMs
        },
        {
          eventName: "mouseleave",
          handler: onMouseLeave,
          throttleMs: onMouseLeaveThrottleMs
        }
      ]
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

      onMount && onMount(node!);
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
