import { useState, useEffect } from "react";
import Map from "../components/map";
import "../styles/create.css";
export default function Create() {
  const [markers, setMarkers] = useState([]); //Marker array
  const [selectedMarker, setSelectedMarker] = useState(null); //For deleting markers
  const [mapID, setMapID] = useState(); //For knowing what map is currently being used (adding markers, saving)
  const [nameInputVisible, setNameInputVisible] = useState(false); //Displaying the input for the map name
  const [capitalInputVisible, setCapitalInputVisible] = useState(false); //Naming capital marker variable
  const [largeSettlementInputVisible, setLargeSettlementInputVisible] =
    useState(false); //Naming large settlement variable
  const [smallSettlementInputVisible, setSmallSettlementInputVisible] =
    useState(false); //Naming small settlement variable

  const [mapName, setMapName] = useState(""); //Setting the map name when its being created
  const [markerPopUp, setMarkerPopUp] = useState(""); //Entering the marker variable
  const [maps, setMaps] = useState([]); //Variable to store all maps the user has made

  useEffect(() => {
    //Getting all the users maps from mongodb, so they can access them when they want
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
    //Function to create a new map
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
    //Function to create a new marker and append it to the markers array
    const newMarker = {
      coords: [600, 600],
      popUp: markerPopUp,
      type: type,
      clientID: crypto.randomUUID(),
    };

    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  }

  async function saveChanges() {
    //Sends the markers array and mapid to the backend to be saved to the database
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
    //Sends the mapid to the backend to change the maps isPublished variable to true, so that in the view others page, the map is visible
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
    //Gets the markers from the database and overwrites the marker array with new array, and adds a clientid to each marker for future use
    const response = await fetch(`/api/getMarkers/${id}`);
    const data = await response.json();

    const markersWithClientIds = data.markers.map((marker) => ({
      ...marker,
      clientID: crypto.randomUUID(),
    }));

    setMarkers(markersWithClientIds);
  }

  const handleKeyDown = (e, type) => {
    //Handles the enter button down for each marker button type (this is clicked after the user names the marker in an input field)
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
    //Changes the markers coordinates in the marker array once the user has moved the marker
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.clientID === clientID
          ? { ...marker, coords: newCoords }
          : marker,
      ),
    );
  }

  function deleteSelectedMarker() {
    //Removes the chosen marker from the marker array
    if (!selectedMarker) return;

    setMarkers((prev) => prev.filter((m) => m.clientID !== selectedMarker));

    setSelectedMarker(null);
  }

  return (
    <div>
      <header>
        <h1>Create a map</h1>
      </header>

      <main>
        <div id="map-edits">
          <div id="map-edit-buttons">
            <button
              className="create-buttons"
              id="add-capital-marker"
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
              id="add-large-settlement-marker"
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

            <button className="create-buttons" onClick={deleteSelectedMarker}>
              Delete Marker
            </button>
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
          <Map
            data={markers}
            onSelectMarker={setSelectedMarker}
            onMarkerMove={onMarkerMove}
          />
          <div id="user-map-list">
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
            <h2>Your Maps:</h2>
            <ul>
              {maps.map((map) => (
                <li key={map._id}>
                  <button
                    onClick={() => {
                      setMapID(map._id);
                      getMarkers(map._id);
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
