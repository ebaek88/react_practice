import React from "react";
import ReactDom from "react-dom/client";
import { Provider } from "react-redux";
import store from "./reducers/store.js";
import App from "./App.jsx";

ReactDom.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
