import { useState, useEffect, useRef } from "react";
import noteService from "./services/notes.js";
import loginService from "./services/login.js";
import Note from "./components/Note.jsx";
import Notification from "./components/Notification.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./components/Login.jsx";
import NoteForm from "./components/NoteForm.jsx";
import Togglable from "./components/Togglable.jsx";

// The error object structure is specific to Axios
const App = () => {
  const [notes, setNotes] = useState(null);
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [user, setUser] = useState(null);

  // For useEffect, callbacks need to be synchronous in order to prevent race condition.
  // In order to use async functions as callbacks, wrap them around synch ones.
  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialNotes = await noteService.getAll();
        setNotes(initialNotes);
      } catch (error) {
        console.error(error.response.status);
        console.error(error.response.data);
        showNotification(
          `Notes cannot be fetched from the server: ${error.response.data.error}`
        );
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedNoteappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      noteService.setToken(user.token);
    }
  }, []);

  // Reference to the NoteForm component
  const noteFormRef = useRef();

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
  const addNote = async (noteObject) => {
    noteFormRef.current.toggleVisibility();
    try {
      const returnedNote = await noteService.create(noteObject);
      setNotes(notes.concat(returnedNote));
      showNotification(`Added note ${returnedNote.content} successfully!`);
    } catch (error) {
      console.error(error.response.status);
      console.error(error.response.data);
      showNotification(
        `Notes cannot be added to the server: ${error.response.data.error}`
      );
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
  // const handleNoteChange = (evt) => {
  //   setNewNote(evt.target.value);
  // };

  // Changing the important property of a note and updating it
  const toggleImportanceOf = async (id) => {
    const note = notes.find((note) => note.id === id);
    const changedNote = { ...note, important: !note.important };

    try {
      const returnedNote = await noteService.update(id, changedNote);
      showNotification(`Updated the note ${note.content} successfully!`);
      setNotes(notes.map((note) => (note.id === id ? returnedNote : note)));
    } catch (error) {
      console.error(error.response.status);
      console.error(error.response.data);
      if (error.response.status === 404) {
        showNotification(`The note ${note.content} has already been removed.`);
        setNotes(notes.filter((note) => note.id !== id));
      } else {
        showNotification(
          `Cannot be updated from the server: ${error.response.data.error}`
        );
      }
    }
    // noteService
    //   .update(id, changedNote)
    //   .then((returnedNote) => {
    //     setNotes(notes.map((note) => (note.id === id ? returnedNote : note)));
    //   })
    //   .catch((error) => {
    //     console.log(error.message);
    //     showNotification(
    //       `Note '${note.content}' was already removed from server`
    //     );
    //     setNotes(notes.filter((note) => note.id !== id));
    //   });
  };

  // Deleting a note
  const deleteNote = async (id) => {
    const note = notes.find((note) => note.id === id);
    if (!note) return;

    try {
      await noteService.deleteNote(id);
      showNotification(`Deleted note ${note.content} successfully!`);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      if (error.response.status === 404) {
        showNotification(`The note ${note.content} has already been removed.`);
        setNotes(notes.filter((note) => note.id !== id));
      } else {
        showNotification(
          `Cannot be deleted from the server: ${error.response.data.error}`
        );
      }
    }
    // noteService
    //   .deleteNote(id)
    //   .then(showNotification(`Deleted note ${note.content} successfully!`))
    //   .catch((error) => {
    //     console.log(error.message);
    //     showNotification(
    //       `Note '${note.content}' was already removed from server`
    //     );
    //   })
    //   .finally(() => {
    //     setNotes(notes.filter((note) => note.id !== id));
    //   });
  };

  // Function to filter important notes only or to reset the filter
  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  // Handler for user login
  const handleLogin = async (loginObject) => {
    try {
      const user = await loginService.login(loginObject);
      if (!user) return; // when the login failed, user becomes undefined

      window.localStorage.setItem("loggedNoteappUser", JSON.stringify(user));
      noteService.setToken(user.token);
      setUser(user);
      showNotification(`Welcome ${user.username}!`);
    } catch (error) {
      console.error(error.response.status);
      console.error(error.response.data);
      showNotification(`wrong credentials: ${error.response.data.error}`);
    }
  };

  // Handler for logout
  const logoutHandler = () => {
    window.localStorage.clear();
    setUser(null);
    showNotification("Logged out successfully!");
  };

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {/* conditionally rendering the login form and the new note form */}
      {!user && (
        <Togglable buttonLabel={"login"}>
          <Login handleLogin={handleLogin} />
        </Togglable>
      )}
      {user && (
        <div>
          <p>
            {user.name} logged in
            <button onClick={logoutHandler}>logout</button>
          </p>
          <Togglable buttonLabel={"new note"} ref={noteFormRef}>
            <NoteForm createNote={addNote} />
          </Togglable>
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
