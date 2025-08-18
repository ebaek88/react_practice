const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app.js");
const helper = require("./test_helper.js");
const Note = require("../models/note.js");
const User = require("../models/user.js");

const api = supertest(app);

describe("when there are initially some notes saved", () => {
  beforeEach(async () => {
    await Note.deleteMany({}); // delete all notes
    await Note.insertMany(helper.initialNotes); // add initial notes
    await User.deleteOne({ username: "ghong1987" }); // delete the previously created user
    await api.post("/api/users").send({
      // create a user same as the previously created one
      username: helper.initialUser.username,
      password: helper.initialUser.password,
    });
    // Same as
    // const noteObjects = helper.initialNotes.map((note) => new Note(note));
    // const promiseArray = noteObjects.map((note) => note.save());
    // await Promise.all(promiseArray);
  });

  test.only("notes are returned as json", async () => {
    console.log("entered test");
    await api
      .get("/api/notes")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test.only("all notes are returned", async () => {
    const response = await api.get("/api/notes");

    assert.strictEqual(response.body.length, helper.initialNotes.length);
  });

  test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");
    const contents = response.body.map((document) => document.content);
    assert(contents.includes("HTML is easy"));
  });

  describe("viewing a specific note", () => {
    test("succeeds with a valid id", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToView = notesAtStart[0];
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      assert.deepStrictEqual(resultNote.body, noteToView);
    });

    test("fails with statuscode 404 if note does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/notes/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api.get(`/api/notes/${invalidId}`).expect(400);
    });
  });

  describe("login", () => {
    test.only("succeeds with proper login info", async () => {
      const loginInfo = {
        username: helper.initialUser.username,
        name: helper.initialUser.name,
        password: helper.initialUser.password,
      };

      await api
        .post("/api/login")
        .send(loginInfo)
        .expect(200)
        .expect("Content-type", /application\/json/);
    });

    test.only("fails with status code 401 and appropriate message", async () => {
      const loginInfo = {
        username: "wrongid1234",
        password: helper.initialUser.password,
      };

      await api
        .post("/api/login")
        .send(loginInfo)
        .expect(401, { error: "invalid username or password" });
    });
  });

  describe("addition of a new note", () => {
    test("succeeds with valid data", async () => {
      const loginInfo = {
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      const newNote = {
        content: "async/await simplifies making async calls",
        important: true,
      };

      await api
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

      const contents = notesAtEnd.map((n) => n.content);
      assert(contents.includes("async/await simplifies making async calls"));
    });

    test("fails with status code 401 if authentication token is missing", async () => {
      const newNote = {
        content: "trying to save a note without login info",
        important: true,
      };

      await api
        .post("/api/notes")
        .send(newNote)
        .expect(401, { error: "token invalid" });
    });

    test("fails with status code 400 and appropriate message if data invalid", async () => {
      const loginInfo = {
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      const newNote = {
        important: true,
      };

      await api
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(newNote)
        .expect(400, {
          error: "Note validation failed: content: Content is missing!",
        });

      const notesAtEnd = await helper.notesInDb();

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
    });
  });

  describe("deletion of a note", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[0];

      await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

      const notesAtEnd = await helper.notesInDb();

      const contents = notesAtEnd.map((n) => n.content);
      assert(!contents.includes(noteToDelete.content));

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
