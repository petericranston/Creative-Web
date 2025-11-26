import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  async function submit(error) {
    error.preventDefault();
    const response = await fetch("api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={submit}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
