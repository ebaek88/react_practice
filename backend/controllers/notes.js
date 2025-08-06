// A router object is an isolated instance of middleware and routes.
// You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
// Every Express application has a built-in app router.
// A router behaves like middleware itself, so you can use it as an argument to app.use() or as the argument to another router’s use() method.
// The top-level express object has a Router() method that creates a new router object.
// Once you’ve created a router object, you can add middleware and HTTP method routes (such as get, put, post, and so on) to it just like an application.
// You can then use a router for a particular root URL in this way separating your routes into files or even mini-apps.

const notesRouter = require("express").Router();
const Note = require("../models/note.js");

// Adding HTTP method routes, just like an application.
notesRouter.get("/", (req, res, next) => {
  console.log("GET /api/notes called");
  Note.find({})
    .then((notes) => {
      res.json(notes); // .json() will send the notes array that was passed to it as a JSON formatted string.
      // Express automatically sets the Content-type header with the appropriate value of application/json.
    })
    .catch((err) => next(err));
});

notesRouter.get("/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

notesRouter.post("/", (req, res, next) => {
  const body = req.body;

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note
    .save()
    .then((savedNote) => {
      res.json(savedNote);
    })
    .catch((err) => next(err));
});

notesRouter.delete("/:id", (req, res, next) => {
  Note.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

notesRouter.put("/:id", (req, res, next) => {
  const { content, important } = req.body;

  Note.findById(req.params.id)
    .then((note) => {
      if (!note) {
        return res.status(404).end();
      }

      note.content = content;
      note.important = important;

      return note.save();
    })
    .then((updatedNote) => {
      res.json(updatedNote);
    })
    .catch((err) => next(err));
});

module.exports = notesRouter;
