import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storeUser } from "../auth";

export default function Register() {
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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
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
        <h1>Register</h1>
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </main>
    </div>
  );
}
