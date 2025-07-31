import axios from "axios";
const baseUrl = "/api/notes";

const getAll = async () => {
  try {
    const response = await axios.get(baseUrl);
    // const nonExisting = {
    //   id: 10000,
    //   content: "This note is not saved to server",
    //   important: true,
    // };
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};

const create = (newObject) => {
  const request = axios.post(baseUrl, newObject);
  return request.then((response) => response.data);
};

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject);
  return request.then((response) => response.data);
};

const deleteNote = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

export default { getAll, create, update, deleteNote };
