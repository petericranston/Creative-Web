import "../styles/map.css";
import { useEffect, useRef } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MapController({ onRightClick, drawingMode, onFreehandStart, onFreehandMove, onFreehandEnd, onClearSelection }) {
  const map = useMap();
  const isPointerDown = useRef(false);
  const lastPoint = useRef(null);

  useEffect(() => {
    if (!drawingMode) {
      map.dragging.enable();
      isPointerDown.current = false;
    }
  }, [drawingMode, map]);

  useMapEvents({
    contextmenu(e) {
      e.originalEvent.preventDefault();
      if (onRightClick) {
        onRightClick({
          latlng: e.latlng,
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
        });
      }
    },
    click() {
      if (!drawingMode && onClearSelection) onClearSelection();
    },
    mousedown(e) {
      if (!drawingMode) return;
      isPointerDown.current = true;
      lastPoint.current = e.latlng;
      map.dragging.disable();
      if (onFreehandStart) onFreehandStart(e.latlng);
    },
    mousemove(e) {
      if (!drawingMode || !isPointerDown.current || !lastPoint.current) return;
      const dist = Math.hypot(
        e.latlng.lat - lastPoint.current.lat,
        e.latlng.lng - lastPoint.current.lng,
      );
      if (dist < 8) return;
      lastPoint.current = e.latlng;
      if (onFreehandMove) onFreehandMove(e.latlng);
    },
    mouseup() {
      if (!drawingMode || !isPointerDown.current) return;
      isPointerDown.current = false;
      map.dragging.enable();
      if (onFreehandEnd) onFreehandEnd();
    },
  });

  return null;
}

const ICON_CONFIGS = {
  Capital:          { size: 50, cls: "marker-capital", symbol: "★" },
  LargeSettlement:  { size: 36, cls: "marker-large",   symbol: "◆" },
  SmallSettlement:  { size: 22, cls: "marker-small",   symbol: "●" },
};

function getIcon(type, isSelected) {
  const cfg = ICON_CONFIGS[type] ?? ICON_CONFIGS.SmallSettlement;
  const sel = isSelected ? " marker-selected" : "";
  return new L.DivIcon({
    html: `<div class="${cfg.cls}${sel}" draggable="false">${cfg.symbol}</div>`,
    iconSize:     [cfg.size, cfg.size],
    iconAnchor:   [cfg.size / 2, cfg.size / 2],
    popupAnchor:  [0, -(cfg.size / 2) - 6],
    className: "",
  });
}

export default function Map({
  data,
  polylines = [],
  selectedPolyline = null,
  onSelectPolyline,
  onPolylineEdit,
  selectedMarker = null,
  imageUrl,
  onMarkerMove,
  onSelectMarker,
  onMarkerEdit,
  onRightClick,
  onClearSelection,
  drawingMode = false,
  onFreehandStart,
  onFreehandMove,
  onFreehandEnd,
  currentDrawPath = [],
}) {
  const bounds = [[0, 0], [1150, 950]];
  const mapImage = imageUrl || "/images/BlankMap.png";

  return (
    <div id="map-wrapper">
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        id="map-container"
      >
        <MapController
          onRightClick={onRightClick}
          onClearSelection={onClearSelection}
          drawingMode={drawingMode}
          onFreehandStart={onFreehandStart}
          onFreehandMove={onFreehandMove}
          onFreehandEnd={onFreehandEnd}
        />
        <ImageOverlay url={mapImage} bounds={bounds} />

        {data.map((marker, index) => (
          <Marker
            key={marker.clientID ?? marker._id ?? index}
            position={marker.coords}
            icon={getIcon(marker.type, marker.clientID === selectedMarker)}
            draggable={!!onMarkerMove}
            eventHandlers={{
              click: () => onSelectMarker && onSelectMarker(marker.clientID),
              dblclick: (e) => {
                L.DomEvent.stopPropagation(e);
                if (onMarkerEdit) onMarkerEdit(marker.clientID);
              },
              dragend: (e) => {
                if (!onMarkerMove) return;
                const { lat, lng } = e.target.getLatLng();
                onMarkerMove(marker.clientID, [lat, lng]);
              },
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -30]} className="marker-label">
              {marker.popUp}
            </Tooltip>
            <Popup>{marker.popUp}</Popup>
          </Marker>
        ))}

        {polylines.map((line, index) => {
          const isSelected = selectedPolyline === index;
          return (
            <Polyline
              key={index}
              positions={line.points}
              pathOptions={{
                color: isSelected ? "#c9a84c" : (line.color || "#8b0000"),
                weight: isSelected ? 5 : 3,
                opacity: isSelected ? 1 : 0.8,
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  if (onSelectPolyline) onSelectPolyline(index);
                },
                dblclick: (e) => {
                  L.DomEvent.stopPropagation(e);
                  if (onPolylineEdit) onPolylineEdit(index);
                },
              }}
            >
              {line.label && <Tooltip sticky>{line.label}</Tooltip>}
            </Polyline>
          );
        })}

        {currentDrawPath.length > 1 && (
          <Polyline
            positions={currentDrawPath}
            pathOptions={{ color: "#ff6600", weight: 3, dashArray: "8 4" }}
          />
        )}
      </MapContainer>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-item">
          <div className="marker-capital legend-marker">★</div>
          <span>Capital</span>
        </div>
        <div className="legend-item">
          <div className="marker-large legend-marker">◆</div>
          <span>Large Settlement</span>
        </div>
        <div className="legend-item">
          <div className="marker-small legend-marker">●</div>
          <span>Small Settlement</span>
        </div>
        <div className="legend-item">
          <div className="legend-line" />
          <span>Path / Road</span>
        </div>
      </div>
    </div>
  );
}
