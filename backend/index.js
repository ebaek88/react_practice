require("dotenv").config();
const express = require("express");
const Note = require("./models/note.js");
// const cors = require("cors");

// Express setup
const app = express();
// app.use(cors({ origin: "*" }));
app.use(express.static("dist"));

// middleware
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:", request.path);
  console.log("Body:", request.body);
  console.log("---");
  next();
};

// json-parser should be loaded before requestLogger, because
// otherwise request.body will not be initialized when the logger is executed.
app.use(express.json());
app.use(requestLogger);

// route handlers
app.get("/", (request, response) => {
  // Since the parameter is a string, Express automatically sets the value of the Content-type header to be text/html.
  // The status code of the response defaults to 200.
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({})
    .then((notes) => {
      response.json(notes); // .json() will send the notes array that was passed to it as a JSON formatted string.
      // Express automatically sets the Content-type header with the appropriate value of application/json.
    })
    .catch((err) => {
      console.log(err.message);
    });
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  // if (!body.content) {
  //   return response.status(400).json({
  //     error: "content missing",
  //   });
  // } <- now validators from Mongoose will take care of it

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((err) => next(err));
});

app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note.findById(request.params.id)
    .then((note) => {
      if (!note) {
        return response.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save().then((updatedNote) => {
        response.json(updatedNote);
      });
    })
    .catch((error) => next(error));
});

// The middleware for handling unsupported routes should be loaded AFTER the route handlers.
// Otherwise, it will respond to all requests with 404 unknown endpoint!
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

// Error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
app.use(errorHandler); // this error handler has to be the LAST loaded middleware, also all the routes should be registered before this!

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
