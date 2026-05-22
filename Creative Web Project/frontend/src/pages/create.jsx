import { useState, useEffect, useRef } from "react";
import Map from "../components/map";
import "../styles/create.css";

export default function Create() {
  const [markers, setMarkers] = useState([]);
  const [polylines, setPolylines] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPolyline, setSelectedPolyline] = useState(null);
  const [mapID, setMapID] = useState();
  const [isDirty, setIsDirty] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // New map input
  const [nameInputVisible, setNameInputVisible] = useState(false);
  const [mapName, setMapName] = useState("");

  // Create marker popup
  const [showMarkerPopup, setShowMarkerPopup] = useState(false);
  const [markerType, setMarkerType] = useState(null);
  const [markerName, setMarkerName] = useState("");

  // Map list / metadata
  const [maps, setMaps] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [publishStatus, setPublishStatus] = useState("idle");
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [description, setDescription] = useState("");

  // Undo history
  const [history, setHistory] = useState([]);

  // Drawing mode
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentDrawPath, setCurrentDrawPath] = useState([]);
  const [pathLabel, setPathLabel] = useState("");

  // Right-click context menu
  const [contextMenu, setContextMenu] = useState(null);

  // Edit marker / path name dialogs
  const [editingMarker, setEditingMarker] = useState(null);
  const [editingPolyline, setEditingPolyline] = useState(null);

  const fileInputRef = useRef(null);
  const drawingRef = useRef([]);

  const currentMap = maps.find((m) => m._id === mapID);
  const isPublished = currentMap?.isPublished ?? false;

  useEffect(() => {
    const fetchMaps = async () => {
      const response = await fetch("/api/getUserMaps", { credentials: "include" });
      const data = await response.json();
      setMaps(data);
    };
    fetchMaps();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // ── History ──────────────────────────────────────────────────────────────

  function pushHistory(currentMarkers, currentPolylines) {
    setHistory((prev) => [...prev, { markers: currentMarkers, polylines: currentPolylines, imageUrl }]);
  }

  function undo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setMarkers(last.markers);
    setPolylines(last.polylines);
    setImageUrl(last.imageUrl);
    setHistory((prev) => prev.slice(0, -1));
    setIsDirty(true);
  }

  // ── Map CRUD ─────────────────────────────────────────────────────────────

  async function newMap() {
    try {
      const response = await fetch("/api/newMap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markers: [], mapName }),
      });
      if (!response.ok) return;
      const data = await response.json();
      setMapID(data.mapID);
      setMarkers([]);
      setPolylines([]);
      setImageUrl("");
      setHistory([]);
      setMapName("");
      setIsDirty(false);
      setDrawingMode(false);
      setCurrentDrawPath([]);
      setMaps((prev) => [...prev, { _id: data.mapID, mapName: data.mapName, isPublished: false }]);
    } catch (error) {
      console.log("Failed to create map", error);
    }
  }

  async function loadMap(id) {
    if (isDirty && !window.confirm("You have unsaved changes. Switch maps anyway?")) return;
    setMapID(id);
    setIsDirty(false);
    setHistory([]);
    setDrawingMode(false);
    setCurrentDrawPath([]);
    setContextMenu(null);
    const selectedMap = maps.find((m) => m._id === id);
    setDescription(selectedMap?.description ?? "");
    const response = await fetch(`/api/getMarkers/${id}`);
    const data = await response.json();
    setMarkers(data.markers.map((m) => ({ ...m, clientID: crypto.randomUUID() })));
    setPolylines(data.polylines ?? []);
    setImageUrl(data.imageUrl ?? "");
  }

  async function saveChanges() {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/saveChanges", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapID, markers, polylines, imageUrl }),
      });
      if (!response.ok) { setSaveStatus("error"); return; }
      setSaveStatus("saved");
      setIsDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

  async function togglePublish() {
    setPublishStatus("saving");
    const endpoint = isPublished ? "/api/unpublishMap" : "/api/publishMap";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapID }),
      });
      if (!response.ok) { setPublishStatus("error"); return; }
      setMaps((prev) =>
        prev.map((m) => m._id === mapID ? { ...m, isPublished: !isPublished } : m),
      );
      setPublishStatus(isPublished ? "unpublished" : "published");
      setTimeout(() => setPublishStatus("idle"), 2000);
    } catch {
      setPublishStatus("error");
    }
  }

  async function deleteMap(id) {
    if (!window.confirm("Delete this map? This cannot be undone.")) return;
    const response = await fetch(`/api/deleteMap/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      setMaps((prev) => prev.filter((m) => m._id !== id));
      if (mapID === id) {
        setMapID(undefined);
        setMarkers([]);
        setPolylines([]);
        setImageUrl("");
        setIsDirty(false);
        setHistory([]);
      }
    }
  }

  async function saveRename(id) {
    const trimmed = renameValue.trim();
    if (!trimmed) return setRenamingId(null);
    const response = await fetch(`/api/renameMap/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mapName: trimmed }),
    });
    if (response.ok) {
      setMaps((prev) => prev.map((m) => m._id === id ? { ...m, mapName: trimmed } : m));
    }
    setRenamingId(null);
  }

  async function saveDescription(value) {
    if (!mapID) return;
    await fetch(`/api/updateDescription/${mapID}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: value }),
    });
    setMaps((prev) =>
      prev.map((m) => m._id === mapID ? { ...m, description: value } : m),
    );
  }

  // ── Markers ──────────────────────────────────────────────────────────────

  function NewMarker(type, name) {
    pushHistory(markers, polylines);
    setMarkers((prev) => [
      ...prev,
      { coords: [575, 475], popUp: name, type, clientID: crypto.randomUUID() },
    ]);
    setIsDirty(true);
  }

  function deleteSelected() {
    if (selectedMarker) {
      pushHistory(markers, polylines);
      setMarkers((prev) => prev.filter((m) => m.clientID !== selectedMarker));
      setSelectedMarker(null);
      setIsDirty(true);
    } else if (selectedPolyline !== null) {
      pushHistory(markers, polylines);
      setPolylines((prev) => prev.filter((_, i) => i !== selectedPolyline));
      setSelectedPolyline(null);
      setIsDirty(true);
    }
  }

  function handleSelectMarker(clientID) {
    setSelectedMarker(clientID);
    setSelectedPolyline(null);
  }

  function handleSelectPolyline(index) {
    setSelectedPolyline(index);
    setSelectedMarker(null);
  }

  function clearSelection() {
    setSelectedMarker(null);
    setSelectedPolyline(null);
  }

  function onMarkerMove(clientID, newCoords) {
    pushHistory(markers, polylines);
    setMarkers((prev) =>
      prev.map((m) => m.clientID === clientID ? { ...m, coords: newCoords } : m),
    );
    setIsDirty(true);
  }

  // Double-click to edit marker name
  function handleMarkerEdit(clientID) {
    const marker = markers.find((m) => m.clientID === clientID);
    if (marker) setEditingMarker({ clientID, name: marker.popUp });
  }

  function saveEditedMarkerName() {
    if (!editingMarker) return;
    setMarkers((prev) =>
      prev.map((m) =>
        m.clientID === editingMarker.clientID ? { ...m, popUp: editingMarker.name } : m,
      ),
    );
    setEditingMarker(null);
    setIsDirty(true);
  }

  function handlePolylineEdit(index) {
    const line = polylines[index];
    if (line !== undefined) setEditingPolyline({ index, label: line.label ?? "" });
  }

  function saveEditedPolylineLabel() {
    if (!editingPolyline) return;
    setPolylines((prev) =>
      prev.map((p, i) => i === editingPolyline.index ? { ...p, label: editingPolyline.label } : p),
    );
    setEditingPolyline(null);
    setIsDirty(true);
  }

  // ── Right-click context menu ──────────────────────────────────────────────

  function handleRightClick({ latlng, x, y }) {
    if (drawingMode) return;
    setContextMenu({ latlng, x, y });
  }

  function placeMarkerAt(type) {
    const defaultNames = { Capital: "Capital", LargeSettlement: "Large Settlement", SmallSettlement: "Small Settlement" };
    pushHistory(markers, polylines);
    setMarkers((prev) => [
      ...prev,
      {
        coords: [contextMenu.latlng.lat, contextMenu.latlng.lng],
        popUp: defaultNames[type],
        type,
        clientID: crypto.randomUUID(),
      },
    ]);
    setContextMenu(null);
    setIsDirty(true);
  }

  // ── Drawing paths ─────────────────────────────────────────────────────────

  function toggleDrawing() {
    drawingRef.current = [];
    setDrawingMode((prev) => !prev);
    setCurrentDrawPath([]);
    setPathLabel("");
  }

  function handleFreehandStart(latlng) {
    pushHistory(markers, polylines);
    drawingRef.current = [[latlng.lat, latlng.lng]];
    setCurrentDrawPath([[latlng.lat, latlng.lng]]);
  }

  function handleFreehandMove(latlng) {
    drawingRef.current.push([latlng.lat, latlng.lng]);
    // Sync to state every 6 points so the preview line updates smoothly
    if (drawingRef.current.length % 6 === 0) {
      setCurrentDrawPath([...drawingRef.current]);
    }
  }

  function handleFreehandEnd() {
    const path = drawingRef.current.slice();
    drawingRef.current = [];
    setCurrentDrawPath([]);
    if (path.length >= 2) {
      setPolylines((prev) => [
        ...prev,
        { points: path, color: "#8b0000", label: pathLabel.trim() },
      ]);
      setPathLabel("");
      setIsDirty(true);
    } else {
      // Single tap — undo the history push since nothing was drawn
      setHistory((prev) => prev.slice(0, -1));
    }
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !mapID) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("mapID", mapID);
    const res = await fetch("/api/uploadImage", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      pushHistory(markers, polylines);
      setImageUrl(data.imageUrl);
      setIsDirty(true);
    }
    e.target.value = "";
  }

  function createMarker() {
    if (!markerType) return;
    const defaults = { Capital: "Capital", LargeSettlement: "Large Settlement", SmallSettlement: "Small Settlement" };
    NewMarker(markerType, markerName.trim() || defaults[markerType]);
    setMarkerName("");
    setMarkerType(null);
    setShowMarkerPopup(false);
  }

  // ── Key handlers ──────────────────────────────────────────────────────────

  const handleNewMapKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    setNameInputVisible(false);
    newMap();
  };

  // ── Labels ────────────────────────────────────────────────────────────────

  const saveLabel = { idle: "Save Edits", saving: "Saving...", saved: "Saved!", error: "Save Failed" }[saveStatus];
  const publishLabel = {
    idle: isPublished ? "Unpublish" : "Publish Map",
    saving: "...",
    published: "Published!",
    unpublished: "Unpublished!",
    error: "Failed",
  }[publishStatus];

  return (
    <div onClick={() => { contextMenu && setContextMenu(null); showMarkerPopup && setShowMarkerPopup(false); }}>
      <header>
        <h1>Create a map</h1>
      </header>

      <main>
        <div id="map-edits">

          {/* ── Left panel ── */}
          <div id="map-edit-buttons">
            <div className="marker-btn-wrapper">
            <button
              className={`create-buttons ${showMarkerPopup ? "active-map" : ""}`}
              onClick={() => setShowMarkerPopup((p) => !p)}
              disabled={!mapID}
            >
              Create Marker
            </button>

            {showMarkerPopup && (
              <div className="marker-popup" onClick={(e) => e.stopPropagation()}>
                {[
                  { type: "Capital",         symbol: "★", label: "Capital",          color: "#e8c84a" },
                  { type: "LargeSettlement", symbol: "◆", label: "Large Settlement", color: "#b07828" },
                  { type: "SmallSettlement", symbol: "●", label: "Small Settlement", color: "#7a6028" },
                ].map(({ type, symbol, label, color }) => (
                  <button
                    key={type}
                    className={`marker-type-btn ${markerType === type ? "type-selected" : ""}`}
                    onClick={() => setMarkerType(type)}
                  >
                    <span style={{ color, fontSize: "13px" }}>{symbol}</span>
                    {label}
                  </button>
                ))}
                <input
                  type="text"
                  value={markerName}
                  onChange={(e) => setMarkerName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") createMarker(); if (e.key === "Escape") setShowMarkerPopup(false); }}
                  placeholder="Name (optional)"
                />
                <button
                  className="create-buttons status-btn saved"
                  onClick={createMarker}
                  disabled={!markerType}
                  style={{ width: "100%", margin: 0 }}
                >
                  Add
                </button>
              </div>
            )}
            </div>

            <button
              className="create-buttons"
              onClick={deleteSelected}
              disabled={!selectedMarker && selectedPolyline === null}
            >
              {selectedPolyline !== null ? "Delete Path" : "Delete Marker"}
            </button>

            <button
              className={`create-buttons ${drawingMode ? "is-published" : ""}`}
              onClick={toggleDrawing}
              disabled={!mapID}
            >
              {drawingMode ? "Drawing..." : "Draw Path"}
            </button>

            {drawingMode && (
              <input
                type="text"
                value={pathLabel}
                onChange={(e) => setPathLabel(e.target.value)}
                placeholder="Path name (opt.)"
                style={{ width: 130 }}
              />
            )}

            <button
              className="create-buttons"
              onClick={undo}
              disabled={history.length === 0}
            >
              Undo
            </button>

            <button
              className={`create-buttons status-btn ${saveStatus}`}
              onClick={saveChanges}
              disabled={saveStatus === "saving" || !mapID}
            >
              {saveLabel}
            </button>

            <button
              className={`create-buttons status-btn ${publishStatus} ${isPublished ? "is-published" : ""}`}
              onClick={togglePublish}
              disabled={publishStatus === "saving" || !mapID}
            >
              {publishLabel}
            </button>

            {isDirty && <p className="unsaved-warning">Unsaved changes</p>}

            {mapID && (
              <>
                <textarea
                  className="description-input"
                  placeholder="Map description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={(e) => saveDescription(e.target.value)}
                  rows={3}
                />
                <button
                  className="create-buttons"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload a custom map image"
                >
                  Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
              </>
            )}
          </div>

          {/* ── Map ── */}
          <Map
            data={markers}
            polylines={polylines}
            selectedPolyline={selectedPolyline}
            selectedMarker={selectedMarker}
            onSelectPolyline={handleSelectPolyline}
            onPolylineEdit={handlePolylineEdit}
            imageUrl={imageUrl}
            onSelectMarker={handleSelectMarker}
            onMarkerMove={onMarkerMove}
            onMarkerEdit={handleMarkerEdit}
            onRightClick={handleRightClick}
            onClearSelection={clearSelection}
            drawingMode={drawingMode}
            onFreehandStart={handleFreehandStart}
            onFreehandMove={handleFreehandMove}
            onFreehandEnd={handleFreehandEnd}
            currentDrawPath={currentDrawPath}
          />

          {/* ── Right panel ── */}
          <div id="user-map-list">
            <button className="create-buttons" onClick={() => setNameInputVisible(true)}>
              New Map
            </button>
            {nameInputVisible && (
              <input type="text" value={mapName} onChange={(e) => setMapName(e.target.value)}
                onKeyDown={handleNewMapKeyDown} placeholder="Enter Map Name" autoFocus />
            )}
            <h2>Your Maps:</h2>
            <ul>
              {maps.map((map) => (
                <li key={map._id} className="map-list-item">
                  {renamingId === map._id ? (
                    <input className="rename-input" value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveRename(map._id); if (e.key === "Escape") setRenamingId(null); }}
                      onBlur={() => saveRename(map._id)} autoFocus />
                  ) : (
                    <button
                      className={`map-name-btn ${mapID === map._id ? "active-map" : ""}`}
                      onClick={() => loadMap(map._id)}
                    >
                      {map.mapName}
                      {map.isPublished && <span className="published-badge">●</span>}
                    </button>
                  )}
                  <div className="map-actions">
                    <button className="icon-btn" title="Rename"
                      onClick={() => { setRenamingId(map._id); setRenameValue(map.mapName); }}>✎</button>
                    <button className="icon-btn delete-btn" title="Delete"
                      onClick={() => deleteMap(map._id)}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* ── Right-click context menu ── */}
      {contextMenu && (
        <div
          className="map-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => placeMarkerAt("Capital")}>+ Capital</button>
          <button onClick={() => placeMarkerAt("LargeSettlement")}>+ Large Settlement</button>
          <button onClick={() => placeMarkerAt("SmallSettlement")}>+ Small Settlement</button>
          <button className="cancel-option" onClick={() => setContextMenu(null)}>Cancel</button>
        </div>
      )}

      {/* ── Edit marker name dialog ── */}
      {editingMarker && (
        <div className="edit-marker-overlay" onClick={() => setEditingMarker(null)}>
          <div className="edit-marker-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Rename Marker</h4>
            <input
              value={editingMarker.name}
              onChange={(e) => setEditingMarker((prev) => ({ ...prev, name: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEditedMarkerName();
                if (e.key === "Escape") setEditingMarker(null);
              }}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setEditingMarker(null)}>Cancel</button>
              <button className="status-btn saved" onClick={saveEditedMarkerName}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit path name dialog ── */}
      {editingPolyline && (
        <div className="edit-marker-overlay" onClick={() => setEditingPolyline(null)}>
          <div className="edit-marker-dialog" onClick={(e) => e.stopPropagation()}>
            <h4>Rename Path</h4>
            <input
              value={editingPolyline.label}
              placeholder="Path name (optional)"
              onChange={(e) => setEditingPolyline((prev) => ({ ...prev, label: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEditedPolylineLabel();
                if (e.key === "Escape") setEditingPolyline(null);
              }}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setEditingPolyline(null)}>Cancel</button>
              <button className="status-btn saved" onClick={saveEditedPolylineLabel}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
