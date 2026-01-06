import { marker, popup } from "leaflet";
import { useState } from "react";
import Map from "../components/map";
import { useTransition } from "react";
import { useSyncExternalStore } from "react";
import { useEffect } from "react";
import "../styles/create.css";

export default function ViewOthers() {
  const [markers, setMarkers] = useState([]);
  const [mapID, setMapID] = useState();
  const [maps, setMaps] = useState([]);
  useEffect(() => {
    const fetchMaps = async () => {
      const response = await fetch("/api/getAllMaps", {
        credentials: "include",
      });
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  }, []);

  async function getMarkers(id) {
    const response = await fetch(`/api/getMarkers/${id}`);
    const data = await response.json();
    console.log(data);
    setMarkers(data.markers ?? []);
  }

  return (
    <div>
      <header>
        <h1>All Users Maps</h1>
      </header>
      <main>
        <div id="map-edits">
          <Map data={markers} />
          <div id="user-map-list">
            <h2>Maps:</h2>
            <ul>
              {maps
                .filter((map) => map.isPublished === true)
                .map((map) => (
                  <li key={map._id}>
                    <button
                      onClick={() => {
                        setMapID(map._id), getMarkers(map._id);
                      }}
                    >
                      {map.mapName + " by: " + map.owner}
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
