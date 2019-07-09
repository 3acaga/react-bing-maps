// TypeScript Version: 3.5.3

import React from "react";
import { LatLng, PushpinEventHandler } from "../src/types";

export type PushpinProps = {
  location: LatLng;
  onClick?: PushpinEventHandler;
  onMouseDown?: PushpinEventHandler;
  onMouseUp?: PushpinEventHandler;
  onMouseOver?: PushpinEventHandler;
  onMouseOut?: PushpinEventHandler;
} & Microsoft.Maps.IPushpinOptions;

export class Pushpin extends React.FC<React.FC<PushpinProps>> {}
