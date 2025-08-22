const assert = require("node:assert");
const { test, after, beforeEach, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app.js");
const helper = require("./test_helper.js");
const Note = require("../models/note.js");

const api = supertest(app);

describe("when there are initially some notes saved", () => {
  beforeEach(async () => {
    await Note.deleteMany({}); // delete all notes
    await helper.createInitialNote(); // add initial notes

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
    assert.strictEqual(response.body.length, 1);
  });

  test("a specific note is within the returned notes", async () => {
    const response = await api.get("/api/notes");
    // console.log(response.body);
    const contents = response.body.map((document) => document.content);
    const users = response.body.map((document) => document.user);
    assert(contents.includes("A new note with username ghong1987"));
    assert.strictEqual(users[0].id, helper.userId);
  });

  describe("viewing a specific note", () => {
    test("succeeds with a valid id", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToView = notesAtStart[notesAtStart.length - 1];
      // console.log(noteToView);
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      // console.log(resultNote.body);
      assert.deepStrictEqual(resultNote.body, {
        ...noteToView,
        user: helper.userId, // because the object directly returned from the database has ObjectId type for user property
      });
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

    test.only("fails with status code 401 and appropriate message if wrong login info", async () => {
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
      const notesAtStart = await helper.notesInDb();

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
      assert.strictEqual(notesAtEnd.length, notesAtStart.length + 1);

      const contents = notesAtEnd.map((note) => note.content);
      const users = notesAtEnd.map((note) => note.user.toString());
      // console.log(users);
      assert(contents.includes("async/await simplifies making async calls"));
      assert(users.includes(helper.userId));
    });

    test("fails with status code 401 if authentication token is missing", async () => {
      const newNote = {
        content: "trying to save a note without login info",
        important: true,
      };

      await api
        .post("/api/notes")
        .send(newNote)
        .expect(401, { error: "token nonexisting" });
    });

    test("fails with status code 400 and appropriate message if data invalid", async () => {
      const notesAtStart = await helper.notesInDb();

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

      assert.strictEqual(notesAtEnd.length, notesAtStart.length);
    });
  });

  describe("deletion of a note", () => {
    test("fails with status code 401 and appropriate message if authentication token is missing", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[notesAtStart.length - 1];
      // console.log(noteToDelete);

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(401, { error: "token nonexisting" });

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtStart.length, notesAtEnd.length);
    });

    test("fails with status code 401 and appropriate message if the logged in user and the note creator are not the same", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[notesAtStart.length - 1];
      // console.log(noteToDelete);

      const loginInfo = {
        username: "root",
        password: "sekret",
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(401, {
          error: "a note can be deleted only by the user who created it",
        });

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtStart.length, notesAtEnd.length);
    });

    test("succeeds with status code 204 if id is valid", async () => {
      const loginInfo = {
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[notesAtStart.length - 1];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      const notesAtEnd = await helper.notesInDb();

      const contents = notesAtEnd.map((note) => note.content);
      assert(!contents.includes(noteToDelete.content));

      assert.strictEqual(notesAtEnd.length, notesAtStart.length - 1);
    });
  });

  describe("update of an existing note", () => {
    test("fails with status code 401 and appropriate message if authentication token is missing", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToUpdate = notesAtStart[notesAtStart.length - 1];

      const editedNote = {
        ...noteToUpdate,
        content: "updated content",
        important: true,
      };

      await api
        .put(`/api/notes/${noteToUpdate.id}`)
        .send(editedNote)
        .expect(401, { error: "token nonexisting" });

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtStart.length, notesAtEnd.length);
    });

    test("fails with status code 401 and appropriate message if the logged in user and the note creator are not the same", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToUpdate = notesAtStart[notesAtStart.length - 1];

      const loginInfo = {
        username: "root",
        password: "sekret",
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      const editedNote = {
        ...noteToUpdate,
        content: "updated content",
        important: true,
        user: loginResponse.body.id,
      };

      await api
        .put(`/api/notes/${noteToUpdate.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(editedNote)
        .expect(401, {
          error: "a note can be updated only by the user who created it",
        });

      const notesAtEnd = await helper.notesInDb();
      assert.deepStrictEqual(notesAtStart, notesAtEnd);
    });

    test("fails with status code 404 if the note to update is missing", async () => {
      const falseNoteId = "68a3968fe9e5d2b874ccaa2e";

      const editedNote = {
        content: "not gonna work",
        important: false,
      };

      const loginInfo = {
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      await api
        .put(`/api/notes/${falseNoteId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(editedNote)
        .expect(404);
    });

    test("succeeds with status code 200 if valid user and valid existing note", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToUpdate = notesAtStart[notesAtStart.length - 1];

      const loginInfo = {
        username: helper.initialUser.username,
        password: helper.initialUser.password,
      };

      const loginResponse = await api.post("/api/login").send(loginInfo);
      const authToken = loginResponse.body.token;

      const editedNote = {
        ...noteToUpdate,
        content: "updated content",
        important: true,
        user: loginResponse.body.id,
      };

      const updatedNote = await api
        .put(`/api/notes/${noteToUpdate.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(editedNote)
        .expect(200);

      assert.deepStrictEqual(updatedNote.body, editedNote);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
