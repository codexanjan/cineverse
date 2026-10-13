import { test, expect } from "@playwright/test";

test("landing, categories, account persistence and watch journal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Life’s too short for just okay movies.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore genres" }).click();
  await expect(page.locator(".category-tile")).toHaveCount(19);
  await page.getByLabel("Search categories").fill("Animation");
  await page.locator(".category-tile").click();
  await expect(page.getByLabel("Category", { exact: true })).toHaveValue(
    "Animation",
  );
  await expect(page.locator(".movie").first()).toBeVisible();
  await page.getByLabel("Maximum runtime").selectOption("90");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".movie").first()).toBeVisible();
  await page.goto("/login?mode=signup");
  const email = `browser-${Date.now()}@example.com`;
  await page.getByLabel("Your name").fill("Cinema Explorer");
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Cineverse-test-2026!");
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(page).toHaveURL(/\/discover/);
  await page
    .getByRole("button", { name: "Explore Forrest Gump", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark as watched", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Mark unwatched", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close movie" }).click();
  await page.getByRole("button", { name: "Account", exact: true }).click();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Cineverse-test-2026!");
  await page.getByRole("button", { name: "Let me in" }).click();
  await expect(page).toHaveURL(/\/discover/);
  await page
    .getByRole("button", { name: "Watch journal", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore Forrest Gump", exact: true })
    .click();
  await page
    .getByRole("button", { name: "More like this", exact: true })
    .click();
  await expect(page.locator(".movie")).toHaveCount(24);
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
  await page.goto("/profile");
  await page.getByLabel("Current password").fill("Cineverse-test-2026!");
  await page.getByLabel("New password").fill("Cineverse-updated-2026!");
  await page
    .getByRole("button", { name: "Change password", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Password changed");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Cineverse-updated-2026!");
  await page.getByRole("button", { name: "Let me in" }).click();
  await expect(page).toHaveURL(/\/discover/);
});

test("new pages fit mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const url of ["/", "/login", "/categories"]) {
    await page.goto(url);
    await expect(page.locator("h1,h2").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
