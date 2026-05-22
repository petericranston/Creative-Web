import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStoredUser, clearStoredUser } from "../auth";
import "../styles/navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialise instantly from localStorage — no flicker on refresh
  const [loggedIn, setLoggedIn] = useState(!!getStoredUser());

  useEffect(() => {
    // Verify with the server in the background and sync if out of date
    fetch("/api/user", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setLoggedIn(data.loggedIn);
        if (!data.loggedIn) clearStoredUser();
      });
  }, [location.pathname]);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      clearStoredUser();
      if (window.location.pathname === "/") {
        window.location.reload();
      } else {
        navigate("/");
      }
    } catch {
      console.log("Error logging out");
    }
  };

  return (
    <nav>
      <Link to="/">Home</Link>
      <span>|</span>
      <Link to="/login">Login</Link>
      <span>|</span>
      <Link to="/register">Register</Link>
      <span>|</span>
      {loggedIn && <><Link to="/create">Create</Link><span>|</span></>}
      <Link to="/viewOthers">View Others' Maps</Link>
      <span>|</span>
      <button id="logoutBtn" onClick={logout}>Logout</button>
    </nav>
  );
}
