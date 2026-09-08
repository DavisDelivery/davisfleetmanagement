/* Boot: the error boundary and the root render, kept out of App.jsx so App.jsx stays
   pure declarations — the .uitest fixtures read its functions out of module scope
   without a DOM, and a top-level ReactDOM.createRoot would break every one of them.

   This used to live inline in index.html as a third <script type="text/babel">. It is
   JSX, so it was one of the reasons a 604 KB compiler had to reach the phone before
   anything could render. It is built ahead of time now, like App.jsx. */

// A throw anywhere inside App() used to leave the loading spinner up forever and take
// DVIRs, the repair board and the cost ledger down together, on phones with no console.
// Contain it and give the person on the yard something to act on.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("Fleet app crashed:", err, info); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: "28px 20px", maxWidth: 520, margin: "0 auto", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#243447" }}>
        <h1 style={{ fontSize: 20, margin: "0 0 10px" }}>The app hit an error and stopped</h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, color: "#5b6b7a", margin: "0 0 18px" }}>
          Your saved work is not affected — this screen failed to draw. Reloading usually clears it.
          If it keeps happening, send this message to the office.
        </p>
        <button onClick={() => location.reload()} style={{ background: "#1e5b92", color: "#fff", border: 0, borderRadius: 6, padding: "12px 20px", fontSize: 16, fontWeight: 600, minHeight: 44 }}>
          Reload
        </button>
        <pre style={{ marginTop: 20, padding: 12, background: "#f1f4f7", border: "1px solid #dde3ea", borderRadius: 6, fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#6b7785" }}>
          {String(this.state.err && (this.state.err.stack || this.state.err.message) || this.state.err)}
        </pre>
      </div>
    );
  }
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));
