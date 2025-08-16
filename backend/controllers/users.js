const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user.js");

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;
  // 비밀번호는 8~60자로 되어야 합니다. 영문 대문자, 숫자, ~!@#$%^&* 각각 적어도 1개 포함. 영문 소문자 포함 가능.
  const passwordCondition =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@#$%^&*])[A-Za-z0-9~!@#$%^&*]{8,60}$/;
  if (!passwordCondition.test(password)) {
    return response
      .status(400)
      .json({ error: "The password did not meet the condition!" });
  }

  const saltRounds = 10;

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (request, response, next) => {
  try {
    const users = await User.find({}).populate("notes", {
      content: 1,
      important: 1,
    });
    response.json(users);
  } catch (error) {
    next(error);
  }
});

module.exports = usersRouter;
