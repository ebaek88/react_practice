require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./utils/logger.js");

// if (process.argv.length < 3) {
//   console.log("give password as argument");
//   process.exit(1);
// }

// const password = process.argv[2];

// const url = `mongodb+srv://fullstack:${password}@cluster0.yjvbxla.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;
const url = process.env.TEST_MONGODB_URI;

mongoose
  .connect(url)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((err) => {
    logger.error("error connecting to MongoDB: ", err.message);
  });

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

// Adding notes
const note0 = new Note({
  content: "HTML is easy",
  important: true,
});

const note1 = new Note({
  content: "CSS is hard",
  important: true,
});

// const note2 = new Note({
//   content: "Mongoose makes things easy",
//   important: true,
// });

Promise.all([note0.save(), note1.save()])
  .then((result) => {
    console.log("all notes saved!");
    // mongoose.connection.close();
  })
  .catch((err) => console.log(err.message))
  .finally(() => mongoose.connection.close());

// Retrieving notes
// Note.find({ important: false })
//   .then((result) => {
//     if (result.length === 0) {
//       throw new Error("No note meeting the conditions is found!");
//     }
//     result.forEach((note) => {
//       console.log(note);
//     });
//     // mongoose.connection.close();
//   })
//   .catch((err) => console.log(err.message))
//   .finally(() => mongoose.connection.close());
