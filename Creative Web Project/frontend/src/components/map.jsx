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

export default function Map() {
  const width = 800;
  const height = 1000;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  const markers = [
    {
      geocode: [330, 650],
      popUp: "Kings Landing",
    },
    {
      geocode: [200, 200],
      popUp: "Dorne",
    },
  ];

  const customIcon = new Icon({
    iconUrl: "./images/marker.png",
    iconSize: [38, 38],
  });

  return (
    <MapContainer
      crs={L.CRS.Simple}
      style={{ height: "100vh", width: "100%" }}
      bounds={bounds}
      id="map-container"
    >
      <ImageOverlay url="/images/BlankMap.png" bounds={bounds} />
      {markers.map((marker) => (
        <Marker position={marker.geocode} icon={customIcon}></Marker>
      ))}
    </MapContainer>
  );
}
