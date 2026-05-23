import { useState, useEffect } from "react";
import Map from "../components/map";
import "../styles/create.css";

function MapButton({ map, activeMapId, onLoad, showOwner }) {
  return (
    <li>
      <button
        className={activeMapId === map._id ? "active-map" : ""}
        onClick={() => onLoad(map)}
      >
        {map.mapName}
        {showOwner && <span className="map-owner"> — {map.owner}</span>}
      </button>
    </li>
  );
}

export default function ViewOthers() {
  const [markers, setMarkers] = useState([]);
  const [polylines, setPolylines] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [bgColor, setBgColor] = useState("#111d22");
  const [maps, setMaps] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");
  const [activeMap, setActiveMap] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [mapsRes, userRes] = await Promise.all([
        fetch("/api/getAllMaps", { credentials: "include" }),
        fetch("/api/user", { credentials: "include" }),
      ]);
      const mapsData = await mapsRes.json();
      const userData = await userRes.json();
      setMaps(mapsData);
      if (userData.loggedIn) setCurrentUser(userData.username);
    }
    fetchData();
  }, []);

  async function loadMap(map) {
    setActiveMap(map);
    try {
      const response = await fetch(`/api/getMarkers/${map._id}`, { credentials: "include" });
      if (!response.ok) throw new Error(`Failed to load map (${response.status})`);
      const data = await response.json();
      setMarkers((data.markers ?? []).map((m) => ({ ...m, clientID: crypto.randomUUID() })));
      setPolylines(data.polylines ?? []);
      setImageUrl(data.imageUrl ?? "");
      setBgColor(data.bgColor ?? "#111d22");
    } catch (err) {
      console.error(err);
      setActiveMap(null);
    }
  }

  const query = search.toLowerCase();
  const myMaps = maps.filter(
    (m) => m.owner === currentUser && m.mapName.toLowerCase().includes(query),
  );
  const othersMaps = maps.filter(
    (m) => m.owner !== currentUser && (
      m.mapName.toLowerCase().includes(query) ||
      m.owner.toLowerCase().includes(query)
    ),
  );

  return (
    <div>
      <header>
        <h1>Explore Maps</h1>
      </header>
      <main>
        <div id="map-edits">
          <Map data={markers} polylines={polylines} imageUrl={imageUrl} bgColor={bgColor} />
          <div id="user-map-list">
            <input
              type="text"
              placeholder="Search maps or creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {activeMap?.description && (
              <p className="map-description">{activeMap.description}</p>
            )}

            {currentUser && myMaps.length > 0 && (
              <>
                <h2>My Maps</h2>
                <ul>
                  {myMaps.map((map) => <MapButton key={map._id} map={map} activeMapId={activeMap?._id} onLoad={loadMap} showOwner={false} />)}
                </ul>
              </>
            )}

            <h2>{currentUser ? "Others' Maps" : "Maps"}</h2>
            <ul>
              {othersMaps.length > 0
                ? othersMaps.map((map) => (
                    <MapButton key={map._id} map={map} activeMapId={activeMap?._id} onLoad={loadMap} showOwner={true} />
                  ))
                : <li><p className="empty-msg">No maps published yet.</p></li>
              }
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
