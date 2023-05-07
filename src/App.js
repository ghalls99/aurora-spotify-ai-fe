import "./App.css";
import React, { useCallback, useEffect, useState, useRef } from "react";
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
import {
  addTracksToPlaylist,
  createPlaylist,
  searchTracks,
} from "./scripts/spotify-requests";
import { Alert, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function App() {
  //setting up the states
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [user, setUser] = useState("");
  const [playlist, setPlaylist] = useState("");
  const [token, setToken] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = useState(false);

  //Spotify client
  const clientId = "f9d2df9fce1d4e1aaf11abe26c4543e6";

  //Initializing web app. Also looking for playlists that have already existed on refresh
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const playlistData =
      JSON.parse(localStorage.getItem("playlist")) || response;
    const didClickExport = JSON.parse(localStorage.getItem("attemptedExport"));
    const accessToken = localStorage.getItem("token");

    setToken(accessToken || undefined);
    setResponse(playlistData || undefined);

    console.log("token " + accessToken);
    console.log("playlistData " + JSON.stringify(playlistData));
    const fetchData = async () => {
      try {
        if (playlistData && searchParams.has("code")) {
          // Check for code parameter

          setResponse(playlistData);
          if (didClickExport) {
            localStorage.removeItem("attemptedExport");

            async function spotifyWrapper() {
              await handleSpotifyExport();
            }
            spotifyWrapper();
          }
        } else {
          localStorage.removeItem("playlist");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [playlist]); // Add searchParams to dependencies

  //Initial playlist handler
  const handleResponse = (responseData) => {
    setOpen(false);
    setResponse(responseData);
    localStorage.setItem("playlist", JSON.stringify(responseData));
    setToastMessage("Successfully retrieved list");
    setOpen(true);
    setRegenerate(true);
  };

  const handleRegenerate = async () => {
    setOpen(false);
    setIsLoading(true);
    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/regenerate-playlist",
      { user_id: user, playlist_id: playlist },
      "post"
    );

    const { playlist_id } = response;

    console.log(String(user), String(playlist_id));
    //Playlist is generated in it's own handler. Hitting the api every six seconds for finished results
    const newPlaylist = JSON.parse(await waitForPlaylist(user, playlist_id));
    setIsLoading(false);
    handleResponse(newPlaylist);
    sessionStorage.setItem("playlist", JSON.stringify(newPlaylist));
    setToastMessage("Successfully regenerated list");
    setOpen(true);
  };

  const handleSpotifyExport = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const oldToken = localStorage.getItem("token");

    setIsExporting(true);
    const playlistData =
      JSON.parse(localStorage.getItem("playlist")) || response;

    console.log(`playlistData ${JSON.stringify(playlistData)}`);

    const updatePlaylist = async (token) => {
      console.log(`accessToken ${token}`);
      const { id } = await fetchProfile(token);

      // Loop through all the names of the provided songs and find their respective ids
      const ids = await Promise.all(
        playlistData.map(async (item) => {
          const trackId = await searchTracks(item, token);
          return trackId;
        })
      );
      const allIds = ids.flat().filter((id) => {
        return id.trim() !== "";
      });

      //Actually creating the playlist
      const { playlistId } = await createPlaylist(id, token);
      const exported = await addTracksToPlaylist(allIds, token, playlistId);

      console.log("we exported " + exported);

      if (exported) {
        console.log("I am exporting " + exported);
        setToastMessage(
          "Successfully exported to Spotify. Go to your Spotify app listen to your playlist."
        );
        setOpen(true);
      }

      setIsLoading(false);
      setIsExporting(false);
      localStorage.removeItem("attemptedExport");
    };

    if (code && !oldToken) {
      const { access_token, expires_in } = await getAccessToken(clientId, code);
      console.log(`new token ${access_token}`);
      setToken(access_token);
      localStorage.setItem("token", access_token);
      localStorage.setItem(
        "tokenExpiration",
        Date.now() + parseInt(expires_in) * 1000
      );
      updatePlaylist(access_token);
    } else if ((!code && oldToken) || (code && oldToken)) {
      const expiration = localStorage.getItem("tokenExpiration");
      const currentTime = Date.now();

      if (expiration && parseInt(expiration) < currentTime) {
        redirectToAuthCodeFlow(clientId);
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
      } else {
        setToken(oldToken);
        updatePlaylist(oldToken);
      }
    } else {
      localStorage.setItem("playlist", JSON.stringify(playlistData));
      localStorage.setItem("attemptedExport", true);
      redirectToAuthCodeFlow(clientId);
    }

    setOpen(false);
  };

  const handleExportClick = () => {
    handleSpotifyExport();
  };

  //The app itself
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
        <div className="alerts">
          {open && (
            <Collapse in={open}>
              <Alert
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {toastMessage}
              </Alert>
            </Collapse>
          )}
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="responses-body">
            <div>
              <SongList items={response} />
            </div>
            {response.length > 0 && (
              <div>
                <RegenerateButton
                  isLoading={isExporting}
                  name={"Export To Spotify"}
                  loadingName={"Exporting..."}
                  handleClick={handleExportClick}
                />
              </div>
            )}
          </div>
        )}
        <div className="App-inputs">
          <div className="input-wrapper">
            <InputField
              onFormSubmit={handleResponse}
              isLoading={isLoading}
              setLoading={setIsLoading}
              response={response}
              user={user}
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
                user={user}
                name={"Regenerate Response"}
                loadingName={"Regenerating..."}
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
