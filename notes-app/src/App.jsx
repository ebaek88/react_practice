import { useState, useEffect } from "react";
import noteService from "./services/notes.js";
import Note from "./components/Note.jsx";
import Notification from "./components/Notification.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
  const [notes, setNotes] = useState(null);
  const [newNote, setNewNote] = useState("a new note...");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    noteService
      .getAll()
      .then((initialNotes) => {
        setNotes(initialNotes);
      })
      .catch((error) => console.log(error.message));
  }, []);
  // shows that useEffect is executed asynchronously
  // console.log("render", notes.length, "notes"); //render 0 notes -> render 4 notes

  // Do not render anything if notes is still null.
  // This conditional rendering is useful in cases where it is impossible to define the
  // state so that the initial rendering is possible.
  if (!notes) {
    return null;
  }

  const showNotification = (msg, timeout = 3000) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, timeout);
  };

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
      // id: String(notes.length + 1), <- now the DB takes care of it
    };

    noteService
      .create(noteObject)
      .then((returnedNote) => {
        // console.log(returnedNote);
        setNotes(notes.concat(returnedNote));
        setNewNote("");
      })
      .catch((error) => {
        console.log(error.response.data.error);
        showNotification(error.response.data.error);
      });
  };

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  };

  const toggleImportanceOf = (id) => {
    const note = notes.find((note) => note.id === id);
    const changedNote = { ...note, important: !note.important };

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id === id ? returnedNote : note)));
      })
      .catch((error) => {
        console.log(error.message);
        showNotification(
          `Note '${note.content}' was already removed from server`
        );
        setNotes(notes.filter((note) => note.id !== id));
      });
  };

  const deleteNote = (id) => {
    const note = notes.find((note) => note.id === id);
    if (!note) return;

    noteService
      .deleteNote(id)
      .then(showNotification(`Deleted note ${note.content} successfully!`))
      .catch((error) => {
        console.log(error.message);
        showNotification(
          `Note '${note.content}' was already removed from server`
        );
      })
      .finally(() => {
        setNotes(notes.filter((note) => note.id !== id));
      });
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
            deleteNote={() => deleteNote(note.id)}
          />
        ))}
      </ul>
      <form onSubmit={addNote}>
        <input type="text" value={newNote} onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
      <Footer />
    </div>
  );
};

export default App;
