import { marker, popup } from "leaflet";
import { useState } from "react";
import Map from "../components/map";
import "../styles/create.css";
export default function Create() {
  const [markers, setMarkers] = useState([
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
    {
      coords: [450, 600],
      popUp: "Harrenhall",
    },
  ]);
  const [mapID, setMapID] = useState(1);

  async function NewMarker() {
    try {
      const response = await fetch("/api/addMarker", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapID }),
      });
      if (!response.ok) {
        console.log("Marker failed to add.");
        return;
      }
    } catch (error) {
      console.log("Marker failed to add ", error);
    }
    const newMarker = { coords: [600, 600], popUp: "newMarker" };

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  }

  return (
    <div>
      <header>
        <h1>Create a map</h1>
      </header>
      <main>
        <button className="create-buttons">New Map</button>
        <button className="create-buttons">My Maps</button>
        <div id="map-edits">
          <button
            className="create-buttons"
            id="add-marker"
            onClick={NewMarker}
          >
            Add Marker
          </button>
          <Map data={markers} />
        </div>
      </main>
    </div>
  );
}
