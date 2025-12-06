import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = async () => {
    //Logout function
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    if (window.location.pathname === "/") {
      window.location.reload(); //Reloading page if the user is already on the home page
    } else {
      navigate("/"); //Sending user to home page if they aren't already on it
    }
  };
  return (
    //Nav buttons
    <nav>
      <Link to="/">Home</Link> | <Link to="/login">Login</Link> |{" "}
      <Link to="/register">Register</Link> |{" "}
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
