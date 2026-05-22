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

export default function Map({ data, onMarkerMove, onSelectMarker }) {
  let markers = data; //Setting the marker array to the array that is sent through

  //Setting map dimensions
  const width = 950;
  const height = 1150;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  const Icons = {
    //Setting up different images for different markers
    Capital: new L.Icon({
      iconUrl: "./images/markers/Capital-Icon.png",
      iconSize: [60, 60],
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
    <MapContainer //Map
      crs={L.CRS.Simple} //Setting map to use pixels as coordinates instead of longitude and latitude
      bounds={bounds} //Setting map bounds
      maxBounds={bounds} //Telling the map that the image can't leave the bounds of the map
      maxBoundsViscosity={1.0}
      id="map-container"
    >
      <ImageOverlay url="/images/BlankMap.png" bounds={bounds} />{" "}
      {
        //Setting the background image for the map
        //Mapping the markers to the marker array that is sent into the component
      }
      {markers.map((marker, index) => (
        <Marker
          key={marker.clientID ?? marker._id ?? index}
          position={marker.coords}
          icon={Icons[marker.type]}
          draggable={!!onMarkerMove}
          eventHandlers={{
            click: () => onSelectMarker && onSelectMarker(marker.clientID),
            dragend: (e) => {
              if (!onMarkerMove) return;
              const { lat, lng } = e.target.getLatLng();
              onMarkerMove(marker.clientID, [lat, lng]);
            },
          }}
        >
          {
            //Handles the clicking on and movement of the markers
          }
          <Popup>{marker.popUp}</Popup>
          {
            //Sets the popup to the markers popup in the array
          }
        </Marker>
      ))}
    </MapContainer>
  );
}
