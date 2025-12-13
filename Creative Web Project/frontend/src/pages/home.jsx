import { useEffect, useState } from "react";
import Map from "../components/map";

export default function Home() {
  const [user, setUser] = useState(null);

  const [markers, setMarkers] = useState([
    {
      coords: [370, 780],
      popUp: "Kings Landing",
    },
    {
      coords: [730, 520],
      popUp: "Winterfell",
    },
    {
      coords: [330, 350],
      popUp: "High Garden",
    },
    {
      coords: [450, 600],
      popUp: "Harrenhall",
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
      <main>{user ? <p>Welcome, {user}</p> : <p>Your not logged in</p>}</main>
      <Map data={markers} />
    </div>
  );
}
