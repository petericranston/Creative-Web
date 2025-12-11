import "../styles/map.css";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  const width = 800;
  const height = 1000;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      style={{ height: "100vh", width: "100%" }}
      bounds={bounds}
    >
      <ImageOverlay url="/images/BlankMap.png" bounds={bounds} />
    </MapContainer>
  );
}
