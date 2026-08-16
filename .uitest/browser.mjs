/**
 * One place that knows how to find Chromium, so the browser tests are not pinned to
 * whichever container they were written in.
 *
 * Order: $CHROME_PATH → the sandbox's preinstalled Chromium → whatever puppeteer
 * installed for itself (the normal case on CI, where `npm install` fetches one).
 */
import puppeteer from "puppeteer";
import { existsSync } from "fs";

const SANDBOX_CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export function chromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  if (existsSync(SANDBOX_CHROME)) return SANDBOX_CHROME;
  return undefined; // let puppeteer use its own download
}

export function launch(opts = {}) {
  const exe = chromePath();
  return puppeteer.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
    ...(exe ? { executablePath: exe } : {}),
    ...opts,
  });
}
