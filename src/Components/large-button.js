import Button from "@mui/material/Button";

export default function RegenerateButton({
  isLoading,
  name,
  loadingName,
  handleClick,
}) {
  return (
    <>
      {isLoading ? (
        <Button variant="outlined">{loadingName}</Button>
      ) : (
        <Button variant="contained" onClick={handleClick}>
          {name}
        </Button>
      )}
    </>
  );
}
