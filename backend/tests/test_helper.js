const Note = require("../models/note.js");
const User = require("../models/user.js");

const initialUser = {
  username: "ghong1987",
  name: "Gildong Hong",
  password: "Tlqkf5678#",
};

const userId = "68a37225d36bc2ecceafb4a0";

// const initialNotes = [];
const createInitialNote = async () => {
  const note = new Note({
    content: "A new note with username ghong1987",
    important: false,
    user: userId,
  });

  await note.save();
  return note._id.toString();
};

const nonExistingId = async () => {
  const note = new Note({ content: "willremovethissoon" });
  await note.save();
  await note.deleteOne();

  return note._id.toString();
};

const notesInDb = async () => {
  const notes = await Note.find({});
  return notes.map((note) => note.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialUser,
  userId,
  createInitialNote,
  nonExistingId,
  notesInDb,
  usersInDb,
};
