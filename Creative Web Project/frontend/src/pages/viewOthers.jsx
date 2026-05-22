import { useState, useEffect } from "react";
import Map from "../components/map";
import "../styles/create.css";

export default function ViewOthers() {
  const [markers, setMarkers] = useState([]);
  const [maps, setMaps] = useState([]);
  useEffect(() => {
    const fetchMaps = async () => {
      //Getting all maps to be displayed as buttons
      const response = await fetch("/api/getAllMaps", {
        credentials: "include",
      });
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  }, []);

  async function getMarkers(id) {
    //Getting markers using the mapid of the button that is clicked on
    const response = await fetch(`/api/getMarkers/${id}`);
    const data = await response.json();
    console.log(data);
    const markersWithClientIds = (data.markers ?? []).map((marker) => ({
      ...marker,
      clientID: crypto.randomUUID(),
    }));
    setMarkers(markersWithClientIds);
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
                      onClick={() => getMarkers(map._id)}
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
