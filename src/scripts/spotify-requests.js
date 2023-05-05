import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const baseUrl = "https://api.spotify.com/v1";

export const searchTracks = async (track, token) => {
  const query = formatSearchParams(track);

  console.log(query);

  const axiosParams = {
    method: "GET",
    url: `${baseUrl}/search`,
    params: {
      q: `${encodeURI(query)}`,
      type: "track",
      limit: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(`getting track ${JSON.stringify(axiosParams)}`);

  const response = await callAxios(axiosParams);

  console.log(JSON.stringify(response));

  return response.tracks.items[0].id;
};

export const addTracksToPlaylist = async (ids, token, playlistId) => {
  console.log();
  //const queryString = formatQueryString(ids);
  const tracks = convertIdsToSpotifyURI(ids);
  const string = tracks.join(",");

  console.log(`tracsk and string ${tracks} ${string}`);

  const axiosParams = {
    method: "POST",
    url: `${baseUrl}/playlists/${playlistId}/tracks`,
    body: {
      uris: tracks,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(
    toString(`adding tracks to playlist ${JSON.stringify(axiosParams)}`)
  );

  const { snapshot_id } = await callAxios(axiosParams);

  return snapshot_id;
};

export const createPlaylist = async (user_id, token) => {
  const axiosParams = {
    method: "POST",
    url: `${baseUrl}/users/${user_id}/playlists`,
    data: {
      name: JSON.stringify(uuidv4()),
      description: "New Ai Generated Playlist",
      public: false,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(`axios data ${JSON.stringify(axiosParams)}`);
  const { id } = await callAxios(axiosParams);
  return { playlistId: id };
};

function formatSearchParams(params) {
  console.log(params);
  const { song, title, artist } = params;
  let formattedSong = song || title || "";
  return `remaster track:${formattedSong} artist:${artist}`;
}

const convertIdsToSpotifyURI = (ids) => {
  const fixedIds = ids.map((id) => {
    return `spotify:track:${id}`;
  });

  return fixedIds;
};

/*const formatQueryString = (ids) => {
  const encodedIds = ids.map((id) => encodeURIComponent(id));
  return encodedIds.join("%20");
};*/

export const callAxios = async (params) => {
  const response = await axios(params);
  if (response.error || response.statusCode >= 400) {
    console.log(response.error || "error with the request");
    return response.error || "error with the request";
  }
  console.log(`axios data ${JSON.stringify(response.data)}`);
  return response.data;
};
