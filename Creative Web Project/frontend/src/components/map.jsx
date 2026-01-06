import "../styles/map.css";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Map({ data, onMarkerMove }) {
  let markers = data;

  const width = 950;
  const height = 1150;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  const Icons = {
    Capital: new L.Icon({
      iconUrl: "./images/markers/Capital-Icon.png",
      iconSize: [50, 50],
    }),
    LargeSettlement: new L.Icon({
      iconUrl: "./images/markers/LargeSettlement-Icon.png",
      iconSize: [38, 38],
    }),
    SmallSettlement: new L.Icon({
      iconUrl: "./images/markers/SmallSettlement-Icon.png",
      iconSize: [20, 20],
    }),
  };

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      id="map-container"
    >
      <ImageOverlay url="/images/BlankMap.png" bounds={bounds} />
      {markers.map((marker) => (
        <Marker
          key={marker.clientID}
          position={marker.coords}
          icon={Icons[marker.type]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onMarkerMove(marker.clientID, [lat, lng]);
            },
          }}
        >
          <Popup>{marker.popUp}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
