import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" }); //Variable to store user data

  //Handles the data the user sent in through the fields
  function handleUsername(e) {
    setFormData((prev) => ({ ...prev, username: e.target.value }));
  }
  function handlePassword(e) {
    setFormData((prev) => ({ ...prev, password: e.target.value }));
  }

  async function submit(e) {
    //Sends data through
    e.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        console.log("Login Failed");
        return;
      }

      const data = await response.json();
      setFormData({ username: "", password: "" });
      navigate("/");
      console.log("User Logged In");
    } catch (error) {
      console.log("Login Failed: ", error);
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
          <button type="submit">Login</button>
        </form>
      </main>
    </div>
  );
}
