const jwt = require("jsonwebtoken");
const logger = require("./logger.js");
const User = require("../models/user.js");

const requestLogger = (req, res, next) => {
  logger.info("Method: ", req.method);
  logger.info("Path: ", req.path);
  logger.info("Body: ", req.body);
  logger.info("---");

  next();
};

const userExtractor = async (request, response, next) => {
  const authorization = request.get("authorization");
  if (!(authorization && authorization.startsWith("Bearer "))) {
    return response.status(401).json({ error: "token nonexisting" });
  }
  const token = authorization.replace("Bearer ", "");
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }

  try {
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response
        .status(400)
        .json({ error: "userId missing or not valid" });
    }
    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (err.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  } else if (
    err.name === "MongoServerError" &&
    err.message.includes("E11000 duplicate key error")
  ) {
    return res.status(400).json({ error: "expected 'username' to be unique" });
  } else if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "token invalid" });
  } else if (err.name === "TokenExpiredError") {
    return res.status(401).json({ error: "token expired" });
  }

  next(err);
};

module.exports = {
  userExtractor,
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
