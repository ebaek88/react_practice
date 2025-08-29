const express = require("express");
const mongoose = require("mongoose");
const config = require("./utils/config.js");
const logger = require("./utils/logger.js");
const middleware = require("./utils/middleware.js");
const notesRouter = require("./controllers/notes.js");
const usersRouter = require("./controllers/users.js");
const loginRouter = require("./controllers/login.js");

const app = express();

logger.info("connecting to", config.MONGODB_URI);

// mongoose.set("strictQuery", false);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((err) => {
    logger.error("error connecting to MongoDB: ", err.message);
  });

app.use(express.static("dist"));
// json-parser should be loaded before requestLogger, because
// otherwise request.body will not be initialized when the logger is executed.
app.use(express.json());
app.use(middleware.requestLogger);

// Now, the HTTP route methods inside notesRouter such as .get("/:id", ...)
// will work as .get("/api/notes/:id", ...), since app takes the router into use.
app.use("/api/notes", notesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing.js");
  app.use("/api/testing", testingRouter);
}

// The middleware for handling unsupported routes should be loaded AFTER the route handlers.
// Otherwise, it will respond to all requests with 404 unknown endpoint!
app.use(middleware.unknownEndpoint);
// This error handler has to be the LAST loaded middleware, also all the routes should be registered before this!
app.use(middleware.errorHandler);

module.exports = app;
