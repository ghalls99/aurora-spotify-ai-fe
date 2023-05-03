import Button from "@mui/material/Button";
import { queryApi, waitForPlaylist } from "../libs/api-config";

export default function RegenerateButton({
  handleResponse,
  currentUser,
  currentPlaylist,
  isLoading,
  setIsLoading,
}) {
  const handleClick = async () => {
    setIsLoading(true);
    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/regenerate-playlist",
      { user_id: currentUser, playlist_id: currentPlaylist },
      "post"
    );

    const { playlist_id } = response;

    console.log(String(currentUser), String(playlist_id));

    const playlist = JSON.parse(
      await waitForPlaylist(currentUser, playlist_id)
    );
    setIsLoading(false);
    handleResponse(playlist);
  };
  return (
    <>
      {isLoading ? (
        <Button variant="outlined">Loading...</Button>
      ) : (
        <Button variant="contained" onClick={handleClick}>
          Regenerate Response
        </Button>
      )}
    </>
  );
}
