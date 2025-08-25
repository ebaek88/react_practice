import axios from "axios";
const baseUrl = "/api/login";

// For error handling, you don't need to handle errors here.
// The errors will be thrown to App.jsx and it will handle them.
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials);
  return response.data;
};

export default { login };
