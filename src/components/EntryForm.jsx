import { useEffect, useRef, useState } from "react";
import { snapHours, todayIso } from "../storage.js";
import CatPeek from "./CatPeek.jsx";

const emptyDraft = () => ({
  date: todayIso(),
  hours: "1",
  label: "",
  category: "",
});

export default function EntryForm({ editing, peeking, onSubmit, onCancel }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const labelRef = useRef(null);
  const editingRef = useRef(editing);
  editingRef.current = editing;

  const editingId = editing?.id ?? null;

  useEffect(() => {
    const current = editingRef.current;
    if (current) {
      setDraft({
        date: current.date,
        hours: String(current.hours),
        label: current.label,
        category: current.category,
      });
      setErrors({});
      labelRef.current?.focus();
      return;
    }
    setDraft(emptyDraft());
    setErrors({});
  }, [editingId]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function bumpHours(delta) {
    const current = snapHours(draft.hours) ?? 1;
    const next = snapHours(current + delta) ?? (delta > 0 ? 24 : 0.25);
    setField("hours", String(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    const hours = snapHours(draft.hours);
    const label = draft.label.trim();

    if (!draft.date) nextErrors.date = "Pick a date.";
    if (hours === null) nextErrors.hours = "Use 0.25–24 hours, in quarter hours.";
    if (!label) nextErrors.label = "Add a short task label.";
    if (draft.category !== "capex" && draft.category !== "opex") {
      nextErrors.category = "Choose CapEx or OpEx.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      date: draft.date,
      hours,
      label,
      category: draft.category,
    });

    if (!editing) {
      setDraft((prev) => ({ ...emptyDraft(), date: prev.date, category: prev.category }));
      labelRef.current?.focus();
    }
  }

  const isEdit = Boolean(editing);

  return (
    <form className="entry-form" onSubmit={handleSubmit} noValidate>
      <div className="entry-form__head">
        <h2>{isEdit ? "Edit hours" : "Log hours"}</h2>
        {isEdit ? <p>Update this entry, then save.</p> : <p>Date, a short label, and CapEx or OpEx.</p>}
      </div>

      <div className="field-row">
        <label className="field">
          <span>Date</span>
          <input
            type="date"
            value={draft.date}
            onChange={(e) => setField("date", e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "err-date" : undefined}
          />
          {errors.date ? (
            <em id="err-date" className="field-error">
              {errors.date}
            </em>
          ) : null}
        </label>

        <div className="field">
          <span id="hours-label">Hours</span>
          <div className="hours-stepper">
            <button type="button" className="stepper-btn" onClick={() => bumpHours(-0.25)} aria-label="Decrease hours">
              −
            </button>
            <input
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              inputMode="decimal"
              value={draft.hours}
              onChange={(e) => setField("hours", e.target.value)}
              aria-labelledby="hours-label"
              aria-invalid={Boolean(errors.hours)}
              aria-describedby={errors.hours ? "err-hours" : undefined}
            />
            <button type="button" className="stepper-btn" onClick={() => bumpHours(0.25)} aria-label="Increase hours">
              +
            </button>
          </div>
          {errors.hours ? (
            <em id="err-hours" className="field-error">
              {errors.hours}
            </em>
          ) : null}
        </div>
      </div>

      <label className="field">
        <span>Task</span>
        <input
          ref={labelRef}
          type="text"
          maxLength={80}
          placeholder="Wireframe review"
          value={draft.label}
          onChange={(e) => setField("label", e.target.value)}
          aria-invalid={Boolean(errors.label)}
          aria-describedby={errors.label ? "err-label" : undefined}
        />
        {errors.label ? (
          <em id="err-label" className="field-error">
            {errors.label}
          </em>
        ) : null}
      </label>

      <fieldset className="field category-field">
        <legend>Category</legend>
        <div className="category-toggles" role="group" aria-label="Category">
          <button
            type="button"
            className={`cat-toggle cat-toggle--capex${draft.category === "capex" ? " is-on" : ""}`}
            aria-pressed={draft.category === "capex"}
            onClick={() => setField("category", "capex")}
          >
            CapEx
          </button>
          <button
            type="button"
            className={`cat-toggle cat-toggle--opex${draft.category === "opex" ? " is-on" : ""}`}
            aria-pressed={draft.category === "opex"}
            onClick={() => setField("category", "opex")}
          >
            OpEx
          </button>
        </div>
        {errors.category ? (
          <em id="err-category" className="field-error">
            {errors.category}
          </em>
        ) : null}
      </fieldset>

      <div className="form-actions">
        <div className="peek-wrap">
          <CatPeek active={peeking} />
          <button type="submit" className="btn-primary">
            {isEdit ? "Save" : "Add hours"}
          </button>
        </div>
        {isEdit ? (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
