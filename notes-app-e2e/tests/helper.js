const loginWith = async (page, username, password) => {
  await page.getByRole("button", { name: "login" }).click();
  await page.getByLabel("username").fill(username);
  await page.getByLabel("password").fill(password);
  await page.getByRole("button", { name: "login" }).click();
};

const createNote = async (page, content) => {
  await page.getByRole("button", { name: "new note" }).click();
  await page.getByRole("textbox").fill(content);
  await page.getByRole("button", { name: "save" }).click();
  // waitFor() is called, since in the test, createNote is called async.
  // Then, when the test creates one note, it starts creating the next one
  // even before the server has responded and before the the added note is rendered on the screen.
  // This in turn can cause some notes to be lost.
  // Therefore, we can "slow down" the insert operation, so that it waits for the inserted note to render
  // before starting a new one.
  await page
    .getByRole("listitem")
    .filter({ hasText: `${content}` })
    .waitFor();
};

export { loginWith, createNote };
