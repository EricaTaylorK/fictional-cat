import { useCallback, useEffect, useRef, useState } from "react";
import { MastheadCat } from "./components/CatPeek.jsx";
import EntryForm from "./components/EntryForm.jsx";
import EntryList from "./components/EntryList.jsx";
import TotalsBar from "./components/TotalsBar.jsx";
import { loadEntries, newId, saveEntries } from "./storage.js";
import "./style.css";

const TOAST_MS = 5000;
const PEEK_MS = 1200;

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries());
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [peeking, setPeeking] = useState(false);
  const toastTimer = useRef(null);
  const peekTimer = useRef(null);
  const undoRef = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    // Skip the mount pass so a failed load can never overwrite stored entries.
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    saveEntries(entries);
  }, [entries]);

  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      clearTimeout(peekTimer.current);
    };
  }, []);

  const editing = entries.find((row) => row.id === editingId) ?? null;

  const triggerPeek = useCallback(() => {
    setPeeking(true);
    clearTimeout(peekTimer.current);
    peekTimer.current = setTimeout(() => setPeeking(false), PEEK_MS);
  }, []);

  const showToast = useCallback((message, { onUndo } = {}) => {
    undoRef.current = onUndo ?? null;
    setToast({ message, undo: Boolean(onUndo) });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      undoRef.current = null;
    }, TOAST_MS);
  }, []);

  function handleSubmit(payload) {
    if (editing) {
      setEntries((prev) =>
        prev.map((row) => (row.id === editing.id ? { ...row, ...payload } : row))
      );
      setEditingId(null);
      triggerPeek();
      return;
    }

    setEntries((prev) => [{ id: newId(), ...payload }, ...prev]);
    triggerPeek();
  }

  function handleDelete(entry) {
    setEntries((prev) => prev.filter((row) => row.id !== entry.id));
    if (editingId === entry.id) setEditingId(null);
    showToast("Entry deleted", {
      onUndo: () => {
        setEntries((prev) => (prev.some((row) => row.id === entry.id) ? prev : [entry, ...prev]));
      },
    });
  }

  function handleUndo() {
    undoRef.current?.();
    undoRef.current = null;
    setToast(null);
    clearTimeout(toastTimer.current);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to log
      </a>
      <div className="page">
        <header className="masthead">
          <MastheadCat />
          <div>
            <h1>PawLedger</h1>
            <p>Hours that stay on this device, with a cat in the margins.</p>
          </div>
        </header>

        <main id="main" className="main">
          <EntryForm
            editing={editing}
            peeking={peeking}
            onSubmit={handleSubmit}
            onCancel={() => setEditingId(null)}
          />
          <EntryList
            entries={entries}
            editingId={editingId}
            onEdit={(entry) => setEditingId(entry.id)}
            onDelete={handleDelete}
          />
        </main>

        <TotalsBar entries={entries} />
      </div>

      {toast ? (
        <div className="toast" role="status">
          <span>{toast.message}</span>
          {toast.undo ? (
            <button type="button" className="btn-text" onClick={handleUndo}>
              Undo
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
