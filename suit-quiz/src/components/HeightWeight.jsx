import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  answerFromDisplay,
  CM_RANGE,
  DEFAULT_HEIGHT_IN,
  DEFAULT_WEIGHT_LB,
  displayValues,
  FEET_RANGE,
  inchesToCm,
  KG_RANGE,
  poundsToKg,
  splitInches,
  WEIGHT_MAX_LB,
  WEIGHT_MIN_LB,
} from "../lib/heightWeight.js";
import "./HeightWeight.css";

// Wheels are a touch pattern: phones, and touch tablets up to laptop width.
// Everything else gets labeled text fields: height and weight are exact values
// people know, so typing is faster than scrolling or stepping.
const WHEEL_QUERY = "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)";

function subscribeMedia(query) {
  return (notify) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", notify);
    return () => list.removeEventListener("change", notify);
  };
}

function useMediaQuery(query) {
  const subscribe = useCallback(subscribeMedia(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

const FEET_ITEMS = range(...FEET_RANGE);
const INCH_ITEMS = range(0, 11);
const POUND_ITEMS = range(WEIGHT_MIN_LB, WEIGHT_MAX_LB);
const CM_ITEMS = range(...CM_RANGE);
const KG_ITEMS = range(...KG_RANGE);

function withDefaults(values, unit) {
  const next = { ...values };
  if (unit === "metric") {
    if (next.cm === "") next.cm = String(inchesToCm(DEFAULT_HEIGHT_IN));
    if (next.kg === "") next.kg = String(poundsToKg(DEFAULT_WEIGHT_LB));
  } else {
    const split = splitInches(DEFAULT_HEIGHT_IN);
    if (next.feet === "" || next.inches === "") {
      next.feet = String(split.feet);
      next.inches = String(split.inches);
    }
    if (next.lb === "") next.lb = String(DEFAULT_WEIGHT_LB);
  }
  return next;
}

function isComplete(values, unit) {
  return unit === "metric"
    ? values.cm !== "" && values.kg !== ""
    : values.feet !== "" && values.inches !== "" && values.lb !== "";
}

const ITEM_HEIGHT = 44;

function clampIndex(index, length) {
  return Math.max(0, Math.min(length - 1, index));
}

function Wheel({ label, items, value, unitLabel, unitWord, wide, onSelect }) {
  const ref = useRef(null);
  const timer = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;
  const startIndex = clampIndex(items.indexOf(Number(value)), items.length);
  const [live, setLive] = useState(startIndex);
  const liveRef = useRef(live);
  liveRef.current = live;

  useLayoutEffect(() => {
    ref.current.scrollTop = startIndex * ITEM_HEIGHT;
    // Only on mount. The wheel is remounted when the unit changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const index = items.indexOf(Number(value));
    if (index >= 0 && index !== liveRef.current) {
      ref.current.scrollTop = index * ITEM_HEIGHT;
      setLive(index);
    }
  }, [items, value]);

  function scrollToIndex(index) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ref.current.scrollTo({ top: clampIndex(index, items.length) * ITEM_HEIGHT, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function handleScroll(event) {
    const top = event.currentTarget.scrollTop;
    const index = clampIndex(Math.round(top / ITEM_HEIGHT), items.length);
    if (index !== liveRef.current) setLive(index);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const settled = clampIndex(Math.round(ref.current.scrollTop / ITEM_HEIGHT), items.length);
      if (items[settled] !== Number(valueRef.current)) onSelect(items[settled]);
    }, 90);
  }

  function handleKeyDown(event) {
    const steps = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    let target = null;
    if (event.key in steps) target = liveRef.current + steps[event.key];
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = items.length - 1;
    if (target == null) return;
    event.preventDefault();
    scrollToIndex(target);
  }

  const selected = items[live];
  return (
    <div className={`hw-col${wide ? " hw-wide" : ""}`}>
      <div
        className="hw-wheel"
        ref={ref}
        role="spinbutton"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={items[0]}
        aria-valuemax={items.at(-1)}
        aria-valuenow={selected}
        aria-valuetext={`${selected} ${unitWord}`}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => {
          const distance = Math.min(3, Math.abs(index - live));
          return (
            <div
              className={`hw-item hw-d${distance}`}
              key={item}
              aria-hidden="true"
              onClick={() => scrollToIndex(index)}
            >
              {item}
            </div>
          );
        })}
      </div>
      <span className="hw-unit" aria-hidden="true">{unitLabel}</span>
    </div>
  );
}

function UnitToggle({ unit, onChange }) {
  const name = useId();
  return (
    <fieldset className="hw-units">
      <legend className="visually-hidden">Units</legend>
      {[
        { value: "imperial", label: "Imperial" },
        { value: "metric", label: "Metric" },
      ].map((option) => (
        <label className="hw-unit-option" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={unit === option.value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function WheelPicker({ unit, values, onField }) {
  const metric = unit === "metric";
  return (
    <div className="hw-picker" key={unit}>
      <div className="hw-columns hw-headings">
        <h2 className="hw-heading" id="hw-height-heading">Height</h2>
        <h2 className="hw-heading" id="hw-weight-heading">Weight</h2>
      </div>
      <div className="hw-columns hw-wheel-row">
        <div className="hw-picker-band" aria-hidden="true" />
        <div className="hw-group" role="group" aria-labelledby="hw-height-heading">
          <div className="hw-wheels">
            {metric ? (
              <Wheel label="Height in centimeters" items={CM_ITEMS} value={values.cm} unitLabel="cm" unitWord="centimeters" wide onSelect={(next) => onField("cm", next)} />
            ) : (
              <>
                <Wheel label="Height, feet" items={FEET_ITEMS} value={values.feet} unitLabel="ft" unitWord="feet" onSelect={(next) => onField("feet", next)} />
                <Wheel label="Height, inches" items={INCH_ITEMS} value={values.inches} unitLabel="in" unitWord="inches" onSelect={(next) => onField("inches", next)} />
              </>
            )}
          </div>
        </div>
        <div className="hw-group" role="group" aria-labelledby="hw-weight-heading">
          <div className="hw-wheels">
            {metric ? (
              <Wheel label="Weight in kilograms" items={KG_ITEMS} value={values.kg} unitLabel="kg" unitWord="kilograms" wide onSelect={(next) => onField("kg", next)} />
            ) : (
              <Wheel label="Weight in pounds" items={POUND_ITEMS} value={values.lb} unitLabel="lb" unitWord="pounds" wide onSelect={(next) => onField("lb", next)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function digitsOnly(text) {
  return text.replace(/\D/g, "");
}

function NumberField({ id, label, suffix, value, maxLength, invalid, describedBy, onChange, onBlur }) {
  return (
    <div className="hw-field">
      <label htmlFor={id}>{label}</label>
      <div className="hw-input-wrap">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          maxLength={maxLength}
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(digitsOnly(event.target.value))}
          onBlur={onBlur}
        />
        <span className="hw-suffix" aria-hidden="true">{suffix}</span>
      </div>
    </div>
  );
}

function rangeProblem(value, min, max) {
  return value !== "" && (Number(value) < min || Number(value) > max);
}

function DesktopFields({ unit, values, onField }) {
  const base = useId();
  const [blurred, setBlurred] = useState({});
  const metric = unit === "metric";
  const markBlurred = (field) => () => setBlurred((previous) => ({ ...previous, [field]: true }));
  const problems = metric
    ? {
        height: blurred.cm && rangeProblem(values.cm, CM_RANGE[0], CM_RANGE[1]) ? `Height should be ${CM_RANGE[0]} to ${CM_RANGE[1]} cm.` : "",
        weight: blurred.kg && rangeProblem(values.kg, KG_RANGE[0], KG_RANGE[1]) ? `Weight should be ${KG_RANGE[0]} to ${KG_RANGE[1]} kg.` : "",
      }
    : {
        height: (blurred.feet && rangeProblem(values.feet, FEET_RANGE[0], FEET_RANGE[1])) || (blurred.inches && rangeProblem(values.inches, 0, 11))
          ? `Feet should be ${FEET_RANGE[0]} to ${FEET_RANGE[1]} and inches 0 to 11.`
          : "",
        weight: blurred.lb && rangeProblem(values.lb, WEIGHT_MIN_LB, WEIGHT_MAX_LB) ? `Weight should be ${WEIGHT_MIN_LB} to ${WEIGHT_MAX_LB} lb.` : "",
      };
  const heightErrorId = `${base}-height-error`;
  const weightErrorId = `${base}-weight-error`;
  const heightInvalid = Boolean(problems.height);
  const weightInvalid = Boolean(problems.weight);

  return (
    <div className="hw-fields">
      <fieldset className="hw-field-group">
        <legend>Height</legend>
        <div className="hw-field-row">
          {metric ? (
            <NumberField
              id={`${base}-cm`}
              label="Centimeters"
              suffix="cm"
              maxLength={3}
              value={values.cm}
              invalid={heightInvalid}
              describedBy={heightInvalid ? heightErrorId : undefined}
              onChange={(next) => onField("cm", next)}
              onBlur={markBlurred("cm")}
            />
          ) : (
            <>
              <NumberField
                id={`${base}-feet`}
                label="Feet"
                suffix="ft"
                maxLength={1}
                value={values.feet}
                invalid={heightInvalid}
                describedBy={heightInvalid ? heightErrorId : undefined}
                onChange={(next) => onField("feet", next)}
                onBlur={markBlurred("feet")}
              />
              <NumberField
                id={`${base}-inches`}
                label="Inches"
                suffix="in"
                maxLength={2}
                value={values.inches}
                invalid={heightInvalid}
                describedBy={heightInvalid ? heightErrorId : undefined}
                onChange={(next) => onField("inches", next)}
                onBlur={markBlurred("inches")}
              />
            </>
          )}
        </div>
        <p className="hw-error" id={heightErrorId} aria-live="polite">{problems.height}</p>
      </fieldset>
      <fieldset className="hw-field-group">
        <legend>Weight</legend>
        <div className="hw-field-row">
          <NumberField
            id={`${base}-weight`}
            label={metric ? "Kilograms" : "Pounds"}
            suffix={metric ? "kg" : "lb"}
            maxLength={3}
            value={metric ? values.kg : values.lb}
            invalid={weightInvalid}
            describedBy={weightInvalid ? weightErrorId : undefined}
            onChange={(next) => onField(metric ? "kg" : "lb", next)}
            onBlur={markBlurred(metric ? "kg" : "lb")}
          />
        </div>
        <p className="hw-error" id={weightErrorId} aria-live="polite">{problems.weight}</p>
      </fieldset>
    </div>
  );
}

function spokenSummary(values, unit) {
  const height = unit === "metric"
    ? (values.cm ? `${values.cm} centimeters` : "not set")
    : (values.feet !== "" && values.inches !== "" ? `${values.feet} feet ${values.inches} inches` : "not set");
  const weight = unit === "metric"
    ? (values.kg ? `${values.kg} kilograms` : "not set")
    : (values.lb ? `${values.lb} pounds` : "not set");
  return `Height ${height}. Weight ${weight}.`;
}

export default function HeightWeight({ height, weight, unit: savedUnit, onChange }) {
  const wheels = useMediaQuery(WHEEL_QUERY);
  const [unit, setUnit] = useState(savedUnit === "metric" ? "metric" : "imperial");
  const [values, setValues] = useState(() => displayValues(height, weight, savedUnit === "metric" ? "metric" : "imperial"));

  // Wheels can settle in the same moment, so changes build on the latest values, not the last render's.
  const latest = useRef({ values, unit });
  latest.current = { values, unit };

  const apply = useCallback((nextValues, nextUnit) => {
    latest.current = { values: nextValues, unit: nextUnit };
    setValues(nextValues);
    setUnit(nextUnit);
    onChange({ ...answerFromDisplay(nextValues, nextUnit), heightWeightUnit: nextUnit });
  }, [onChange]);

  // The wheels always show a value, so what is highlighted is what gets saved.
  // "Skip" clears it again.
  useEffect(() => {
    if (wheels && !isComplete(values, unit)) apply(withDefaults(values, unit), unit);
  }, [wheels, values, unit, apply]);

  function changeField(field, next) {
    apply({ ...latest.current.values, [field]: String(next) }, latest.current.unit);
  }

  function changeUnit(nextUnit) {
    if (nextUnit === unit) return;
    const saved = answerFromDisplay(values, unit);
    const converted = displayValues(saved.height, saved.weight, nextUnit);
    apply(wheels ? withDefaults(converted, nextUnit) : converted, nextUnit);
  }

  return (
    <div className={`hw${wheels ? " hw-touch" : ""}`}>
      <UnitToggle unit={unit} onChange={changeUnit} />
      {wheels ? (
        <WheelPicker unit={unit} values={values} onField={changeField} />
      ) : (
        <DesktopFields unit={unit} values={values} onField={changeField} />
      )}
      <p className="visually-hidden" role="status">{spokenSummary(values, unit)}</p>
    </div>
  );
}
