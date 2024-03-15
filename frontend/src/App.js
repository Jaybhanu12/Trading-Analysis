import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadFile from "./component/UploadFile";
import Dashboard from "./component/Dashboard";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Dashboard />}></Route>
          <Route exact path="/UploadFiles" element={<UploadFile />}></Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
