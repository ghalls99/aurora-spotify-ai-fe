import axios from "axios";

export const queryApi = async (url, body = {}, method, headers = {}) => {
  const options = {
    url,
    method,
    data: { ...body },
    headers,
  };
  console.log(options);
  const res = await axios(options);
  return res.data;
};

export const waitForPlaylist = async (user_id, playlist_id) => {
  const response = await queryApi(
    "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/pull-generated-playlist",
    { user_id, playlist_id },
    "POST"
  );

  console.log(`waiting response ${JSON.stringify(response)}`);

  if (!response.playlist && !response.error) {
    console.log("playlist still processing");
    await wait(6000);
    return await waitForPlaylist(user_id, playlist_id);
  }

  const { playlist } = response;

  console.log(JSON.stringify(playlist));
  return playlist;
};

export const wait = (timeToWait) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Timeout finished");
      resolve();
    }, timeToWait);
  });
};
