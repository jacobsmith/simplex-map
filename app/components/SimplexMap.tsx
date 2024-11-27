import { GoogleMap, Marker } from "@react-google-maps/api";
import { mapContainerStyle } from "../constants/mapConfig";
import { createCustomMarkerIcon } from "../utils/mapUtils";
import { OperatorInfo } from "../types";

interface SimplexMapProps {
  center: google.maps.LatLngLiteral;
  operatorInfo: OperatorInfo;
  locations: any[];
  selectedStation: string | null;
  showingHeardBy: boolean;
  labelSize: number;
  onMarkerClick: (callsign: string) => void;
  onLoad: (map: google.maps.Map) => void;
  onUnmount: () => void;
}

const SimplexMap: React.FC<SimplexMapProps> = ({
  center,
  operatorInfo,
  locations,
  selectedStation,
  showingHeardBy,
  labelSize,
  onMarkerClick,
  onLoad,
  onUnmount,
}) => {
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker
        position={operatorInfo.coordinates}
        icon={createCustomMarkerIcon(
          operatorInfo.callsign,
          showingHeardBy && selectedStation === operatorInfo.callsign
            ? "green"
            : "red",
          selectedStation === operatorInfo.callsign ? 1000 : 1,
          labelSize
        )}
        onClick={() => onMarkerClick(operatorInfo.callsign)}
      />

      {locations.map((location, index) => (
        <Marker
          key={index}
          position={{ lat: location.lat, lng: location.lng }}
          onClick={() => onMarkerClick(location.callsign)}
          icon={createCustomMarkerIcon(
            location.callsign,
            selectedStation === location.callsign
              ? showingHeardBy
                ? "green"
                : "red"
              : "red",
            selectedStation === location.callsign ? 1000 : 1,
            labelSize
          )}
        />
      ))}
    </GoogleMap>
  );
};

export default SimplexMap;
