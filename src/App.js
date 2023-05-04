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
import { queryApi, waitForPlaylist } from "./libs/api-config";
import { searchTracks } from "./scripts/spotify-requests";

function App() {
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [user, setUser] = useState("");
  const [playlist, setPlaylist] = useState("");
  const [code, setCode] = useState(null);
  const clientId = "f9d2df9fce1d4e1aaf11abe26c4543e6";

  const getAuth = useCallback(async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const originalCode = searchParams.get("code");
      setCode(originalCode);

      if (!originalCode) {
        console.log("we are here again");
        redirectToAuthCodeFlow(clientId);
      } else {
        console.log("we are now here");
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

  const handleRegenerate = async () => {
    setIsLoading(true);
    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/regenerate-playlist",
      { user_id: user, playlist_id: playlist },
      "post"
    );

    const { playlist_id } = response;

    console.log(String(user), String(playlist_id));

    const newPlaylist = JSON.parse(await waitForPlaylist(user, playlist_id));
    setIsLoading(false);
    handleResponse(newPlaylist);
  };

  const handleSpotifySearch = async () => {
    for (const item in response) {
      const id = await searchTracks(item);
    }
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
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="responses-body">
            <SongList items={response} />
            <RegenerateButton
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              currentUser={user}
              currentPlaylist={playlist}
              handleResponse={handleResponse}
              setResponse={setResponse}
              Name={"Export To Spotify"}
              loadingName={"Exporting..."}
            />
          </div>
        )}
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
              loadingName={"Loading..."}
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
                Name={"Regenerate Response"}
                handleClick={handleRegenerate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
