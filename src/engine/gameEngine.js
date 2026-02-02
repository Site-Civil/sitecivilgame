export function weightedTotal(scores, weights) {
  let total = 0;
  for (const k of Object.keys(weights)) total += (scores[k] || 0) * weights[k];
  return Math.round(total);
}

export function clampScore(v) {
  return Math.max(-50, Math.min(100, v));
}

export function makeInitialRun(scenario) {
  return {
    scenarioId: scenario.id,
    stepId: scenario.steps[0].id,
    history: [],
    scores: { compliance: 0, constructability: 0, cost: 0, risk: 0, schedule: 0 },
    flags: {},
  };
}

export function applyChoice(runState, stepId, option) {
  const nextScores = { ...runState.scores };
  for (const [k, delta] of Object.entries(option.effects || {})) {
    nextScores[k] = clampScore((nextScores[k] || 0) + delta);
  }

  const nextFlags = { ...runState.flags };
  for (const f of option.flags || []) nextFlags[f] = true;

  const nextHistory = [
    ...runState.history,
    {
      stepId,
      optionId: option.id,
      title: option.title,
      rationale: option.rationale,
      mentorNotes: option.mentorNotes || [],
    },
  ];

  return {
    ...runState,
    stepId: option.nextStepId,
    scores: nextScores,
    flags: nextFlags,
    history: nextHistory,
  };
}

export function gradeFromTotal(total) {
  if (total >= 70) return { letter: "A", note: "Strong concept. Reviewer-friendly." };
  if (total >= 45) return { letter: "B", note: "Solid, but has a few weak spots." };
  if (total >= 20) return { letter: "C", note: "Passable, expect comments and rework." };
  return { letter: "D", note: "High risk. Revisit core assumptions." };
}

export function buildRedFlags(flags) {
  const out = [];
  if (flags.flooding_risk) out.push("Ponding near critical structures/equipment");
  if (flags.ada_risk) out.push("ADA compliance/maintenance vulnerability");
  if (flags.row_risk) out.push("ROW utility conflict risk");
  if (flags.maintenance_conflict) out.push("Future repairs could disrupt ADA route");
  return out;
}
