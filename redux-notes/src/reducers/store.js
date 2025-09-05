import { configureStore } from "@reduxjs/toolkit";
import noteReducer from "./noteReducer.js";
import filterReducer from "./filterReducer.js";

const store = configureStore({
  reducer: {
    notes: noteReducer,
    filter: filterReducer,
  },
});

export default store;
