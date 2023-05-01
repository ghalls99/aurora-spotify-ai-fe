import React, { useState } from "react";
import { queryApi } from "../libs/api-config";
import styles from "./input-field.module.css";
export default function InputField({ onFormSubmit }) {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await queryApi(
      "https://et0kdemqlh.execute-api.us-east-1.amazonaws.com/generate-playlist",
      {
        message: [
          {
            role: "user",
            content: value,
          },
        ],
      },
      "post"
    );
    console.log(response);
    onFormSubmit(response);
    // handle the form submission here
  };

  return (
    <form onSubmit={handleSubmit} className={styles["form-container"]}>
      <input
        type="text"
        value={value}
        placeholder="Give me your playlist ideas"
        onChange={handleChange}
        className={styles["form-input"]}
      />
      <button type="submit" className={styles["form-submit"]}>
        Submit
      </button>
    </form>
  );
}
