// Steps shown on the loading screen. Each step has an active label (in progress)
// and a done label (past tense). Steps only appear when the answers say the
// matching actually uses them, so the screen never implies a check that didn't run.

function sizesStep(answers) {
  if (answers.measurementKnowledge === "no") {
    return {
      id: "sizes",
      active: "Estimating your sizes from your answers…",
      done: "Estimated your sizes from your answers",
    };
  }
  if (answers.measurementKnowledge === "some") {
    const measurements = answers.measurements ?? {};
    const entered = Boolean(measurements.jacket || measurements.chest || measurements.waist);
    if (entered) {
      return { id: "sizes", active: "Checking your sizes…", done: "Checked your sizes" };
    }
    return { id: "sizes", active: "Choosing a starting size…", done: "Chose a starting size" };
  }
  return { id: "sizes", active: "Working out your sizes…", done: "Worked out your sizes" };
}

export function matchingSteps(answers = {}) {
  const renting = answers.mode === "rent";
  const steps = [{ id: "occasion", active: "Matching your occasion…", done: "Matched your occasion" }];

  if (renting) {
    steps.push({
      id: "suit",
      active: "Choosing a suit or tux for your event…",
      done: "Chose a suit or tux for your event",
    });
    if (answers.pieces) {
      steps.push({
        id: "package",
        active: "Checking the package you picked…",
        done: "Checked the package you picked",
      });
    }
  } else {
    steps.push({ id: "fit", active: "Comparing cuts to your fit…", done: "Compared cuts to your fit" });
  }

  if (answers.colors?.prefer?.length) {
    steps.push({ id: "color", active: "Matching your colors…", done: "Matched your colors" });
  }

  steps.push(sizesStep(answers));
  return steps;
}

export function matchingSubtext(mode) {
  return mode === "rent"
    ? "Matching rental looks to your answers. This only takes a moment."
    : "Matching suits to your answers. This only takes a moment.";
}
