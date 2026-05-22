import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeUser } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleUsername(e) {
    setFormData((prev) => ({ ...prev, username: e.target.value }));
  }
  function handlePassword(e) {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        setError("Incorrect username or password.");
        return;
      }

      storeUser(formData.username);
      setFormData({ username: "", password: "" });
      navigate("/");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header>
        <h1>Login</h1>
      </header>
      <main>
        <form onSubmit={submit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleUsername}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handlePassword}
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </main>
    </div>
  );
}
