const router = require("express").Router();
const Note = require("../models/note.js");
const User = require("../models/user.js");

router.post("/reset", async (req, res) => {
  await Note.deleteMany({});
  await User.deleteMany({});

  res.status(204).end();
});

module.exports = router;
