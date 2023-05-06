import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import stringSimilarity from "string-similarity";

const baseUrl = "https://api.spotify.com/v1";

export const searchTracks = async (track, token) => {
  console.log(`i made it here ${track}, ${token}`);
  const query = formatSearchParams(track);

  const axiosParams = {
    method: "GET",
    url: `${baseUrl}/search`,
    params: {
      q: `${encodeURIComponent(query)}`,
      type: "track",
      limit: 20,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await callAxios(axiosParams);

  console.log(`response ${JSON.stringify(response.tracks.items)}`);

  if (response.length === 0) {
    return "";
  }

  const bestMatchingSongIndex = findBestMatchingArtist(
    response.tracks.items,
    track.artist,
    0.5
  );

  console.log(`index ${bestMatchingSongIndex}`);

  console.log(
    "best matching track" +
      JSON.stringify(response.tracks.items[bestMatchingSongIndex])
  );

  return response.tracks.items[bestMatchingSongIndex].id;
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
    data: {
      uris: tracks,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  console.log(`adding tracks to playlist ${JSON.stringify(axiosParams)}`);

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
  return response.data;
};

const findBestMatchingArtist = (
  tracks,
  artistToFind,
  similarityThreshold = 0.7
) => {
  let artists = [];
  let subArtists = [];
  let currentFoundIndex = { target: "no-target", rating: 0, currentIndex: -1 };
  let index = 0;

  for (const track of tracks) {
    if (track.artists.length > 1) {
      for (const artist of track.artists) {
        subArtists.push(artist.name);
      }
      console.log(`here ${artistToFind} ${subArtists}`);
      const matchingArtist = stringSimilarity.findBestMatch(
        artistToFind,
        subArtists
      );
      if (
        matchingArtist.bestMatch.rating >= similarityThreshold &&
        currentFoundIndex.rating < matchingArtist.bestMatch.rating
      ) {
        currentFoundIndex = {
          ...matchingArtist.bestMatch,
          currentIndex: index,
        };
      }
    } else {
      console.log(`here ${artistToFind} ${track.artists[0].name}`);
      const match = stringSimilarity.compareTwoStrings(
        artistToFind,
        track.artists[0].name
      );

      if (match >= similarityThreshold && currentFoundIndex.rating < match) {
        artists.push(track.artists[0].name);
        currentFoundIndex = {
          target: track.artists[0].name,
          rating: match,
          currentIndex: index,
        };
      }
    }
    index = index + 1;
  }

  if (
    currentFoundIndex.currentIndex === -1 ||
    currentFoundIndex.target === "no-target"
  ) {
    console.log("no match");
    return 0;
  }

  return currentFoundIndex.currentIndex;
};
