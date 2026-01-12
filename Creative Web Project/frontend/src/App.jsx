// import React, { useEffect, useState } from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Create from "./pages/create";
import Navbar from "./components/navbar";
import ViewOthers from "./pages/viewOthers";

function App() {
  //Nav bar
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<Create />} />
        <Route path="/viewOthers" element={<ViewOthers />} />
      </Routes>
    </Router>
  );
}

export default App;
