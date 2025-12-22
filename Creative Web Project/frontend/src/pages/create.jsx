import { marker, popup } from "leaflet";
import { useState } from "react";
import Map from "../components/map";
import "../styles/create.css";
import { useTransition } from "react";
import { useSyncExternalStore } from "react";
import { useEffect } from "react";
export default function Create() {
  const [markers, setMarkers] = useState([]);
  const [mapID, setMapID] = useState();
  const [nameInputVisible, setNameInputVisible] = useState(false);
  const [mapName, setMapName] = useState("");
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const fetchMaps = async () => {
      const response = await fetch("/api/getUserMaps", {
        credentials: "include",
      });
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  });

  async function newMap() {
    try {
      const response = await fetch("/api/newMap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markers, mapName }),
      });
      const data = await response.json();
      setMapID(data.mapID);
      console.log(mapID);
      setMarkers([]);
      if (!response.ok) {
        console.log("Failed to create map");
        return;
      }
    } catch (error) {
      console.log("Failed to create map", error);
    }
  }

  async function NewMarker() {
    const newMarker = { coords: [600, 600], popUp: "newMarker" };

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

    // try {
    //   const response = await fetch("/api/addMarker", {
    //     method: "POST",
    //     credentials: "include",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ mapID, markers }),
    //   });
    //   if (!response.ok) {
    //     console.log("Marker failed to add.");
    //     return;
    //   }
    // } catch (error) {
    //   console.log("Marker failed to add ", error);
    // }
  }

  async function saveChanges() {
    try {
      const response = await fetch("/api/saveChanges", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapID, markers }),
      });

      if (!response.ok) {
        console.log("Failed to save map");
        return;
      }
    } catch (error) {
      console.log("Failed to save map", error);
    }
  }

  async function getMarkers() {
    const response = await fetch(`/api/getMarkers/${mapID}`);
    const data = await response.json();
    setMarkers(data.markers);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setNameInputVisible(false);
      console.log(mapName);
      newMap();
    }
  };

  return (
    <div>
      <header>
        <h1>Create a map</h1>
      </header>
      <main>
        <button
          className="create-buttons"
          onClick={() => setNameInputVisible(true)}
        >
          New Map
        </button>
        {nameInputVisible && (
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Map Name"
          />
        )}
        <button className="create-buttons">My Maps</button>
        <div id="map-edits">
          <div id="map-edit-buttons">
            <button
              className="create-buttons"
              id="add-marker"
              onClick={NewMarker}
            >
              Add Marker
            </button>
            <button
              className="create-buttons"
              id="add-marker"
              onClick={saveChanges}
            >
              Save Edits
            </button>
          </div>
          <Map data={markers} />
          <div id="user-map-list">
            <h2>Your Maps:</h2>
            <ul>
              {maps.map((map) => (
                <li key={map._id}>
                  <button
                    onClick={(() => setMapID(map._id), getMarkers(map._id))}
                  >
                    {map.mapName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
