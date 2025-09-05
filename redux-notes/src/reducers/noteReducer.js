import { createSlice, current } from "@reduxjs/toolkit";
import noteService from "../services/notes.js";

// const initialState = [
//   {
//     content: "reducer defines how redux store works",
//     important: true,
//     id: 1,
//   },
//   {
//     content: "state of store can contain any data",
//     important: false,
//     id: 2,
//   },
// ];

// Since the json-server automatically generates ids for new resources via POST request,
// generateId is no longer needed.
// const generateId = () => Number((Math.random() * 1000000).toFixed(0));

const noteSlice = createSlice({
  name: "notes",
  initialState: [],
  reducers: {
    // toggleImportanceOf(state, action) {
    //   const id = action.payload;
    //   const noteToChange = state.find((n) => n.id === id);
    //   // Not utilizing Immer and sticking to the immutability is still possible like below.
    //   const changedNote = {
    //     ...noteToChange,
    //     important: !noteToChange.important,
    //   };

    //   console.log(current(state));

    //   return state.map((note) => (note.id !== id ? note : changedNote));
    // },
    appendNote(state, action) {
      return [...state, action.payload];
    },
    setNotes(state, action) {
      return action.payload;
    },
  },
});

export const { appendNote, setNotes } = noteSlice.actions;

export const initializeNotes = () => {
  return async (dispatch) => {
    const notes = await noteService.getAll();
    dispatch(setNotes(notes));
  };
};

export const createNote = (content) => {
  return async (dispatch) => {
    const newNote = await noteService.createNew(content);
    dispatch(appendNote(newNote));
  };
};

export const toggleImportanceOf = (id) => {
  return async (dispatch) => {
    const notes = await noteService.getAll();
    const [noteToUpdate] = notes.filter((note) => note.id === id);
    if (noteToUpdate) {
      const updatedNote = {
        ...noteToUpdate,
        important: !noteToUpdate.important,
      };

      const result = await noteService.update(id, updatedNote);
      const updateNotes = notes.map((note) => (note.id !== id ? note : result));
      dispatch(setNotes(updateNotes));
    }
  };
};

export default noteSlice.reducer;
