import { formatDateHeading, formatHours, groupByDate } from "../storage.js";
import { SleepingCat } from "./CatPeek.jsx";

export default function EntryList({ entries, editingId, onEdit, onDelete }) {
  if (!entries.length) {
    return (
      <section className="entry-list" aria-labelledby="log-heading">
        <h2 id="log-heading">Your hours</h2>
        <div className="empty-state">
          <SleepingCat />
          <p>No hours yet — the cats are waiting.</p>
        </div>
      </section>
    );
  }

  const groups = groupByDate(entries);

  return (
    <section className="entry-list" aria-labelledby="log-heading">
      <h2 id="log-heading">Your hours</h2>
      {groups.map((group) => (
        <div key={group.date} className="date-group">
          <h3 className="date-group__title">{formatDateHeading(group.date)}</h3>
          <ul className="entry-rows">
            {group.entries.map((entry) => (
              <li
                key={entry.id}
                className={`entry-row${editingId === entry.id ? " is-editing" : ""}`}
              >
                <span className="entry-row__hours">{formatHours(entry.hours)}h</span>
                <span className="entry-row__label">{entry.label}</span>
                <span className={`chip chip--${entry.category}`}>
                  {entry.category === "capex" ? "CapEx" : "OpEx"}
                </span>
                <span className="entry-row__actions">
                  <button type="button" className="btn-text" onClick={() => onEdit(entry)}>
                    Edit
                  </button>
                  <button type="button" className="btn-text btn-text--danger" onClick={() => onDelete(entry)}>
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
