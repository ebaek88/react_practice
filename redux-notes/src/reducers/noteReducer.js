import { createSlice, current } from "@reduxjs/toolkit";

const initialState = [
  {
    content: "reducer defines how redux store works",
    important: true,
    id: 1,
  },
  {
    content: "state of store can contain any data",
    important: false,
    id: 2,
  },
];

// Since the json-server automatically generates ids for new resources via POST request,
// generateId is no longer needed.
// const generateId = () => Number((Math.random() * 1000000).toFixed(0));

const noteSlice = createSlice({
  name: "notes",
  initialState: [],
  reducers: {
    createNote(state, action) {
      // "mutating" like using Array.push is possible when using Redux Toolkit,
      // since it utilizes Immer library inside.
      state.push(action.payload);
    },
    toggleImportanceOf(state, action) {
      const id = action.payload;
      const noteToChange = state.find((n) => n.id === id);
      // Not utilizing Immer and sticking to the immutability is still possible like below.
      const changedNote = {
        ...noteToChange,
        important: !noteToChange.important,
      };

      console.log(current(state));

      return state.map((note) => (note.id !== id ? note : changedNote));
    },
    appendNote(state, action) {
      return [...state, action.payload];
    },
    setNotes(state, action) {
      return action.payload;
    },
  },
});

export const { createNote, toggleImportanceOf, appendNote, setNotes } =
  noteSlice.actions;
export default noteSlice.reducer;
