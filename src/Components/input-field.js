import React, { useState } from "react";
import { queryApi, waitForPlaylist } from "../libs/api-config";
import styles from "./input-field.module.css";

export default function InputField({
  onFormSubmit,
  isLoading,
  setLoading,
  response,
  user,
  setUser,
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
    const body = {
      message: [
        {
          role: "user",
          content: value,
        },
      ],
    };

    if (user) {
      body.user = user;
    }

    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/generate-playlist",
      body,
      "post"
    );

    console.log(`query response ${JSON.stringify(response)}`);
    const { user_id, playlist_id } = response;

    const playlist = JSON.parse(await waitForPlaylist(user_id, playlist_id));

    console.log(playlist);
    setLoading(false);
    setPlaylist(playlist_id);
    setRegenerate(true);
    setUser(user_id);
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
