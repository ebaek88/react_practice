import { useState } from "react";

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState("a new note...");

  const addNote = (evt) => {
    evt.preventDefault();
    createNote({
      content: newNote,
      important: true,
    });

    setNewNote("");
  };

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          type="text"
          value={newNote}
          onChange={(evt) => setNewNote(evt.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default NoteForm;
