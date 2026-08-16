export default async function pdfParse(buffer, opts) {
  const s = buffer.toString("utf8");
  if (!s.startsWith("PDF::")) return { text: "", numpages: 0 };
  const body = s.slice(5);
  const m = /#PAGES=(\d+)/.exec(body);
  const pages = m ? Number(m[1]) : 1;
  const max = opts && opts.max ? opts.max : 0;
  globalThis.__PARSE_CALLS = (globalThis.__PARSE_CALLS || []);
  globalThis.__PARSE_CALLS.push({ max, pages });
  // Burn real CPU per page, but yield between chunks so pending timers (the abort)
  // can actually fire — a single unbroken busy-loop would starve the timer queue and
  // make the deadline look like it never expired, which real I/O-punctuated work
  // never does.
  const n = max ? Math.min(max, pages) : pages;
  const perPage = globalThis.__PARSE_MS_PER_PAGE || 0;
  for (let done = 0; done < n && perPage; done += 10) {
    const end = Date.now() + perPage * Math.min(10, n - done);
    while (Date.now() < end) {}
    await new Promise((r) => setTimeout(r, 0));
  }
  return { text: body, numpages: pages };
}
