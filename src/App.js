import "./App.css";
import React, { useState } from "react";
import InputField from "./Components/input-field";
import SongList from "./Components/song-list";

function App() {
  const [response, setResponse] = useState(null);

  const handleResponse = (responseData) => {
    setResponse(responseData);
  };

  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <ul>
            <li>
              <a href="https://www.google.com">Home</a>
            </li>
            <li>
              <a href="https://www.google.com">About</a>
            </li>
            <li>
              <a href="https://www.google.com">Services</a>
            </li>
            <li>
              <a href="https://www.google.com">Contact</a>
            </li>
          </ul>
        </nav>
      </header>
      <div className="App-body">
        {response ? (
          <SongList items={response} />
        ) : (
          <div>{<h1>PlAIylist</h1>}</div>
        )}
        <InputField onFormSubmit={handleResponse} />
      </div>
    </div>
  );
}

export default App;
