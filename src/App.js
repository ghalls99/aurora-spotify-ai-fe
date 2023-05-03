import "./App.css";
import React, { useState } from "react";
import InputField from "./Components/input-field";
import SongList from "./Components/song-list";
import Spinner from "./Components/spinner";
import RegenerateButton from "./Components/large-button";

function App() {
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [user, setUser] = useState("");
  const [playlist, setPlaylist] = useState("");

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
        {isLoading ? <Spinner /> : <SongList items={response} />}
        <div className="App-inputs">
          <div className="input-wrapper">
            <InputField
              onFormSubmit={handleResponse}
              isLoading={isLoading}
              setLoading={setIsLoading}
              response={response}
              setUser={setUser}
              setPlaylist={setPlaylist}
              setRegenerate={setRegenerate}
            />
          </div>
          {regenerate && (
            <div>
              <RegenerateButton
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                currentUser={user}
                currentPlaylist={playlist}
                handleResponse={handleResponse}
                setResponse={setResponse}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
