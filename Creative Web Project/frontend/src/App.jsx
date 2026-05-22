// import React, { useEffect, useState } from "react";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
        <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
        <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
        <Route path="/create" element={<Create />} />
        <Route path="/viewOthers" element={<ViewOthers />} />
      </Routes>
    </Router>
  );
}

export default App;
