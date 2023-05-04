import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import InputField from "./Components/input-field";
import SongList from "./Components/song-list";
import Spinner from "./Components/spinner";
import RegenerateButton from "./Components/large-button";
import {
  getAccessToken,
  redirectToAuthCodeFlow,
  fetchProfile,
} from "./scripts/authorize-spotify";

function App() {
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [user, setUser] = useState("");
  const [playlist, setPlaylist] = useState("");
  const [code, setCode] = useState(null);
  const clientId = "f9d2df9fce1d4e1aaf11abe26c4543e6"; // Replace with your client ID

  const getAuth = useCallback(async () => {
    try {
      if (!code) {
        redirectToAuthCodeFlow(clientId);
        const searchParams = new URLSearchParams(window.location.search);
        const newCode = searchParams.get("code");
        console.log(newCode);
        if (newCode) {
          setCode(newCode); // update the code state variable
        }
      } else {
        const accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        console.log(profile);
      }
    } catch (error) {
      console.log(error);
    }
  }, [code]);

  useEffect(() => {
    setIsLoading(true);
    getAuth();
    setIsLoading(false);
  }, [getAuth, setIsLoading]);

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
