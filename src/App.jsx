import React, { useMemo, useReducer, useState } from "react";

/**
 * Pump Station Site-Civil Decision Game — MVP
 * Drop into a React project (Vite/CRA/Next) and render <App />
 *
 * Edit SCENARIO to add steps/options, scoring, and mentor notes.
 */

const SCENARIO = {
  id: "pump-station-mvp-01",
  title: "Pump Station Micro-Site: Drainage + ADA + Utility Tie-ins",
  subtitle:
    "Make design calls under constraints. Score well across compliance, constructability, cost, risk, and schedule.",
  context: {
    jurisdiction: "Generic municipality (swap to your local standards later)",
    siteProgram:
      "Small wastewater pump station with fenced yard, wet well, valve vault, generator pad, MCC/control cabinet, and a small parking/turnaround for maintenance truck.",
    knowns: [
      'Parcel is ~120 ft x 90 ft; street frontage on the north.',
      "Existing grade falls ~3% from north to south.",
      "Soils: silty sand; infiltration moderate; groundwater unknown.",
      "Incoming gravity sewer at NE corner; force main exits to west.",
      'Existing 8" water main runs in ROW; power available at NW.',
      "Public access is limited, but ADA route to controls/door is required for staff/contractors.",
    ],
    constraints: [
      "Minimize offsite discharge (water quality emphasis)",
      "Avoid deep excavations near existing utilities in ROW",
      "Maintain access for vacuum truck / maintenance vehicle",
      "Keep O&M safe (drainage away from electrical, ice/ponding awareness)",
    ],
  },
  scoringWeights: {
    compliance: 1.2,
    constructability: 1.0,
    cost: 0.9,      // cost efficiency (higher is better)
    risk: 1.1,      // risk reduction (higher is better)
    schedule: 0.8,
  },
  resources: [
    {
      label: "ADA (routes, slopes, ramps)",
      hint: "Cross slope, running slope, landings, curb ramps, gates/hardware. Confirm local amendments.",
    },
    {
      label: "Stormwater manual / BMP selection",
      hint: "Treatment vs flow control; infiltration feasibility; pretreatment; setbacks; overflow routing.",
    },
    {
      label: "Utility separation / cover / crossings",
      hint: "Typical separations, minimum cover, conflicts, corrosion, thrust restraint, access.",
    },
    {
      label: "Pump station yard safety",
      hint: "Drain away from electrical, generators, door thresholds; ice hazards; hose-down considerations.",
    },
  ],
  steps: [
    {
      id: "brief",
      type: "brief",
      title: "Site Brief",
      prompt:
        "Review the site program and constraints. First: choose a grading + drainage concept for the fenced yard.",
      nextStepId: "gradingConcept",
    },
    {
      id: "gradingConcept",
      type: "decision",
      title: "Grading + Drainage Concept",
      prompt:
        "Pick the overall grading/drainage concept for the yard. Goal: keep water away from electrical equipment and provide a safe ADA route.",
      options: [
        {
          id: "gc1",
          title: "Crown the yard; drain to perimeter trench drain at south fence",
          description:
            "Gentle crown near equipment pads; route runoff to trench drain along south fence, then to a small treatment/infiltration feature.",
          effects: { compliance: +8, constructability: +5, cost: +3, risk: +7, schedule: +3 },
          flags: ["good_drainage", "ada_friendly"],
          rationale:
            "Keeps flow away from pads/door thresholds and offers controlled collection for treatment. Watch trench drain maintenance and freezing.",
          mentorNotes: [
            "Confirm trench drain load rating, cleanouts, maintenance access.",
            "Check slope transitions so ADA cross-slope stays compliant.",
            "Provide overflow path if infiltration underperforms.",
          ],
          nextStepId: "adaRoute",
        },
        {
          id: "gc2",
          title: "Single-plane slope south (sheet flow) to bioswale outside fence",
          description:
            "Uniform grade sloping south; runoff exits fence via scupper to a bioswale.",
          effects: { compliance: +4, constructability: +7, cost: +6, risk: +2, schedule: +6 },
          flags: ["simple_grading", "maintenance_risk"],
          rationale:
            "Simple and cheap, but sheet flow past gates/equipment can create icing and O&M risk; outfall detailing matters.",
          mentorNotes: [
            "Demonstrate controlled overflow and erosion protection.",
            "Consider winter icing near gate/electrical cabinets.",
            "Confirm discharge is allowed and treatment requirements are met.",
          ],
          nextStepId: "adaRoute",
        },
        {
          id: "gc3",
          title: "Depress center yard to a catch basin near wet well",
          description:
            "Grade toward a catch basin located near wet well/valve vault for minimal pipe runs.",
          effects: { compliance: -2, constructability: +2, cost: +7, risk: -6, schedule: +2 },
          flags: ["flooding_risk"],
          rationale:
            "Low cost and short runs, but concentrates water at sensitive assets. High risk of ponding and O&M problems.",
          mentorNotes: [
            "Avoid ponding near hatches and electrical gear.",
            "Check flood protection/freeboard expectations.",
            "If unavoidable, add redundant overflow and alarm considerations.",
          ],
          nextStepId: "adaRoute",
        },
      ],
    },
    {
      id: "adaRoute",
      type: "decision",
      title: "ADA Route Layout",
      prompt:
        "Choose how you provide an accessible route from the sidewalk (north frontage) to the control cabinet / building door.",
      options: [
        {
          id: "ada1",
          title: "Direct route through gate; hard surface; manage cross-slope",
          description:
            "Provide a paved/stabilized path from sidewalk to a compliant gate, then to controls with compliant slopes and landings.",
          effects: { compliance: +8, constructability: +3, cost: +3, risk: +6, schedule: +2 },
          flags: ["ada_best"],
          rationale:
            "Most defensible: clear route, predictable performance, reduces liability. Requires careful grading and gate hardware selection.",
          mentorNotes: [
            "Confirm gate clear width and operable hardware forces.",
            "Keep cross slope ≤ 2% (and confirm local rule).",
            "Provide landings at controls/door and avoid ponding at thresholds.",
          ],
          nextStepId: "utilityConflicts",
        },
        {
          id: "ada2",
          title: "No dedicated path; compacted gravel route",
          description:
            "Rely on compacted gravel and yard grading; only provide small landings at controls.",
          effects: { compliance: -4, constructability: +7, cost: +7, risk: -2, schedule: +6 },
          flags: ["ada_risk"],
          rationale:
            "Common cost-saver, but compliance is weak and performance degrades with rutting/ice. Hard to defend in review.",
          mentorNotes: [
            "Expect plan review comments and long-term maintenance issues.",
            "If forced, document maintenance plan and consider a paved strip minimum.",
          ],
          nextStepId: "utilityConflicts",
        },
        {
          id: "ada3",
          title: "Short internal ramp over grade break near gate",
          description:
            "Maintain grade at sidewalk; use a short ramp segment inside fence with landings.",
          effects: { compliance: +5, constructability: +4, cost: +2, risk: +3, schedule: +1 },
          flags: ["ramp_details"],
          rationale:
            "Can work well, but ramps demand tight detailing: slopes, landings, edge protection, drainage at ramp toe.",
          mentorNotes: [
            "Avoid concentrating runoff at ramp toe/landing.",
            "Confirm if handrails are triggered by slope/length per jurisdiction.",
          ],
          nextStepId: "utilityConflicts",
        },
      ],
    },
    {
      id: "utilityConflicts",
      type: "decision",
      title: "Utility Tie-ins + Conflicts",
      prompt:
        "Pick a routing approach. Tie in incoming gravity sewer (NE), outgoing force main (west), water service, and electrical. Avoid ROW conflicts and keep access to valves/vaults.",
      options: [
        {
          id: "u1",
          title: "Shift wet well slightly south to avoid ROW conflicts; keep gravity shallow",
          description:
            "Move wet well/valve vault south; keep gravity inside parcel; reduce ROW utility conflicts.",
          effects: { compliance: +7, constructability: +4, cost: +2, risk: +6, schedule: +2 },
          flags: ["conflict_avoidance"],
          rationale:
            "Avoiding ROW conflicts reduces surprises. A small footprint shift can save major shoring and permit headaches.",
          mentorNotes: [
            "Confirm minimum gravity slope and cover.",
            "Keep clear access around hatches/vault lids.",
            "Coordinate easements if route shifts.",
          ],
          nextStepId: "stormwaterTreatment",
        },
        {
          id: "u2",
          title: "Wet well near NE corner; accept ROW crossings to minimize runs",
          description:
            "Minimize gravity run length but work tighter to existing ROW utilities.",
          effects: { compliance: +2, constructability: -2, cost: +6, risk: -3, schedule: -2 },
          flags: ["row_risk"],
          rationale:
            "Efficient on paper, but ROW utility uncertainty drives RFIs, delays, and change orders.",
          mentorNotes: [
            "Call for potholing/SUE early.",
            "Detail shoring near existing utilities and maintain service.",
          ],
          nextStepId: "stormwaterTreatment",
        },
        {
          id: "u3",
          title: "Force main under ADA route to exit west",
          description:
            "Direct force main alignment under the paved ADA route for shortest length.",
          effects: { compliance: +3, constructability: +2, cost: +5, risk: -2, schedule: +1 },
          flags: ["maintenance_conflict"],
          rationale:
            "Saves pipe but puts future repairs under your primary accessible route. Plan for long-term serviceability.",
          mentorNotes: [
            "Consider sleeves or extra depth to reduce future disruption.",
            "Settlement can break ADA slopes; specify compaction/QA.",
          ],
          nextStepId: "stormwaterTreatment",
        },
      ],
    },
    {
      id: "stormwaterTreatment",
      type: "decision",
      title: "Stormwater Treatment / Flow Control",
      prompt:
        "Choose a stormwater strategy. Small impervious area, but public infrastructure often gets high scrutiny.",
      options: [
        {
          id: "sw1",
          title: "Onsite infiltration trench (with pretreatment + overflow)",
          description:
            "Small infiltration trench/drywell with upstream sediment sump pretreatment and a defined overflow path.",
          effects: { compliance: +7, constructability: +2, cost: +3, risk: +2, schedule: +1 },
          flags: ["infiltration"],
          rationale:
            "Great when soils/setbacks allow; ensure groundwater separation and overflow. Pretreatment is non-negotiable.",
          mentorNotes: [
            "Require infiltration testing or design conservatively.",
            "Provide safe overflow routing for major storms.",
          ],
          nextStepId: "constructionAccess",
        },
        {
          id: "sw2",
          title: "Tightline to street inlet; add water-quality device if allowed",
          description:
            "Pipe runoff to existing street inlet; add hydrodynamic separator or inlet insert if accepted.",
          effects: { compliance: +3, constructability: +6, cost: +5, risk: -1, schedule: +5 },
          flags: ["permit_dependency"],
          rationale:
            "Constructable, but depends heavily on jurisdiction acceptance/capacity. May get pushback for new impervious.",
          mentorNotes: [
            "Confirm downstream capacity and treatment requirements.",
            "Get early city buy-in (don’t assume).",
          ],
          nextStepId: "constructionAccess",
        },
        {
          id: "sw3",
          title: "Bioswale outside fence with defined overflow",
          description:
            "Vegetated bioswale outside fence along south line; include overflow back to street system.",
          effects: { compliance: +6, constructability: +4, cost: +4, risk: +3, schedule: +2 },
          flags: ["swale"],
          rationale:
            "Often acceptable and visible; requires O&M agreement and winter performance considerations.",
          mentorNotes: [
            "Confirm setbacks/ownership and who maintains it.",
            "Stabilize outfalls and overflow weirs.",
          ],
          nextStepId: "constructionAccess",
        },
      ],
    },
    {
      id: "constructionAccess",
      type: "decision",
      title: "Constructability + Access",
      prompt:
        "Pick how you ensure maintenance vehicle access and constructability while protecting ADA surfaces and utilities.",
      options: [
        {
          id: "ca1",
          title: "Dedicated paved access lane + turning pad; keep utilities out of wheel paths",
          description:
            "Provide access lane/turning pad sized for maintenance vehicle. Route key utilities outside heavy wheel paths where feasible.",
          effects: { compliance: +5, constructability: +8, cost: +2, risk: +6, schedule: +3 },
          flags: ["operations"],
          rationale:
            "Strong O&M outcome; reduces settlement over pipes and preserves ADA surfaces long-term.",
          mentorNotes: [
            "Confirm turning templates and gate geometry.",
            "Coordinate pavement section for loading and trench patches.",
          ],
          nextStepId: "wrapup",
        },
        {
          id: "ca2",
          title: "Shared yard surface; crusher-run base; minimal paving",
          description:
            "Minimize pavement; use compacted aggregate and small pads at equipment.",
          effects: { compliance: -1, constructability: +6, cost: +7, risk: -2, schedule: +5 },
          flags: ["low_cost"],
          rationale:
            "Lower initial cost but higher lifecycle risk: rutting, mud, icing, and ADA degradation.",
          mentorNotes: [
            "If used, define maintenance expectations and mud control at the gate.",
            "At minimum, stabilize the ADA route permanently.",
          ],
          nextStepId: "wrapup",
        },
        {
          id: "ca3",
          title: "Pave ADA route only; aggregate access; accept disruption for future repairs",
          description:
            "Prioritize ADA route paving; keep access mostly aggregate; accept higher disruption during repairs.",
          effects: { compliance: +3, constructability: +4, cost: +5, risk: +1, schedule: +2 },
          flags: ["mixed"],
          rationale:
            "A middle ground; can work if maintenance frequency is low and soils behave.",
          mentorNotes: [
            "Confirm maintenance vehicle frequency and seasonal conditions.",
            "Define a stable working pad near critical hatches.",
          ],
          nextStepId: "wrapup",
        },
      ],
    },
    {
      id: "wrapup",
      type: "results",
      title: "Design Review Summary",
      prompt:
        "Here’s how your concept performed. Toggle Mentor Mode to review rationale and build a punchlist of follow-up checks.",
    },
  ],
};

// -------- engine ----------
function weightedTotal(scores, weights) {
  let total = 0;
  for (const k of Object.keys(weights)) total += (scores[k] || 0) * weights[k];
  return Math.round(total);
}
function clampScore(v) {
  return Math.max(-50, Math.min(100, v));
}
function initialState() {
  return {
    stepId: SCENARIO.steps[0].id,
    history: [],
    scores: { compliance: 0, constructability: 0, cost: 0, risk: 0, schedule: 0 },
    flags: {},
  };
}
function reducer(state, action) {
  switch (action.type) {
    case "RESTART":
      return initialState();
    case "GOTO":
      return { ...state, stepId: action.stepId };
    case "CHOOSE": {
      const { stepId, option } = action;

      const nextScores = { ...state.scores };
      for (const [k, delta] of Object.entries(option.effects || {})) {
        nextScores[k] = clampScore((nextScores[k] || 0) + delta);
      }

      const nextFlags = { ...state.flags };
      for (const f of option.flags || []) nextFlags[f] = true;

      const nextHistory = [
        ...state.history,
        {
          stepId,
          optionId: option.id,
          title: option.title,
          rationale: option.rationale,
          mentorNotes: option.mentorNotes || [],
        },
      ];

      return {
        ...state,
        stepId: option.nextStepId,
        scores: nextScores,
        flags: nextFlags,
        history: nextHistory,
      };
    }
    default:
      return state;
  }
}

// -------- UI ----------
function Pill({ children }) {
  return (
    <span style={styles.pill}>
      {children}
    </span>
  );
}

function ScoreBar({ label, value }) {
  const pct = Math.round(((value + 50) / 150) * 100);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
        <span style={{ opacity: 0.75 }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value}</span>
      </div>
      <div style={styles.barWrap}>
        <div style={{ ...styles.barFill, width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        {right}
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

function OptionCard({ option, onChoose }) {
  return (
    <button onClick={onChoose} style={styles.option}>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800 }}>{option.title}</div>
        <div style={{ opacity: 0.78, fontSize: 14, lineHeight: 1.35 }}>
          {option.description}
        </div>
        {option.flags?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {option.flags.map((f) => (
              <Pill key={f}>{f.replaceAll("_", " ")}</Pill>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function Results({ state, mentorMode }) {
  const total = weightedTotal(state.scores, SCENARIO.scoringWeights);

  const grade =
    total >= 70 ? { letter: "A", note: "Strong concept. Reviewer-friendly." } :
    total >= 45 ? { letter: "B", note: "Solid, but has a few weak spots." } :
    total >= 20 ? { letter: "C", note: "Passable, expect comments and rework." } :
    { letter: "D", note: "High risk. Revisit core assumptions." };

  const redFlags = [];
  if (state.flags.flooding_risk) redFlags.push("Ponding near critical structures/equipment");
  if (state.flags.ada_risk) redFlags.push("ADA compliance/maintenance vulnerability");
  if (state.flags.row_risk) redFlags.push("ROW utility conflict risk");
  if (state.flags.maintenance_conflict) redFlags.push("Future repairs could disrupt ADA route");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card
        title="Scorecard"
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Pill>Weighted total: {total}</Pill>
            <Pill>Grade: {grade.letter}</Pill>
          </div>
        }
      >
        <div style={{ opacity: 0.78, marginBottom: 12 }}>{grade.note}</div>
        <div style={styles.twoCol}>
          <ScoreBar label="Compliance" value={state.scores.compliance} />
          <ScoreBar label="Constructability" value={state.scores.constructability} />
          <ScoreBar label="Cost efficiency" value={state.scores.cost} />
          <ScoreBar label="Risk reduction" value={state.scores.risk} />
          <ScoreBar label="Schedule confidence" value={state.scores.schedule} />
        </div>

        {redFlags.length ? (
          <div style={styles.notice}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Red flags</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
              {redFlags.map((rf) => <li key={rf}>{rf}</li>)}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card title="Your decisions">
        <ol style={{ display: "grid", gap: 10, margin: 0, paddingLeft: 18 }}>
          {state.history.map((h, idx) => (
            <li key={idx} style={styles.decisionItem}>
              <div style={{ fontWeight: 800 }}>{h.title}</div>
              <div style={{ opacity: 0.78, marginTop: 6 }}>{h.rationale}</div>
              {mentorMode && h.mentorNotes?.length ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7 }}>Mentor notes</div>
                  <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                    {h.mentorNotes.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Next-step punchlist (suggested)">
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85, display: "grid", gap: 6 }}>
          <li>Confirm ADA running/cross slopes and landings; document route on plans.</li>
          <li>Identify overflow path for major storm; keep away from electrical and gates.</li>
          <li>Run a utility conflict check: crossings, separations, access to valves/vaults.</li>
          <li>Confirm stormwater feasibility (infiltration testing / setbacks / O&M).</li>
          <li>Verify maintenance vehicle turning and pavement section for loading.</li>
          <li>Define construction sequencing and temporary BMPs for the tie-ins.</li>
        </ul>
      </Card>
    </div>
  );
}

function StepView({ step, state, dispatch, mentorMode, setMentorMode }) {
  if (!step) return null;

  if (step.type === "brief") {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card
          title={step.title}
          right={
            <button style={styles.secondaryBtn} onClick={() => setMentorMode((v) => !v)}>
              Mentor mode: {mentorMode ? "On" : "Off"}
            </button>
          }
        >
          <div style={{ opacity: 0.85 }}>{step.prompt}</div>

          <div style={{ marginTop: 14, ...styles.twoCol }}>
            <div style={styles.panel}>
              <div style={{ fontWeight: 800 }}>Program</div>
              <div style={{ opacity: 0.78, marginTop: 6 }}>{SCENARIO.context.siteProgram}</div>
            </div>
            <div style={styles.panel}>
              <div style={{ fontWeight: 800 }}>Jurisdiction</div>
              <div style={{ opacity: 0.78, marginTop: 6 }}>{SCENARIO.context.jurisdiction}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, ...styles.twoCol }}>
            <div style={styles.panel}>
              <div style={{ fontWeight: 800 }}>Knowns</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                {SCENARIO.context.knowns.map((k) => <li key={k}>{k}</li>)}
              </ul>
            </div>
            <div style={styles.panel}>
              <div style={{ fontWeight: 800 }}>Constraints</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                {SCENARIO.context.constraints.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={styles.primaryBtn}
              onClick={() => dispatch({ type: "GOTO", stepId: step.nextStepId })}
            >
              Start
            </button>
          </div>
        </Card>

        <Card title="Reference buckets (for mentors)">
          <div style={styles.twoCol}>
            {SCENARIO.resources.map((r) => (
              <div key={r.label} style={styles.panel}>
                <div style={{ fontWeight: 800 }}>{r.label}</div>
                <div style={{ opacity: 0.78, marginTop: 6 }}>{r.hint}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (step.type === "decision") {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card
          title={step.title}
          right={
            <button style={styles.secondaryBtn} onClick={() => setMentorMode((v) => !v)}>
              Mentor mode: {mentorMode ? "On" : "Off"}
            </button>
          }
        >
          <div style={{ opacity: 0.85 }}>{step.prompt}</div>

          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {step.options.map((opt) => (
              <div key={opt.id} style={{ display: "grid", gap: 10 }}>
                <OptionCard
                  option={opt}
                  onChoose={() => dispatch({ type: "CHOOSE", stepId: step.id, option: opt })}
                />
                {mentorMode ? (
                  <div style={styles.notice}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>Mentor rationale</div>
                    <div style={{ opacity: 0.85 }}>{opt.rationale}</div>
                    {opt.mentorNotes?.length ? (
                      <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, opacity: 0.85 }}>
                        {opt.mentorNotes.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Live score (coaching view)">
          <div style={styles.twoCol}>
            <ScoreBar label="Compliance" value={state.scores.compliance} />
            <ScoreBar label="Constructability" value={state.scores.constructability} />
            <ScoreBar label="Cost efficiency" value={state.scores.cost} />
            <ScoreBar label="Risk reduction" value={state.scores.risk} />
            <ScoreBar label="Schedule confidence" value={state.scores.schedule} />
          </div>
        </Card>
      </div>
    );
  }

  if (step.type === "results") {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={styles.primaryBtn} onClick={() => dispatch({ type: "RESTART" })}>
            Play again
          </button>
          <button style={styles.secondaryBtn} onClick={() => setMentorMode((v) => !v)}>
            Mentor mode: {mentorMode ? "On" : "Off"}
          </button>
        </div>
        <Results state={state} mentorMode={mentorMode} />
      </div>
    );
  }

  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [mentorMode, setMentorMode] = useState(true);

  const step = useMemo(
    () => SCENARIO.steps.find((s) => s.id === state.stepId),
    [state.stepId]
  );

  const total = weightedTotal(state.scores, SCENARIO.scoringWeights);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <header style={{ marginBottom: 18 }}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.h1}>{SCENARIO.title}</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>{SCENARIO.subtitle}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Pill>Scenario: {SCENARIO.id}</Pill>
              <Pill>Weighted total: {total}</Pill>
            </div>
          </div>
        </header>

        <StepView
          step={step}
          state={state}
          dispatch={dispatch}
          mentorMode={mentorMode}
          setMentorMode={setMentorMode}
        />

        <footer style={{ marginTop: 28, opacity: 0.7, fontSize: 12 }}>
          <div style={styles.footerBox}>
            <div style={{ fontWeight: 800 }}>Next improvements</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Add random event cards (groundwater, utility hits, reviewer comments).</li>
              <li>Add branching consequences and “soft locks” (permit rejection, redesign).</li>
              <li>Add an SVG site map overlay that updates each step.</li>
              <li>Add export (PDF/print) of the debrief summary for mentoring.</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,0,0,0.06), transparent 60%)",
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: "#111",
  },
  wrap: { maxWidth: 980, margin: "0 auto", padding: "28px 16px" },
  headerRow: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 28, fontWeight: 900, letterSpacing: -0.4 },
  card: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 18,
    background: "white",
    boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  cardBody: { padding: 14 },
  panel: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.02)",
  },
  pill: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(0,0,0,0.03)",
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  option: {
    width: "100%",
    textAlign: "left",
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.12)",
    padding: 14,
    background: "white",
    cursor: "pointer",
    boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "#111",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 12px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  notice: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "rgba(0,0,0,0.04)",
  },
  decisionItem: {
    listStyle: "decimal",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "white",
  },
  barWrap: { height: 10, borderRadius: 999, background: "rgba(0,0,0,0.1)", overflow: "hidden" },
  barFill: { height: 10, borderRadius: 999, background: "rgba(0,0,0,0.65)" },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  footerBox: {
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 12,
    background: "white",
  },
};
