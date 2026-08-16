export function getStore(name) {
  globalThis.__BLOBS ||= new Map();
  if (!globalThis.__BLOBS.has(name)) globalThis.__BLOBS.set(name, new Map());
  const m = globalThis.__BLOBS.get(name);
  return {
    async get(key, opts) {
      if (!m.has(key)) return null;
      const v = m.get(key);
      if (opts?.type === "json") return typeof v === "string" ? JSON.parse(v) : JSON.parse(JSON.stringify(v));
      return v;
    },
    async set(key, value) { m.set(key, value); },
    async setJSON(key, obj) { m.set(key, JSON.stringify(obj)); },
  };
}
