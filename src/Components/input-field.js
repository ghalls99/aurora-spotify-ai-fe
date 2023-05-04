import React, { useState } from "react";
import { queryApi, waitForPlaylist } from "../libs/api-config";
import styles from "./input-field.module.css";

export default function InputField({
  onFormSubmit,
  isLoading,
  setLoading,
  response,
  user,
  setPlaylist,
  setRegenerate,
}) {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/generate-playlist",
      {
        user_id: user,
        message: [
          {
            role: "user",
            content: value,
          },
        ],
      },
      "post"
    );

    console.log(`query response ${JSON.stringify(response)}`);
    const { playlist_id } = response;

    const playlist = JSON.parse(await waitForPlaylist(user, playlist_id));

    console.log(playlist);
    setLoading(false);
    setPlaylist(playlist_id);
    setRegenerate(true);
    onFormSubmit(playlist);
    // handle the form submission here
  };
  return (
    <div className={styles["form-container"]}>
      <input
        type="text"
        value={value}
        placeholder="Give me your playlist ideas"
        onChange={handleChange}
        className={styles["form-input"]}
      />
      <button
        type="submit"
        className={styles["form-submit"]}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
