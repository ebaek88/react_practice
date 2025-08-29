const { test, describe, expect, beforeEach } = require("@playwright/test");

describe("Note app", () => {
  beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
  });

  test("front page can be opened", async ({ page }) => {
    const locator = page.getByText("Notes");
    await expect(locator).toBeVisible();
    await expect(
      page.getByText(
        "Note app, Department of Computer Science, University of Helsinki 2025"
      )
    ).toBeVisible();
  });

  test("user can log in", async ({ page }) => {
    await page.getByRole("button", { name: "login" }).click();
    await page.getByLabel("username").fill("mluukkai");
    await page.getByLabel("password").fill("Q1w2e3r4!");
    await page.getByRole("button", { name: "login" }).click();
    await expect(page.getByText("Matti Luukkainen logged in")).toBeVisible();
  });

  describe("when logged in", () => {
    beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "login" }).click();
      await page.getByLabel("username").fill("mluukkai");
      await page.getByLabel("password").fill("Q1w2e3r4!");
      await page.getByRole("button", { name: "login" }).click();
    });

    test("a new note can be created", async ({ page }) => {
      await page.getByRole("button", { name: "new note" }).click();
      await page.getByRole("textbox").fill("a note created by playwright");
      await page.getByRole("button", { name: "save" }).click();
      // Find the note in the list items
      const noteItem = page
        .getByRole("listitem")
        .filter({ hasText: "a note created by playwright" });
      await expect(noteItem).toBeVisible();
    });
  });
});
