export const createCustomMarkerIcon = (
  label: string,
  color: string,
  zIndex: number,
  labelSize: number
) => {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect x="0" y="0" width="100" height="30" fill="${color}" />
        <text x="50" y="20" font-size="${labelSize}" text-anchor="middle" fill="white">${label}</text>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(labelSize * 5, labelSize * 5),
    anchor: new google.maps.Point(20, 20),
    zIndex: zIndex,
  };
};

export const drawCommunicationLines = (
  fromCallsign: string,
  toCallsigns: string[],
  color: string,
  map: google.maps.Map | null,
  showingHeardBy: boolean,
  locations: any[],
  operatorInfo: any
) => {
  if (!map) return [];

  return toCallsigns.map((toCallsign) => {
    const fromStation =
      locations.find((loc) => loc.callsign === fromCallsign) ||
      (operatorInfo.callsign === fromCallsign ? operatorInfo : null);
    const toStation =
      locations.find((loc) => loc.callsign === toCallsign) ||
      (operatorInfo.callsign === toCallsign ? operatorInfo : null);

    if (!fromStation || !toStation) return null;

    const from = showingHeardBy ? toStation : fromStation;
    const to = showingHeardBy ? fromStation : toStation;

    const dashedLineSymbol = {
      path: "M 0,-1 0,1",
      strokeOpacity: 1,
      scale: 4,
    };

    if (showingHeardBy) {
      return new google.maps.Polyline({
        path: [
          {
            lat: from.lat || from.coordinates.lat,
            lng: from.lng || from.coordinates.lng,
          },
          {
            lat: to.lat || to.coordinates.lat,
            lng: to.lng || to.coordinates.lng,
          },
        ],
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0,
        strokeWeight: 2,
        map: map,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 1.5,
            },
            offset: "0%",
          },
          {
            icon: dashedLineSymbol,
            offset: "100%",
            repeat: "20px",
          },
        ],
      });
    }

    return new google.maps.Polyline({
      path: [
        {
          lat: from.lat || from.coordinates.lat,
          lng: from.lng || from.coordinates.lng,
        },
        {
          lat: to.lat || to.coordinates.lat,
          lng: to.lng || to.coordinates.lng,
        },
      ],
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 1.5,
          },
          offset: "100%",
        },
      ],
    });
  });
};
