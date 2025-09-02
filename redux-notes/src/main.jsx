import React from "react";
import ReactDom from "react-dom/client";
import { createStore } from "redux";
import { Provider } from "react-redux";

import App from "./App.jsx";
import noteReducer from "./reducers/noteReducer.js";

const store = createStore(noteReducer);

ReactDom.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
