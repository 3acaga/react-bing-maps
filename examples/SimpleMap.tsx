import React from "react";
import ReactBingMap, { Pushpin, Polyline } from "@3acaga/react-bing-maps";

const BingMap: React.FC = () => {
  const start = {
    latitude: 0,
    longitude: 0
  };

  const end = {
    latitude: 50,
    longitude: 50
  };

  return (
    <div style={{ height: 600 }}>
      <ReactBingMap apiKey="YOUR_API_KEY_HERE">
        <Pushpin location={start} />

        <Polyline path={[start, end]} />

        <Pushpin location={end} />
      </ReactBingMap>
    </div>
  );
};

export default BingMap;
