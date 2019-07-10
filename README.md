## Another one react binding for bing maps...

## Installation

```shell
npm install --save @3acaga/react-bing-maps
```

## Simple example

### Code:
```javascript
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
    <div>
      <ReactBingMap apiKey="YOUR_API_KEY_HERE">
        <Pushpin location={start} />

        <Polyline path={[start, end]} />

        <Pushpin location={end} />
      </ReactBingMap>
    </div>
  );
};

export default BingMap;
```
### Result:
![screenshot](/examples/SimpleMap.png?raw=true "Simple example")

### [Demo sandbox](https://codesandbox.io/s/happy-satoshi-jb4m4)



## License
 [MIT](/LICENSE)
