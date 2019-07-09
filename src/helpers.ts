const easeCubic = function(t: number, _in: boolean = false) {
  return _in ? t * t * t : --t * t * t + 1;
};

interface LatLng {
  latitude: number;
  longitude: number;
}

// Build Curve
interface BuildCurvePath {
  (params: {
    from: LatLng;
    to: LatLng;
    resolution?: number;
    below?: boolean;
  }): Microsoft.Maps.Location[];
}

export const buildCurvePath: BuildCurvePath = ({
  from: { latitude: lat1, longitude: lng1 },
  to: { latitude: lat2, longitude: lng2 },
  resolution = 0.01,
  below = true
}) => {
  let path = [];

  for (let it = 0; it <= 1; it += resolution) {
    let x: number;
    let y: number;

    if (below) {
      if (lat1 > lat2 && lng1 > lng2) {
        x = lat1 + (lat2 - lat1) * it;
        y = lng1 + (lng2 - lng1) * easeCubic(it, below);
      } else {
        x = lat1 + (lat2 - lat1) * easeCubic(it, below);
        y = lng1 + (lng2 - lng1) * it;
      }
    } else {
      if (lat1 > lat2 !== lng1 > lng2) {
        x = lat1 + (lat2 - lat1) * easeCubic(it, below);
        y = lng1 + (lng2 - lng1) * it;
      } else {
        x = lat1 + (lat2 - lat1) * it;
        y = lng1 + (lng2 - lng1) * easeCubic(it, below);
      }
    }

    path.push(new window.Microsoft.Maps.Location(x, y));
  }
  path.push(new window.Microsoft.Maps.Location(lat2, lng2));

  return path;
};
