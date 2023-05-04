import Button from "@mui/material/Button";
import { queryApi, waitForPlaylist } from "../libs/api-config";

export default function RegenerateButton({
  handleResponse,
  currentUser,
  currentPlaylist,
  isLoading,
  setIsLoading,
  Name,
  loadingName,
  handleClick,
}) {
  return (
    <>
      {isLoading ? (
        <Button variant="outlined">{loadingName}</Button>
      ) : (
        <Button variant="contained" onClick={handleClick}>
          {Name}
        </Button>
      )}
    </>
  );
}
