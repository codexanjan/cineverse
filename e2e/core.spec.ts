import { test, expect } from "@playwright/test";

test("fusion, semantic discovery and live-catalog fallback", async ({
  page,
}) => {
  await page.goto("/discover");
  for (const title of ["Forrest Gump", "Shawshank Redemption, The"]) {
    await page
      .getByRole("button", { name: `Explore ${title}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Fuse", exact: true }).click();
    await page.getByRole("button", { name: "Close movie" }).click();
  }
  await page.getByRole("button", { name: "Taste lab", exact: true }).click();
  await page.getByRole("button", { name: "Fuse their DNA" }).click();
  await expect(page.locator(".movie")).toHaveCount(24);
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Discover", exact: true })
    .first()
    .click();
  await page.getByLabel("Describe your movie mood").fill("Toy Story");
  await page.getByRole("button", { name: "Find movies", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Explore Toy Story", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Search live catalog", exact: true })
    .click();
  await expect(page.locator(".notice")).toContainText("Showing local matches");
});
test("discovery, persistence, taste DNA, mystery and group night", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/discover");
  await expect(
    page.getByRole("heading", {
      name: "Don’t find a movie. Find a feeling.",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore Forrest Gump", exact: true })
    .click();
  await page.getByRole("button", { name: "Toggle watchlist" }).click();
  await Promise.all([
    page.waitForResponse(
      (r) =>
        r.url().includes("/me/movies/") &&
        r.request().postData()?.includes("rating") === true &&
        r.status() === 200,
    ),
    page.getByLabel("Your rating").selectOption("4.5"),
  ]);
  await expect(page.getByRole("status")).toContainText("Saved");
  await page.getByRole("button", { name: "Close movie" }).click();
  await page.getByRole("button", { name: "Watchlist", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Watchlist", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Taste lab", exact: true }).click();
  await expect(page.getByText("Comedy", { exact: true }).first()).toBeVisible();
  await page
    .getByRole("button", { name: "Discover", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Take a chance on mystery" }).click();
  await expect(
    page.getByRole("heading", { name: "A story worth the leap." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reveal my mystery movie" }).click();
  await expect(page.getByLabel("Your rating")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Group night", exact: true }).click();
  await page.getByLabel("Find a group favorite").fill("Toy Story");
  await page.getByRole("button", { name: "Search group favorites" }).click();
  await page
    .getByRole("button", { name: "Toy Story (1995)", exact: true })
    .click();
  await page.getByRole("button", { name: "Person 2", exact: true }).click();
  await page.getByLabel("Find a group favorite").fill("Star Wars");
  await page.getByRole("button", { name: "Search group favorites" }).click();
  await page
    .getByRole("button", {
      name: "Star Wars: Episode IV - A New Hope (1977)",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Find common ground" }).click();
  await expect(page.locator(".movie")).toHaveCount(24);
  expect(errors).toEqual([]);
});
test("mobile layout fits and catalog pagination works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/discover");
  await expect(
    page.getByRole("button", { name: "Explore Forrest Gump" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Next discoveries" }).click();
  await expect(page.getByRole("button", { name: "Previous" })).toBeEnabled();
  await page.screenshot({ path: "../cineverse-mobile.png", fullPage: false });
});
