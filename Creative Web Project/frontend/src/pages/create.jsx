import { icon, marker, popup } from "leaflet";
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
  const [capitalInputVisible, setCapitalInputVisible] = useState(false);
  const [largeSettlementInputVisible, setLargeSettlementInputVisible] =
    useState(false);
  const [smallSettlementInputVisible, setSmallSettlementInputVisible] =
    useState(false);

  const [mapName, setMapName] = useState("");
  const [markerPopUp, setMarkerPopUp] = useState("");
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
  }, []);

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
      setMarkers([]);
      setMaps((prev) => [...prev, { _id: data.mapID, mapName: data.mapName }]); //Adding new map to the sidebar on the right without having to refresh the page
      console.log(mapID);

      if (!response.ok) {
        console.log("Failed to create map");
        return;
      }
    } catch (error) {
      console.log("Failed to create map", error);
    }
  }

  async function NewMarker(type) {
    const newMarker = {
      coords: [600, 600],
      popUp: markerPopUp,
      type: type,
      clientID: crypto.randomUUID(),
    };

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
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

  async function publishMap() {
    try {
      const response = await fetch("/api/publishMap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapID }),
      });

      if (!response.ok) {
        console.log("Failed to publish map");
        return;
      }
    } catch (error) {
      console.log("Failed to publish map", error);
    }
  }

  async function getMarkers(id) {
    const response = await fetch(`/api/getMarkers/${id}`);
    const data = await response.json();

    const markersWithClientIds = data.markers.map((marker) => ({
      ...marker,
      clientID: crypto.randomUUID(),
    }));

    setMarkers(markersWithClientIds);
  }

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type == 1) {
        setNameInputVisible(false);
        newMap();
      } else if (type == 2) {
        setCapitalInputVisible(false);
        NewMarker("Capital");
      } else if (type == 3) {
        setLargeSettlementInputVisible(false);
        NewMarker("LargeSettlement");
      } else if (type == 4) {
        setSmallSettlementInputVisible(false);
        NewMarker("SmallSettlement");
      }
    }
  };

  function onMarkerMove(clientID, newCoords) {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.clientID === clientID ? { ...marker, coords: newCoords } : marker
      )
    );
  }

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
            onKeyDown={(e) => handleKeyDown(e, 1)}
            placeholder="Enter Map Name"
          />
        )}
        <div id="map-edits">
          <div id="map-edit-buttons">
            <button
              className="create-buttons"
              id="add-marker"
              onClick={() => setCapitalInputVisible(true)}
            >
              Capital
            </button>
            {capitalInputVisible && (
              <input
                type="text"
                value={markerPopUp}
                onChange={(e) => setMarkerPopUp(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                placeholder="Enter Marker Name"
              />
            )}
            <button
              className="create-buttons"
              id="add-marker"
              onClick={() => setLargeSettlementInputVisible(true)}
            >
              Large Settlement
            </button>
            {largeSettlementInputVisible && (
              <input
                type="text"
                value={markerPopUp}
                onChange={(e) => setMarkerPopUp(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 3)}
                placeholder="Enter Marker Name"
              />
            )}
            <button
              className="create-buttons"
              id="add-marker"
              onClick={() => setSmallSettlementInputVisible(true)}
            >
              Small Settlement
            </button>
            {smallSettlementInputVisible && (
              <input
                type="text"
                value={markerPopUp}
                onChange={(e) => setMarkerPopUp(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 4)}
                placeholder="Enter Marker Name"
              />
            )}
            <button
              className="create-buttons"
              id="save-changes"
              onClick={saveChanges}
            >
              Save Edits
            </button>
            <button
              className="create-buttons"
              id="publish-map"
              onClick={publishMap}
            >
              Publish Map
            </button>
          </div>
          <Map data={markers} onMarkerMove={onMarkerMove} />
          <div id="user-map-list">
            <h2>Your Maps:</h2>
            <ul>
              {maps.map((map) => (
                <li key={map._id}>
                  <button
                    onClick={() => {
                      setMapID(map._id), getMarkers(map._id);
                    }}
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
