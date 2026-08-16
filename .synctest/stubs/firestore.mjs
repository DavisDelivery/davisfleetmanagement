// Enforces Firestore's real 1,048,487-byte property limit so oversize bugs surface.
const DOC_ID = Symbol("documentId");
export const FS_PROPERTY_LIMIT = 1048487;
function fs() { return (globalThis.__FIRESTORE ||= new Map()); }
export function getFirestore() { return {}; }
export function doc(_db, col, id) { return { __path: `${col}/${id}`, __id: id }; }
export async function getDoc(ref) {
  const data = fs().get(ref.__path);
  return { exists: () => data !== undefined, data: () => data, id: ref.__id };
}
export async function setDoc(ref, data) {
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && Buffer.byteLength(v, "utf8") > FS_PROPERTY_LIMIT) {
      throw new Error(`3 INVALID_ARGUMENT: The value of property "${k}" is longer than ${FS_PROPERTY_LIMIT} bytes.`);
    }
  }
  fs().set(ref.__path, data);
}
export function collection(_db, name) { return { __col: name }; }
export function documentId() { return DOC_ID; }
export function where(field, op, value) { return { field, op, value }; }
export function query(col, ...wheres) { return { __col: col.__col, wheres }; }
export async function getDocs(q) {
  const docs = [];
  for (const [path, data] of fs()) {
    const [col, ...rest] = path.split("/");
    if (col !== q.__col) continue;
    const id = rest.join("/");
    let ok = true;
    for (const w of q.wheres) {
      if (w.op === ">=" && !(id >= w.value)) ok = false;
      else if (w.op === "<" && !(id < w.value)) ok = false;
    }
    if (ok) docs.push({ id, data: () => data, exists: () => true });
  }
  return { forEach: (cb) => docs.forEach(cb), docs, size: docs.length };
}
