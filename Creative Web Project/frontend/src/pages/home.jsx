import { useEffect, useState } from "react";
import Map from "../components/map";

export default function Home() {
  const [user, setUser] = useState(null);

  const [markers, setMarkers] = useState([
    {
      coords: [370, 780],
      popUp: "Kings Landing",
      type: "basicIcon",
    },
    {
      coords: [730, 520],
      popUp: "Winterfell",
      type: "basicIcon",
    },
    {
      coords: [330, 350],
      popUp: "High Garden",
      type: "basicIcon",
    },
    {
      coords: [450, 600],
      popUp: "Harrenhall",
      type: "basicIcon",
    },
  ]);

  useEffect(() => {
    async function getUser() {
      const response = await fetch("/api/user");
      const data = await response.json();
      if (data.loggedIn) {
        setUser(data.username);
      }
    }
    getUser();
  }, []);

  return (
    <div>
      <header>
        <h1>Home Page</h1>
      </header>
      <main>
        {user ? <h2>Welcome, {user}</h2> : <h2>Your not logged in</h2>}
        <h3>Create you own world!</h3>
        <h3>Or explore other users worlds!</h3>
      </main>
      <Map data={markers} />
    </div>
  );
}
