const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // 사용자 ID는 3~20자 사이의 영문+숫자로 이루어져야 하며 영문으로 시작되어야 합니다.
  username: {
    type: String,
    minLength: [3, "The username should be at least 3 characters long!"],
    maxLength: [20, "The username cannot be more than 20 characters long!"],
    validate: {
      validator: (v) => {
        return /^([a-zA-Z]{1})([a-zA-Z0-9]{2,20})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid username!`,
    },
    required: [true, "Username required!"],
    unique: true, // this ensures the uniqueness of username
  },
  // 닉네임은 2~8자 이내여야 합니다.
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
