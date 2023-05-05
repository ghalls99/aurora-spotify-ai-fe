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
  const [code, setCode] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = useState(false);

  //Spotify client
  const clientId = "f9d2df9fce1d4e1aaf11abe26c4543e6";
  let TTL = 30000; // 10 minutes

  //Authorizing spotify
  const getAuth = useCallback(async () => {
    try {
      localStorage.setItem("exported", true);
      const searchParams = new URLSearchParams(window.location.search);
      const originalCode = searchParams.get("code");
      setCode(originalCode);

      if (!originalCode) {
        console.log("we are here again");
        redirectToAuthCodeFlow(clientId);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  //Initializing web app. Also looking for playlists that have already existed on refresh
  useEffect(() => {
    const playlistData = JSON.parse(sessionStorage.getItem("playlist"));
    const didClickExport = JSON.parse(localStorage.getItem("exported"));

    if (playlistData) {
      const { data, timestamp } = playlistData;
      const now = Date.now();

      if (now - timestamp < TTL) {
        setResponse(data);
        handleSpotifyExport();
        localStorage.removeItem("exported");
      } else {
        sessionStorage.removeItem("playlist");
      }
    }
  }, []);

  //Initial playlist handler
  const handleResponse = (responseData) => {
    console.log(`we are currently here ${responseData} ${user}`);
    setResponse(responseData);
    const now = Date.now();
    const playlistData = { data: responseData, timestamp: now };
    sessionStorage.setItem("playlist", JSON.stringify(playlistData));
    setToastMessage("Successfully retrieved list");
    setOpen(true);
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
    //Playlist is generated in it's own handler. Hitting the api every six seconds for finished results
    const newPlaylist = JSON.parse(await waitForPlaylist(user, playlist_id));
    setIsLoading(false);
    handleResponse(newPlaylist);
    sessionStorage.setItem("playlist", JSON.stringify(newPlaylist));
    TTL = 30000;
    setToastMessage("Successfully regenerated list");
    setOpen(true);
  };

  //Spotify export handler
  const handleSpotifyExport = async () => {
    setIsExporting(true);
    const playlistData = JSON.parse(sessionStorage.getItem("playlist"));

    console.log(JSON.stringify(playlistData));

    const searchParams = new URLSearchParams(window.location.search);

    const originalCode = searchParams.get("code") || "";
    setCode(originalCode);

    if (!originalCode) {
      redirectToAuthCodeFlow(clientId);
      return;
    }

    const accessToken = await getAccessToken(clientId, originalCode);
    const { id } = await fetchProfile(accessToken);

    // Loop through all the names of the provided songs and find their respective ids
    const ids = await Promise.all(
      playlistData.data.map(async (item) => {
        const trackId = await searchTracks(item, accessToken);
        console.log(`track id ${trackId}`);
        return trackId;
      })
    );
    const allIds = ids.flat();

    //Actually creating the playlist
    const { playlistId } = await createPlaylist(id, accessToken);
    const exported = await addTracksToPlaylist(allIds, accessToken, playlistId);

    if (exported) {
      console.log(exported);
      setToastMessage("Successfully exported to Spotify");
      setOpen(true);
    }

    setIsExporting(false);
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
                  handleClick={() => {
                    setIsLoading(true);
                    getAuth().then(() => {
                      setIsLoading(false);
                      handleSpotifyExport();
                    });
                  }}
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
