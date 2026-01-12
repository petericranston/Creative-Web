import { useEffect, useState } from "react";
import Map from "../components/map";
import "../styles/homepage.css";

export default function Home() {
  const [user, setUser] = useState(null);

  const [markers, setMarkers] = useState([
    //Creating a array of markers to be sent through the component
    {
      coords: [370, 780],
      popUp: "Kings Landing",
      type: "Capital",
    },
    {
      coords: [730, 520],
      popUp: "Winterfell",
      type: "LargeSettlement",
    },
    {
      coords: [330, 350],
      popUp: "High Garden",
      type: "SmallSettlement",
    },
    {
      coords: [450, 600],
      popUp: "Harrenhall",
      type: "SmallSettlement",
    },
  ]);

  useEffect(() => {
    //Checking if the user is logged in to be used on the home page to change some text
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
    <div id="home-page">
      <header>
        <h1>Myth Mapper</h1>
      </header>
      <main>
        {user ? <h2>Welcome, {user}</h2> : <h2>Your not logged in</h2>}
        <h3>Log in to create you own world!</h3>
        <h3>Or explore other users worlds!</h3>
      </main>
      <Map data={markers} />
    </div>
  );
}
