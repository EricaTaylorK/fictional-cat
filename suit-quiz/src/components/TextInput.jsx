import { useId } from "react";

export default function TextInput({ label, value, onChange, helperText, inputMode = "numeric", ...props }) {
  const id = useId();
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className="text-input">
      <div className="text-input-row">
        <input
          id={id}
          className="text-input-field"
          type="text"
          inputMode={inputMode}
          placeholder=" "
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={helperId}
          {...props}
        />
        <label className="text-input-label" htmlFor={id}>{label}</label>
      </div>
      {helperText && <p id={helperId} className="text-input-helper">{helperText}</p>}
    </div>
  );
}
