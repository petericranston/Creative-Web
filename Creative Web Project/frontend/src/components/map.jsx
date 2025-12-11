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
  const width = 950;
  const height = 1150;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  const markers = [
    {
      coords: [370, 780],
      popUp: "Kings Landing",
    },
    {
      coords: [730, 520],
      popUp: "Winterfell",
    },
    {
      coords: [330, 350],
      popUp: "High Garden",
    },
  ];

  const customIcon = new Icon({
    iconUrl: "./images/marker.png",
    iconSize: [38, 38],
  });

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
        <Marker position={marker.coords} icon={customIcon}>
          <Popup>{marker.popUp}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
