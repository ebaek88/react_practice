import React from "react";
import ReactDom from "react-dom/client";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import App from "./App.jsx";
// import noteService from "./services/notes.js";
import noteReducer, { setNotes } from "./reducers/noteReducer.js";
import filterReducer from "./reducers/filterReducer.js";

const store = configureStore({
  reducer: {
    notes: noteReducer,
    filter: filterReducer,
  },
});

// noteService.getAll().then((notes) => store.dispatch(setNotes(notes)));

console.log(store.getState());

ReactDom.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
