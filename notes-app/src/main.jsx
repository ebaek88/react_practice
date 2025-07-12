import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";

const promise = axios.get("http://localhost:3001/notes");
promise.then((res) => {
  console.log(res);
});

// If using fetch
// const getJsonData = async (url) => {
//   try {
//     const data = await readUrl(url);
//     console.log(data);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const readUrl = async (url) => {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`${response.status}: ${response.statusText}`);
//     }
//     const json = await response.json();
//     return json;
//   } catch (error) {
//     return error;
//   }
// };

// getJsonData("http://localhost:3001/notes");
// getJsonData("http://localhost:3001/foobar");

const notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

ReactDOM.createRoot(document.getElementById("root")).render(
  <App notes={notes} />
);
