import { useEffect, useState } from "react";
export default function Home() {
  const [user, setUser] = useState(null);

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
      <h1>Home Page</h1>
      {user ? <p>Welcome, {user}</p> : <p>Your not logged in</p>}
    </div>
  );
}
