import "../styles/map.css";
import { useEffect, useRef, useState } from "react";
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

function MapController({ onRightClick, drawingMode, onFreehandStart, onFreehandMove, onFreehandEnd, onClearSelection, bounds }) {
  const map = useMap();
  const isPointerDown = useRef(false);
  const lastPoint = useRef(null);

  useEffect(() => {
    map.fitBounds(bounds, { padding: [0, 0], animate: false });
  }, [map, bounds]);

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

const CAPITAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -36 64 72" width="64" height="80"><ellipse cx="0" cy="30" rx="22" ry="3" fill="#000" opacity="0.25"/><path d="M -22 28 L -22 6 L -16 6 L -16 0 L -10 0 L -10 6 L -4 6 L -4 -6 L 4 -6 L 4 6 L 10 6 L 10 0 L 16 0 L 16 6 L 22 6 L 22 28 Z" fill="#f1e3c2" stroke="#2a1c0a" stroke-width="1.4" stroke-linejoin="round"/><path d="M -22 6 L -20 6 L -20 3 L -17 3 L -17 6 M -13 6 L -13 3 L -10 3 L -10 6 M -4 -6 L -2 -6 L -2 -9 L 2 -9 L 2 -6 L 4 -6 M 10 6 L 10 3 L 13 3 L 13 6 M 17 6 L 17 3 L 20 3 L 20 6" fill="none" stroke="#2a1c0a" stroke-width="1"/><path d="M -2 28 L -2 18 Q 0 14 2 18 L 2 28 Z" fill="#2a1c0a" opacity="0.85"/><rect x="-1.5" y="-2" width="3" height="4" fill="#2a1c0a" opacity="0.85"/><rect x="-14" y="10" width="2" height="3" fill="#2a1c0a" opacity="0.85"/><rect x="12" y="10" width="2" height="3" fill="#2a1c0a" opacity="0.85"/><line x1="0" y1="-9" x2="0" y2="-22" stroke="#2a1c0a" stroke-width="1.2"/><path d="M 0 -22 L 10 -19 L 0 -16 Z" fill="#8a1818" stroke="#2a1c0a" stroke-width="0.8"/></svg>`;

const TOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-22 -24 44 48" width="44" height="54"><ellipse cx="0" cy="20" rx="14" ry="2" fill="#000" opacity="0.22"/><path d="M -14 18 L -14 4 L 14 4 L 14 18 Z" fill="#f1e3c2" stroke="#2a1c0a" stroke-width="1.2" stroke-linejoin="round"/><path d="M -14 4 L -12 4 L -12 1 L -9 1 L -9 4 M -5 4 L -5 1 L -2 1 L -2 4 M 2 4 L 2 1 L 5 1 L 5 4 M 9 4 L 9 1 L 12 1 L 12 4" fill="none" stroke="#2a1c0a" stroke-width="0.9"/><path d="M -5 4 L -5 -10 L 5 -10 L 5 4 Z" fill="#f1e3c2" stroke="#2a1c0a" stroke-width="1.2" stroke-linejoin="round"/><path d="M -5 -10 L -3 -10 L -3 -13 L 3 -13 L 3 -10 L 5 -10" fill="none" stroke="#2a1c0a" stroke-width="0.9"/><rect x="-1.5" y="-5" width="3" height="4" fill="#2a1c0a" opacity="0.85"/><path d="M -2 18 L -2 12 Q 0 10 2 12 L 2 18 Z" fill="#2a1c0a" opacity="0.85"/></svg>`;

const HUT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-13 -13 26 26" width="26" height="26"><ellipse cx="0" cy="9" rx="8" ry="1.5" fill="#000" opacity="0.2"/><path d="M -7 8 L -7 -1 L 0 -7 L 7 -1 L 7 8 Z" fill="#f1e3c2" stroke="#2a1c0a" stroke-width="1.1" stroke-linejoin="round"/><rect x="-1.5" y="3" width="3" height="5" fill="#2a1c0a" opacity="0.85"/></svg>`;

// ax/ay = iconAnchor (geographic point pixel within icon)
// ttOffset = tooltip vertical offset to clear the top of the marker
const ICON_CONFIGS = {
  Capital:         { svg: CAPITAL_SVG, w: 64, h: 80, ax: 32, ay: 68, ttOffset: -55 },
  LargeSettlement: { svg: TOWN_SVG,    w: 44, h: 54, ax: 22, ay: 45, ttOffset: -36 },
  SmallSettlement: { svg: HUT_SVG,     w: 26, h: 26, ax: 13, ay: 21, ttOffset: -20 },
};

function getIcon(type, isSelected, customMarkerTypes, size = 1) {
  const sel = isSelected ? " marker-selected" : "";
  const customType = customMarkerTypes?.find(ct => ct.id === type);
  if (customType) {
    const s = Math.round(32 * size);
    return new L.DivIcon({
      html: `<div class="marker-svg-wrapper${sel}" draggable="false"><img src="${customType.imageUrl}" class="custom-marker-img" draggable="false" style="width:${s}px;height:${s}px" /></div>`,
      iconSize:    [s, s],
      iconAnchor:  [s / 2, s],
      popupAnchor: [0, -s],
      className: "",
    });
  }
  const cfg = ICON_CONFIGS[type] ?? ICON_CONFIGS.SmallSettlement;
  const w = Math.round(cfg.w * size), h = Math.round(cfg.h * size);
  const ax = Math.round(cfg.ax * size), ay = Math.round(cfg.ay * size);
  // Set width/height inline on the SVG element — CSS alone can't reliably override SVG presentation attributes
  const scaledSvg = cfg.svg.replace('<svg ', `<svg style="width:${w}px;height:${h}px;" `);
  return new L.DivIcon({
    html: `<div class="marker-svg-wrapper${sel}" draggable="false">${scaledSvg}</div>`,
    iconSize:    [w, h],
    iconAnchor:  [ax, ay],
    popupAnchor: [0, -ay],
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
  customMarkerTypes = [],
  showLabels = true,
  bgColor = "#111d22",
  interactive = true,
}) {
  const [legendOpen, setLegendOpen] = useState(true);
  const bounds = [[0, 0], [1150, 950]];
  const mapImage = imageUrl || "/images/BlankMap.png";

  return (
    <div id="map-wrapper" style={{ "--map-bg": bgColor }}>
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        id="map-container"
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        zoomControl={interactive}
        keyboard={interactive}
      >
        <MapController
          onRightClick={onRightClick}
          onClearSelection={onClearSelection}
          drawingMode={drawingMode}
          onFreehandStart={onFreehandStart}
          onFreehandMove={onFreehandMove}
          onFreehandEnd={onFreehandEnd}
          bounds={bounds}
        />
        <ImageOverlay url={mapImage} bounds={bounds} />

        {data.map((marker, index) => {
          const markerSize = marker.size ?? 1;
          const isCustom = customMarkerTypes.some(ct => ct.id === marker.type);
          const baseCfg = isCustom ? { ay: 32 } : (ICON_CONFIGS[marker.type] ?? ICON_CONFIGS.SmallSettlement);
          // Keep a fixed 6px gap above the icon top regardless of scale
          const ttOffset = -(Math.round(baseCfg.ay * markerSize) + 6);
          return (
            <Marker
              key={marker.clientID ?? marker._id ?? index}
              position={marker.coords}
              icon={getIcon(marker.type, marker.clientID === selectedMarker, customMarkerTypes, markerSize)}
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
              {showLabels && (
                <Tooltip permanent direction="top" offset={[0, ttOffset]} className="marker-label">
                  {marker.popUp}
                </Tooltip>
              )}
              <Popup>{marker.popUp}</Popup>
            </Marker>
          );
        })}

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
        <button className="legend-toggle" onClick={() => setLegendOpen(p => !p)}>
          <h4>Legend</h4>
          <span className="legend-chevron">{legendOpen ? "▾" : "▸"}</span>
        </button>
        {legendOpen && (
          <>
            <div className="legend-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-32 -36 64 72" width="22" height="28" className="legend-svg">
                <path d="M -22 28 L -22 6 L -16 6 L -16 0 L -10 0 L -10 6 L -4 6 L -4 -6 L 4 -6 L 4 6 L 10 6 L 10 0 L 16 0 L 16 6 L 22 6 L 22 28 Z" fill="#f1e3c2" stroke="#2a1c0a" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M -22 6 L -20 6 L -20 3 L -17 3 L -17 6 M -13 6 L -13 3 L -10 3 L -10 6 M -4 -6 L -2 -6 L -2 -9 L 2 -9 L 2 -6 L 4 -6 M 10 6 L 10 3 L 13 3 L 13 6 M 17 6 L 17 3 L 20 3 L 20 6" fill="none" stroke="#2a1c0a" strokeWidth="1"/>
                <line x1="0" y1="-9" x2="0" y2="-22" stroke="#2a1c0a" strokeWidth="1.2"/>
                <path d="M 0 -22 L 10 -19 L 0 -16 Z" fill="#8a1818" stroke="#2a1c0a" strokeWidth="0.8"/>
              </svg>
              <span>Castle</span>
            </div>
            <div className="legend-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-22 -24 44 48" width="18" height="22" className="legend-svg">
                <path d="M -14 18 L -14 4 L 14 4 L 14 18 Z" fill="#f1e3c2" stroke="#2a1c0a" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M -14 4 L -12 4 L -12 1 L -9 1 L -9 4 M -5 4 L -5 1 L -2 1 L -2 4 M 2 4 L 2 1 L 5 1 L 5 4 M 9 4 L 9 1 L 12 1 L 12 4" fill="none" stroke="#2a1c0a" strokeWidth="0.9"/>
                <path d="M -5 4 L -5 -10 L 5 -10 L 5 4 Z" fill="#f1e3c2" stroke="#2a1c0a" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M -5 -10 L -3 -10 L -3 -13 L 3 -13 L 3 -10 L 5 -10" fill="none" stroke="#2a1c0a" strokeWidth="0.9"/>
              </svg>
              <span>Town</span>
            </div>
            <div className="legend-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="-13 -13 26 26" width="16" height="16" className="legend-svg">
                <path d="M -7 8 L -7 -1 L 0 -7 L 7 -1 L 7 8 Z" fill="#f1e3c2" stroke="#2a1c0a" strokeWidth="1.1" strokeLinejoin="round"/>
                <rect x="-1.5" y="3" width="3" height="5" fill="#2a1c0a" opacity="0.85"/>
              </svg>
              <span>Hut</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" />
              <span>Path / Road</span>
            </div>
            {customMarkerTypes.map(ct => (
              <div key={ct.id} className="legend-item">
                <img src={ct.imageUrl} alt={ct.name} />
                <span>{ct.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
