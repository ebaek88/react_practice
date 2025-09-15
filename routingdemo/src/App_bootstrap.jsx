import { useState, useRef } from "react";
import { Table, Form, Button, Alert, Navbar, Nav } from "react-bootstrap";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useMatch,
} from "react-router-dom";

const Home = () => (
  <div>
    <h2>TKTL notes app</h2>
    <p>
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry's standard dummy text ever since the
      1500s, when an unknown printer took a gallery of type and scrambled it to
      make a type specimen book. It has survived not only five centuries, but
      also the leap into electronic typesetting, remaining essentially
      unchanged. It was popularised in the 1960s with the release of Letraset
      sheets containing Lorem Ipsum passages, and more recently with desktop
      publishing software like Aldus PageMaker including versions of Lorem
      Ipsum.
    </p>
  </div>
);

const Note = ({ note }) => {
  // const id = useParams().id;
  // const note = notes.find((n) => n.id === Number(id));
  return (
    <>
      {note ? (
        <div>
          <h2>{note.content}</h2>
          <div>{note.user}</div>
          <div>
            <strong>{note.important ? "important" : ""}</strong>
          </div>
        </div>
      ) : (
        <h2>note not found 🤔</h2>
      )}
    </>
  );
};

const Notes = ({ notes }) => (
  <div>
    <h2>Notes</h2>
    <Table striped hover>
      <tbody>
        {notes.map((note) => (
          <tr key={note.id}>
            <td>
              <Link to={`/notes/${note.id}`}>{note.content}</Link>
            </td>
            <td>{note.user}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

const Users = () => (
  <div>
    <h2>TKTL notes app</h2>
    <ul>
      <li>Matti Luukkainen</li>
      <li>Juha Tauriainen</li>
      <li>Arto Hellas</li>
    </ul>
  </div>
);

const Login = (props) => {
  const navigate = useNavigate();

  const onSubmit = (evt) => {
    evt.preventDefault();
    props.onLogin("mluukkai");
    navigate("/");
  };

  return (
    <div>
      <h2>login</h2>
      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>username:</Form.Label>
          <Form.Control type="text" name="username" />
        </Form.Group>
        <Form.Group>
          <Form.Label>password:</Form.Label>
          <Form.Control type="password" />
        </Form.Group>
        <Button className="mt-3" variant="primary" type="submit">
          login
        </Button>
      </Form>
    </div>
  );
};

const App = () => {
  const [notes, setNotes] = useState([
    {
      id: 1,
      content: "HTML is easy",
      important: true,
      user: "Matti Luukkainen",
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false,
      user: "Matti Luukkainen",
    },
    {
      id: 3,
      content: "Most important methods of HTTP-protocol are GET and POST",
      important: true,
      user: "Arto Hellas",
    },
  ]);

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);

  const notiTimeoutId = useRef(null);

  const login = (user) => {
    setUser(user);
    clearTimeout(notiTimeoutId.current);
    setMessage(`welcome ${user}`);
    notiTimeoutId.current = setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const padding = {
    padding: 5,
  };

  const match = useMatch("/notes/:id");
  const note = match
    ? notes.find((note) => note.id === Number(match.params.id))
    : null;

  return (
    <div className="container">
      {message && (
        <Alert className="m-1" variant="success">
          {message}
        </Alert>
      )}
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" as="span">
              <Link style={padding} to="/">
                home
              </Link>
            </Nav.Link>
            <Nav.Link href="#" as="span">
              <Link style={padding} to="/notes">
                notes
              </Link>
            </Nav.Link>
            <Nav.Link href="#" as="span">
              <Link style={padding} to="/users">
                users
              </Link>
            </Nav.Link>
            <Nav.Link href="#" as="span">
              {user ? (
                <em style={padding}>{user} logged in</em>
              ) : (
                <Link style={padding} to="/login">
                  login
                </Link>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Routes>
        <Route path="/notes/:id" element={<Note note={note} />} />
        <Route path="/notes" element={<Notes notes={notes} />} />
        <Route
          path="/users"
          element={user ? <Users /> : <Navigate replace to="/login" />}
        />
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/" element={<Home />} />
      </Routes>

      <footer>
        <br />
        <em>Note app, Department of Computer Science 2025</em>
      </footer>
    </div>
  );
};

export default App;
