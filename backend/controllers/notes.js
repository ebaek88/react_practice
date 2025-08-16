// A router object is an isolated instance of middleware and routes.
// You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
// Every Express application has a built-in app router.
// A router behaves like middleware itself, so you can use it as an argument to app.use() or as the argument to another router’s use() method.
// The top-level express object has a Router() method that creates a new router object.
// Once you’ve created a router object, you can add middleware and HTTP method routes (such as get, put, post, and so on) to it just like an application.
// You can then use a router for a particular root URL in this way separating your routes into files or even mini-apps.

const notesRouter = require("express").Router();
const Note = require("../models/note.js");
const User = require("../models/user.js");

// Adding HTTP method routes, just like an application.
notesRouter.get("/", async (req, res, next) => {
  try {
    const notes = await Note.find({}).populate("user", {
      username: 1,
      name: 1,
    });
    res.json(notes); // .json() will send the notes array that was passed to it as a JSON formatted string.
    // Express automatically sets the Content-type header with the appropriate value of application/json.
  } catch (err) {
    next(err);
  }
});

notesRouter.get("/:id", async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    note ? res.json(note) : res.status(404).end();
  } catch (err) {
    next(err);
  }
});

notesRouter.post("/", async (req, res, next) => {
  const body = req.body;

  const user = await User.findById(body.userId);

  if (!user) {
    return res.status(400).json({ error: "userId missing or not valid" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id,
  });

  try {
    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    res.status(201).json(savedNote);
  } catch (err) {
    next(err);
  }
});

notesRouter.delete("/:id", async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

notesRouter.put("/:id", async (req, res, next) => {
  const { content, important } = req.body;

  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).end();
    }

    note.content = content;
    note.important = important;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    next(err);
  }
});

module.exports = notesRouter;
