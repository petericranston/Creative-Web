import Map from "../components/map";
import "../styles/create.css";
export default function Create() {
  return (
    <div>
      <header>
        <h1>Create a map</h1>
      </header>
      <main>
        <button className="create-buttons">New Map</button>
        <button className="create-buttons">My Maps</button>
        <div id="map-edits">
          <Map />
        </div>
      </main>
    </div>
  );
}
