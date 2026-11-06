// Height and weight for the quiz. Answers always keep one unit each:
// answers.height is total inches, answers.weight is pounds. Metric entries are
// converted before they are saved, so the size estimate never sees centimeters or kilograms.

export const HEIGHT_MIN_IN = 48; // 4'0"
export const HEIGHT_MAX_IN = 95; // 7'11"
export const WEIGHT_MIN_LB = 80;
export const WEIGHT_MAX_LB = 400;

export const CM_PER_INCH = 2.54;
export const LB_PER_KG = 2.20462;

export const DEFAULT_HEIGHT_IN = 70; // 5'10", shown on the wheels before anyone touches them
export const DEFAULT_WEIGHT_LB = 180;

export const FEET_RANGE = [4, 7];
export const CM_RANGE = [Math.ceil(HEIGHT_MIN_IN * CM_PER_INCH), Math.floor(HEIGHT_MAX_IN * CM_PER_INCH)];
export const KG_RANGE = [Math.ceil(WEIGHT_MIN_LB / LB_PER_KG), Math.floor(WEIGHT_MAX_LB / LB_PER_KG)];

export function validHeightInches(value) {
  const inches = Number(value);
  return Number.isInteger(inches) && inches >= HEIGHT_MIN_IN && inches <= HEIGHT_MAX_IN ? inches : null;
}

export function validWeightPounds(value) {
  const pounds = Number(value);
  return Number.isFinite(pounds) && pounds >= WEIGHT_MIN_LB && pounds <= WEIGHT_MAX_LB ? Math.round(pounds) : null;
}

export function cmToInches(cm) {
  return Math.round(Number(cm) / CM_PER_INCH);
}

export function inchesToCm(inches) {
  return Math.round(Number(inches) * CM_PER_INCH);
}

export function kgToPounds(kg) {
  return Math.round(Number(kg) * LB_PER_KG);
}

export function poundsToKg(pounds) {
  return Math.round(Number(pounds) / LB_PER_KG);
}

export function splitInches(total) {
  return { feet: Math.floor(total / 12), inches: total % 12 };
}

// What the fields and wheels show for a saved answer, in the chosen unit.
export function displayValues(height, weight, unit) {
  const inches = validHeightInches(height);
  const pounds = validWeightPounds(weight);
  if (unit === "metric") {
    return {
      cm: inches == null ? "" : String(inchesToCm(inches)),
      kg: pounds == null ? "" : String(poundsToKg(pounds)),
      feet: "",
      inches: "",
      lb: "",
    };
  }
  const split = inches == null ? null : splitInches(inches);
  return {
    feet: split ? String(split.feet) : "",
    inches: split ? String(split.inches) : "",
    lb: pounds == null ? "" : String(pounds),
    cm: "",
    kg: "",
  };
}

// The saved answer for what is on screen. Empty or out-of-range entries save as "".
export function answerFromDisplay(values, unit) {
  if (unit === "metric") {
    const height = values.cm === "" ? null : validHeightInches(cmToInches(values.cm));
    const weight = values.kg === "" ? null : validWeightPounds(kgToPounds(values.kg));
    return { height: height ?? "", weight: weight ?? "" };
  }
  const feet = Number(values.feet);
  const inches = Number(values.inches);
  const complete = values.feet !== "" && values.inches !== "";
  const withinRange = Number.isInteger(feet) && Number.isInteger(inches) && feet >= FEET_RANGE[0] && feet <= FEET_RANGE[1] && inches >= 0 && inches <= 11;
  const height = complete && withinRange ? validHeightInches(feet * 12 + inches) : null;
  const weight = values.lb === "" ? null : validWeightPounds(values.lb);
  return { height: height ?? "", weight: weight ?? "" };
}

export function weightLabel(weight) {
  const pounds = validWeightPounds(weight);
  return pounds == null ? null : `${pounds} lb`;
}
