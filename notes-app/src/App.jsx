import { useState, useEffect } from "react";
import noteService from "./services/notes.js";
import loginService from "./services/login.js";
import Note from "./components/Note.jsx";
import Notification from "./components/Notification.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./components/Login.jsx";
import NewNote from "./components/NewNote.jsx";

const App = () => {
  const [notes, setNotes] = useState(null);
  const [newNote, setNewNote] = useState("a new note...");
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // Callbacks need to be synchronous in order to prevent race condition.
  // In order to use async functions as callbacks, wrap them around synch ones.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialNotes = await noteService.getAll();
        setNotes(initialNotes);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
  }, []);

  // Do not render anything if notes is still null.
  // This conditional rendering is useful in cases where it is impossible to define the
  // state so that the initial rendering is possible.
  if (!notes) {
    return null;
  }

  // Helper function to render Notification component
  const showNotification = (msg, timeout = 3000) => {
    setErrorMessage(msg);
    setTimeout(() => {
      setErrorMessage(null);
    }, timeout);
  };

  // Adding a new note
  const addNote = async (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
      // id: String(notes.length + 1), <- now the DB takes care of it
    };

    try {
      const returnedNote = await noteService.create(noteObject);
      setNotes(notes.concat(returnedNote));
      setNewNote("");
      showNotification(`Added note ${returnedNote.content} successfully!`);
    } catch (error) {
      console.log(error.response.data.error);
      showNotification(error.response.data.error);
    }
    // noteService
    //   .create(noteObject)
    //   .then((returnedNote) => {
    //     // console.log(returnedNote);
    //     setNotes(notes.concat(returnedNote));
    //     setNewNote("");
    //     showNotification(`Added note ${returnedNote.content} successfully!`);
    //   })
    //   .catch((error) => {
    //     console.log(error.response.data.error);
    //     showNotification(error.response.data.error);
    //   });
  };

  // Handler when a new note is being typed
  const handleNoteChange = (evt) => {
    setNewNote(evt.target.value);
  };

  // Changing the important property of a note and updating it
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

  // Deleting a note
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

  // Function to filter important notes only or to reset the filter
  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  // Handler for user login
  const handleLogin = async (evt) => {
    evt.preventDefault();

    try {
      const user = await loginService.login({ username, password });
      setUser(user);
      setUsername("");
      setPassword("");
      showNotification(`Welcome ${user.username}!`);
    } catch (error) {
      showNotification("wrong credentials");
      console.error(error.response.data.error);
    }
  };

  // Handlers for username and password changes
  const handleUsernameChange = (evt) => {
    setUsername(evt.target.value);
  };

  const handlePasswordChange = (evt) => {
    setPassword(evt.target.value);
  };

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {/* conditionally rendering the login form and the new note form */}
      {!user && (
        <Login
          username={username}
          password={password}
          handleLogin={handleLogin}
          handleUsernameChange={handleUsernameChange}
          handlePasswordChange={handlePasswordChange}
        />
      )}
      {user && (
        <div>
          <p>{user.name} logged in</p>
          <NewNote
            newNote={newNote}
            handleNoteChange={handleNoteChange}
            addNote={addNote}
          />
        </div>
      )}

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
      <Footer />
    </div>
  );
};

export default App;
