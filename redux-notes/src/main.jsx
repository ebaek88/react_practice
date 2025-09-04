import React from "react";
import ReactDom from "react-dom/client";
import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";

import App from "./App.jsx";
import noteReducer, { createNote } from "./reducers/noteReducer.js";
import filterReducer, { filterChange } from "./reducers/filterReducer.js";

const reducer = combineReducers({
  notes: noteReducer,
  filter: filterReducer,
});

const store = createStore(reducer);

console.log(store.getState());

store.subscribe(() => console.log(store.getState()));
// store.dispatch(filterChange("IMPORTANT"));
store.dispatch(
  createNote("combineReducers forms one reducer from many simple reducers")
);

ReactDom.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
