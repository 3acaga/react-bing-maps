import * as React from "react";
import { shallow, render, mount } from "enzyme";

import ReactBingMaps, { Pushpin, Polyline, Layer, Infobox } from "../src";

describe("react-bing-maps", () => {
  it("components are defined", () => {
    expect(ReactBingMaps).toBeDefined();
    expect(Pushpin).toBeDefined();
    expect(Polyline).toBeDefined();
    expect(Layer).toBeDefined();
    expect(Infobox).toBeDefined();
  });

  it("should initialize the map", async () => {
    let map: any;

    let promise = new Promise((resolve) => {
      map = mount(
        <ReactBingMaps
          apiKey=""
          onMapInit={() => {
            resolve();
          }}
        />
      );
    });

    await promise;

    expect(map.exists("div#react-bing-maps")).toBe(true);
    expect(map.exists("canvas#tileCanvasd")).toBe(true);
    expect(map.exists("canvas#labelCanvasId")).toBe(true);
    expect(map.exists("#not-react-bing-maps")).toBe(false);
  });
});
