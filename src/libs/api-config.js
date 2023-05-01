import axios from "axios";

export const queryApi = async (url, body = {}, method, headers = {}) => {
  const options = {
    url,
    method,
    timeout: 180000,
    data: { ...body },
    headers,
  };
  console.log(options);
  const res = await axios(options);
  return res.data;
};
