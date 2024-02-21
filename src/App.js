import "./styles.css";

import React from "react";
import AudioPlayer from "./AudioPlayer"; // Assuming AudioPlayer.js is in the same directory

function App() {
  return (
    <div className="App">
      <h1>Audio Player</h1>
      <AudioPlayer />
    </div>
  );
}

export default App;
