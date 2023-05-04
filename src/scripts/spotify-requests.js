import axios from "axios";

export const searchTracks = async (track, token) => {
  const query = formatSearchParams(track);

  console.log(query);

  const axiosParams = {
    method: "GET",
    url: query,
    params: {
      q: query,
      type: "album",
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios(axiosParams);
  if (response.error) {
    console.log(response.error);
  }
  return response.data;
};

function formatSearchParams(params) {
  console.log(params);
  const { song, title, artist } = params;
  let formattedSong = song || title || "";
  formattedSong = formattedSong.replace(/\s+/g, "%20");
  const formattedArtist = artist.replace(/\s+/g, "%20");
  return `remaster%20track:${formattedSong}%20artist:${formattedArtist}`;
}
