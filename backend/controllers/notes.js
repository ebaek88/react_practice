// A router object is an isolated instance of middleware and routes.
// You can think of it as a “mini-application,” capable only of performing middleware and routing functions.
// Every Express application has a built-in app router.
// A router behaves like middleware itself, so you can use it as an argument to app.use() or as the argument to another router’s use() method.
// The top-level express object has a Router() method that creates a new router object.
// Once you’ve created a router object, you can add middleware and HTTP method routes (such as get, put, post, and so on) to it just like an application.
// You can then use a router for a particular root URL in this way separating your routes into files or even mini-apps.

const notesRouter = require("express").Router();
const Note = require("../models/note.js");
const middleware = require("../utils/middleware.js");

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

notesRouter.post("/", middleware.userExtractor, async (req, res, next) => {
  const body = req.body;

  try {
    // Retrieve information about the logged in user from the userExtractor middleware
    const user = req.user;

    const note = new Note({
      content: body.content,
      important: body.important || false,
      user: user._id,
    });

    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();

    res.status(201).json(savedNote);
  } catch (err) {
    next(err);
  }
});

notesRouter.delete("/:id", middleware.userExtractor, async (req, res, next) => {
  try {
    // Retrieve information about the logged in user from the userExtractor middleware
    const user = req.user;

    // Check if the note to be deleted has been created by the user logged in
    const noteToDelete = await Note.findById(req.params.id);
    if (noteToDelete.user.toString() !== user.id) {
      return res.status(401).json({
        error: "a note can be deleted only by the user who created it",
      });
    }

    // Delete the note
    await Note.findByIdAndDelete(req.params.id);
    // Then, delete the note from the notes array in the user document
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

notesRouter.put("/:id", middleware.userExtractor, async (req, res, next) => {
  try {
    // Retrieve information about the logged in user from the userExtractor middleware
    const user = req.user;

    const noteToUpdate = await Note.findById(req.params.id);

    if (!noteToUpdate) {
      return res.status(404).end();
    }

    // Check if the note to be updated has been created by the user logged in
    if (noteToUpdate.user.toString() !== user.id) {
      return res.status(401).json({
        error: "a note can be updated only by the user who created it",
      });
    }

    const { content, important } = req.body;

    noteToUpdate.content = content;
    noteToUpdate.important = important;

    const updatedNote = await noteToUpdate.save();
    user.notes = user.notes.concat(updatedNote._id);
    await user.save();

    res.json(updatedNote);
  } catch (err) {
    next(err);
  }
});

module.exports = notesRouter;
