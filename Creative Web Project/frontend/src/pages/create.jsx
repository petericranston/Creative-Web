import Map from "../components/map";
import "../styles/create.css";
export default function Create() {
  return (
    <div>
      <header>
        <h1>Create a map</h1>
      </header>
      <main>
        <button id="create-new-map">New Map</button>
        <Map />
      </main>
    </div>
  );
}
