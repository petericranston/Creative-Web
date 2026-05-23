import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Map from "../components/map";
import { getStoredUser, clearStoredUser, storeUser } from "../auth";
import "../styles/homepage.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const passwordRef = useRef(null);

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
      const storedName = data.username ?? formData.username;
      storeUser(storedName);
      setUser(storedName);
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

      <main className="hero-content">
        {user && (
          <p className="hero-welcome">
            Welcome back, <strong>{user}</strong>
          </p>
        )}
        <p className="hero-tagline">Build worlds. Tell stories.</p>
        <div className="hero-ctas">
          {user ? (
            <>
              <button className="btn-hero-primary" onClick={() => navigate("/create")}>My Maps</button>
              <button className="btn-hero-secondary" onClick={() => navigate("/viewOthers")}>Explore Maps</button>
            </>
          ) : (
            <>
              <button className="btn-hero-primary" onClick={() => openAuth("register")}>Get Started</button>
              <button className="btn-hero-secondary" onClick={() => openAuth("login")}>Log In</button>
            </>
          )}
        </div>
      </main>

      <div className="home-map-wrapper">
        <span className="map-example-badge">Example map</span>
        <Map data={markers} interactive={false} />
      </div>

      <section className="features">
        <div className="feature-card">
          <h3>Create</h3>
          <p>Draw custom fantasy maps with markers and paths over your own artwork.</p>
        </div>
        <div className="feature-card">
          <h3>Customise</h3>
          <p>Name settlements, trace roads, and design your own marker types.</p>
        </div>
        <div className="feature-card">
          <h3>Share</h3>
          <p>Publish your world for others to discover and explore.</p>
        </div>
      </section>

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
                onKeyDown={(e) => e.key === "Enter" && passwordRef.current?.focus()}
                autoFocus
              />
              <input
                ref={passwordRef}
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && submit(e)}
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
