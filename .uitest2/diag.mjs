import puppeteer from "puppeteer";
import { spawn } from "child_process";
import path from "path";

const here = "/home/user/davisfleetmanagement/.uitest2";
const PORT = 8736;
const proc = spawn("node", [path.join(here, "server.mjs")], { env: { ...process.env, PORT: String(PORT) }, stdio: ["ignore", "pipe", "pipe"] });
proc.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
await new Promise((r) => setTimeout(r, 600));
const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage();
page.on("response", (res) => {
  if (res.status() >= 400) console.log("BAD RESPONSE:", res.status(), res.url());
});
page.on("requestfailed", (req) => console.log("REQUEST FAILED:", req.url(), req.failure()?.errorText));
page.on("console", (msg) => console.log("CONSOLE:", msg.type(), msg.text(), "|", msg.location && JSON.stringify(msg.location())));
await page.setViewport({ width: 1280, height: 1000 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim().startsWith("Maintenance"));
  if (b) b.click();
});
await new Promise((r) => setTimeout(r, 3000));
console.log("---done waiting, no more requests expected below this line except what already happened above---");
await browser.close();
proc.kill();
