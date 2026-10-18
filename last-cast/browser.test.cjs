// Run after npm run build. BROWSER_EXECUTABLE is optional; never published.
const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path");
const { chromium } = require("playwright");
(async () => {
  const { createPreview } = await import("../tools/preview.mjs");
  const server = await createPreview({ port: 0 });
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_EXECUTABLE
      ? { executablePath: process.env.BROWSER_EXECUTABLE }
      : {}),
    ...(process.env.HTTPS_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY,
            bypass: "127.0.0.1,localhost",
          },
        }
      : {}),
    args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
  });
  const report = { errors: [], runs: [] };
  const output = process.env.LAST_CAST_OUTPUT || "/tmp/last-cast-verification";
  await fs.mkdir(output, { recursive: true });
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1440, height: 1000 },
        hasTouch: mobile,
        isMobile: mobile,
        ignoreHTTPSErrors: !!process.env.HTTPS_PROXY,
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400 && !r.url().includes("favicon"))
          report.errors.push(r.status() + " " + r.url());
      });
      await page.goto(new URL("projects/last-cast/?test", server.url).href);
      await page.waitForFunction(() => window.lastCast);
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(
          output,
          mobile ? "mobile-intro.png" : "desktop-intro.png",
        ),
      });
      await page.click("#start");
      await page.waitForTimeout(500);
      const target = await page.evaluate(() => {
        const p = lastCast.state.items[0].p;
        p[1] += 0.08;
        return lastCast.project(p);
      });
      if (mobile) {
        const cdp = await context.newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: target.x, y: target.y }],
        });
        await page.waitForTimeout(180);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else {
        await page.mouse.move(target.x, target.y);
        await page.mouse.down();
        await page.waitForTimeout(180);
        await page.mouse.up();
      }
      await page.waitForFunction(
        () => lastCast.state.stage === "hooked",
        null,
        { timeout: 12000 },
      );
      await page.click("#reel");
      await page.waitForFunction(() => lastCast.state.success, null, {
        timeout: 15000,
      });
      assert.equal(await page.evaluate(() => lastCast.state.reels), 1);
      await page.click("#pauseBottom");
      const frozen = await page.evaluate(() => lastCast.state);
      await page.waitForTimeout(600);
      assert.deepEqual(await page.evaluate(() => lastCast.state), frozen);
      await page
        .getByRole("button", { name: "继续这一竿", exact: true })
        .click();
      await page.waitForTimeout(1500);
      const metrics = await page.evaluate(() => lastCast.metrics());
      assert.ok(metrics.maxDrawCalls < 70);
      await page.screenshot({
        path: path.join(
          output,
          mobile ? "mobile-saved.png" : "desktop-saved.png",
        ),
      });
      // Accelerate only the deadline. Fishing and collection above used actual pointer events and rAF.
      await page.evaluate(() => lastCast.advance(10801));
      await page.waitForFunction(
        () => !document.getElementById("overlay").hidden,
        null,
        { timeout: 8000 },
      );
      assert.equal(
        await page.locator("#modalTitle").textContent(),
        "这一件，带回家了。",
      );
      await page
        .getByRole("button", { name: "再试这一竿", exact: true })
        .click();
      assert.equal(await page.evaluate(() => lastCast.state.time), 0);
      assert.equal(await page.evaluate(() => lastCast.state.success), false);
      await page.click("#start");
      await page.evaluate(() => lastCast.advance(10801));
      await page.waitForFunction(
        () => !document.getElementById("overlay").hidden,
        null,
        { timeout: 8000 },
      );
      assert.equal(
        await page.locator("#modalTitle").textContent(),
        "这一回，没赶上。",
      );
      await page
        .getByRole("button", { name: "再试这一竿", exact: true })
        .click();
      await page.click("#start");
      if (mobile) {
        await page.click("#move");
        const b = await page.locator("#joystick").boundingBox();
        const cdp = await context.newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: b.x + 85, y: b.y + 55 }],
        });
        await page.waitForTimeout(600);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      } else {
        await page.keyboard.down("d");
        await page.waitForTimeout(600);
        await page.keyboard.up("d");
      }
      assert.equal(await page.evaluate(() => lastCast.state.reels), 0);
      assert.equal(await page.evaluate(() => lastCast.state.stage), "idle");
      assert.ok(await page.evaluate(() => lastCast.state.boat.x > 0.3));
      if (mobile) {
        await page.waitForTimeout(800);
        await page.click("#fish");
        const q = await page.evaluate(() =>
          lastCast.project(lastCast.state.items[0].p),
        );
        const cdp = await context.newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: q.x, y: q.y, id: 1 }],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            { x: q.x, y: q.y, id: 1 },
            { x: q.x + 35, y: q.y + 35, id: 2 },
          ],
        });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        assert.equal(await page.evaluate(() => lastCast.state.stage), "idle");
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      report.runs.push({
        mobileEmulation: mobile,
        metrics,
        success: true,
        failure: true,
        pause: true,
        movement: true,
        actualPointerCast: true,
      });
      await context.close();
    }
    assert.deepEqual(report.errors, []);
    await fs.writeFile(
      path.join(output, "browser-report.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
