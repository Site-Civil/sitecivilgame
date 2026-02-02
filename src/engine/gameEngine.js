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
    // Events
    seenEvents: {},              // { [eventId]: true }
    pendingResumeStepId: null,   // where to go after resolving an event
  };
}

function applyEffects(state, effects = {}, flags = []) {
  const nextScores = { ...state.scores };
  for (const [k, delta] of Object.entries(effects)) {
    nextScores[k] = clampScore((nextScores[k] || 0) + delta);
  }

  const nextFlags = { ...state.flags };
  for (const f of flags) nextFlags[f] = true;

  return { nextScores, nextFlags };
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

// ------------------- Events -------------------

export function isEventStepId(stepId) {
  return typeof stepId === "string" && stepId.startsWith("__event__:");
}

export function parseEventId(stepId) {
  return stepId.replace("__event__:", "");
}

/**
 * Choose the first eligible triggered event (deterministic).
 * You can later upgrade this to random selection + weighted probability.
 */
export function findTriggeredEvent(scenario, afterStepId, seenEvents) {
  const deck = scenario.events || [];
  for (const ev of deck) {
    const triggers = ev.triggerAfterStepIds || [];
    const once = ev.once !== false; // default true
    const already = !!seenEvents[ev.id];

    if (triggers.includes(afterStepId)) {
      if (once && already) continue;
      return ev;
    }
  }
  return null;
}

/**
 * Apply a normal decision choice. After applying it, optionally trigger an event.
 */
export function applyChoice(scenario, runState, stepId, option) {
  const { nextScores, nextFlags } = applyEffects(runState, option.effects, option.flags);

  const intendedNextStepId = option.nextStepId;

  const nextHistory = [
    ...runState.history,
    {
      type: "decision",
      stepId,
      optionId: option.id,
      title: option.title,
      rationale: option.rationale,
      mentorNotes: option.mentorNotes || [],
    },
  ];

  // Check event trigger AFTER this step
  const triggered = findTriggeredEvent(scenario, stepId, runState.seenEvents);

  if (triggered) {
    return {
      ...runState,
      stepId: `__event__:${triggered.id}`,
      pendingResumeStepId: intendedNextStepId,
      seenEvents: { ...runState.seenEvents, [triggered.id]: true },
      scores: nextScores,
      flags: nextFlags,
      history: nextHistory,
    };
  }

  return {
    ...runState,
    stepId: intendedNextStepId,
    scores: nextScores,
    flags: nextFlags,
    history: nextHistory,
  };
}

/**
 * Resolve an event by choosing an event option.
 * Optionally, an event option can override what step to resume at.
 */
export function applyEventChoice(scenario, runState, event, eventOption) {
  const { nextScores, nextFlags } = applyEffects(runState, eventOption.effects, eventOption.flags);

  const resume = eventOption.nextStepIdOverride || runState.pendingResumeStepId;

  const nextHistory = [
    ...runState.history,
    {
      type: "event",
      stepId: `__event__:${event.id}`,
      optionId: eventOption.id,
      title: `${event.title} → ${eventOption.title}`,
      rationale: eventOption.rationale || eventOption.description || "",
      mentorNotes: eventOption.mentorNotes || [],
    },
  ];

  return {
    ...runState,
    stepId: resume,
    pendingResumeStepId: null,
    scores: nextScores,
    flags: nextFlags,
    history: nextHistory,
  };
}
