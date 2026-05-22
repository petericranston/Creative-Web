import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Map from "../components/map";
import { getStoredUser, clearStoredUser, storeUser } from "../auth";
import "../styles/homepage.css";

export default function Home() {
  const [user, setUser] = useState(getStoredUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [markers] = useState([
    { coords: [370, 780], popUp: "Kings Landing", type: "Capital" },
    { coords: [730, 520], popUp: "Winterfell", type: "LargeSettlement" },
    { coords: [330, 350], popUp: "High Garden", type: "SmallSettlement" },
    { coords: [450, 600], popUp: "Harrenhall", type: "SmallSettlement" },
  ]);

  useEffect(() => {
    async function getUser() {
      const response = await fetch("/api/user", { credentials: "include" });
      const data = await response.json();
      if (data.loggedIn) {
        setUser(data.username);
      } else {
        setUser(null);
        clearStoredUser();
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    const mode = searchParams.get("auth");
    if (mode === "login" || mode === "register") {
      setAuthMode(mode);
      setFormData({ username: "", password: "" });
      setError("");
      setShowAuth(true);
    }
  }, [searchParams]);

  function openAuth(mode) {
    setAuthMode(mode);
    setError("");
    setFormData({ username: "", password: "" });
    setShowAuth(true);
  }

  function closeAuth() {
    setShowAuth(false);
    setError("");
    setFormData({ username: "", password: "" });
    if (searchParams.get("auth")) setSearchParams({});
  }

  function switchMode(mode) {
    setAuthMode(mode);
    setError("");
    setFormData({ username: "", password: "" });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = authMode === "login" ? "/api/login" : "/api/register";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          authMode === "login"
            ? "Incorrect username or password."
            : data.message || "Registration failed. Please try again.",
        );
        return;
      }
      storeUser(formData.username);
      setUser(formData.username);
      window.dispatchEvent(new Event("auth-change"));
      closeAuth();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="home-page">
      <header>
        <h1>Myth Mapper</h1>
      </header>
      <main>
        {user ? <h2>Welcome, {user}</h2> : <h2>You&apos;re not logged in</h2>}
        {!user && (
          <button className="auth-open-btn" onClick={() => openAuth("login")}>
            Log in / Register
          </button>
        )}
        <h3>Create a map or explore other users worlds!</h3>
      </main>
      <Map data={markers} />

      {showAuth && (
        <div className="auth-overlay" onClick={closeAuth}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="auth-close"
              onClick={closeAuth}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="auth-slider">
              <div
                className={`auth-slider-thumb ${authMode === "register" ? "register" : ""}`}
              />
              <button
                className={`auth-tab ${authMode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
                type="button"
              >
                Login
              </button>
              <button
                className={`auth-tab ${authMode === "register" ? "active" : ""}`}
                onClick={() => switchMode("register")}
                type="button"
              >
                Register
              </button>
            </div>

            <form onSubmit={submit}>
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                autoFocus
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
              />
              {error && <p className="form-error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Registering..."
                  : authMode === "login"
                    ? "Login"
                    : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
