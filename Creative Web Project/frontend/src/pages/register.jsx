import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  function handleUsername(e) {
    setFormData((prev) => ({ ...prev, username: e.target.value }));
  }
  function handlePassword(e) {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
  }

  return (
    <div>
      <h1>Register</h1>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
