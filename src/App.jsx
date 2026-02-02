import React, { useMemo, useReducer, useState } from "react";
import { scenarios, getScenarioById } from "./scenarios";
import { Card, OptionCard, Pill, ScoreBar, styles } from "./ui/components";
import {
  applyChoice,
  applyEventChoice,
  buildRedFlags,
  gradeFromTotal,
  makeInitialRun,
  weightedTotal,
  isEventStepId,
  parseEventId,
} from "./engine/gameEngine";


function Home({ onPlay }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card title="Scenario Library" right={<Pill>{scenarios.length} scenario(s)</Pill>}>
        <div style={{ opacity: 0.8 }}>
          Pick a scenario to play. Later we’ll add search, tags, difficulty, and modules (Drainage / ADA / Utilities).
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {scenarios.map((s) => (
            <div key={s.id} style={styles.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {s.title}: {s.subtitle}
                  </div>
                  <div style={{ opacity: 0.8, marginTop: 6 }}>{s.description}</div>
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill>ID: {s.id}</Pill>
                    <Pill>Difficulty: {s.difficulty}</Pill>
                  </div>
                </div>

                <button style={styles.primaryBtn} onClick={() => onPlay(s.id)}>
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Roadmap">
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85, display: "grid", gap: 6 }}>
          <li>Multiple scenarios by discipline and jurisdiction (pump station, PRV vault, lift station, small roadway tie-in)</li>
          <li>Random event cards (groundwater, utility conflicts, reviewer comments)</li>
          <li>Branching consequences and “rework loops”</li>
          <li>SVG site map panel that updates as decisions are made</li>
          <li>Debrief export (print/PDF) to use in mentoring calls</li>
        </ul>
      </Card>
    </div>
  );
}

function Results({ scenario, runState, mentorMode }) {
  const total = weightedTotal(runState.scores, scenario.scoringWeights);
  const grade = gradeFromTotal(total);
  const redFlags = buildRedFlags(runState.flags);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card
        title="Scorecard"
        right={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Pill>Weighted total: {total}</Pill>
            <Pill>Grade: {grade.letter}</Pill>
          </div>
        }
      >
        <div style={{ opacity: 0.78, marginBottom: 12 }}>{grade.note}</div>

        <div style={styles.twoCol}>
          <ScoreBar label="Compliance" value={runState.scores.compliance} />
          <ScoreBar label="Constructability" value={runState.scores.constructability} />
          <ScoreBar label="Cost efficiency" value={runState.scores.cost} />
          <ScoreBar label="Risk reduction" value={runState.scores.risk} />
          <ScoreBar label="Schedule confidence" value={runState.scores.schedule} />
        </div>

        {redFlags.length ? (
          <div style={{ ...styles.notice, marginTop: 12 }}>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Red flags</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
              {redFlags.map((rf) => (
                <li key={rf}>{rf}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card title="Your decisions">
        <ol style={{ display: "grid", gap: 10, margin: 0, paddingLeft: 18 }}>
          {runState.history.map((h, idx) => (
            <li key={idx} style={styles.panel}>
              <div style={{ fontWeight: 900 }}>
                {idx + 1}. {h.title}
              </div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>{h.rationale}</div>
              {mentorMode && h.mentorNotes?.length ? (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>Mentor notes</div>
                  <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                    {h.mentorNotes.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
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
          <li>Confirm stormwater feasibility (infiltration testing / setbacks / O&amp;M).</li>
          <li>Verify maintenance vehicle turning and pavement section for loading.</li>
          <li>Define construction sequencing and temporary BMPs for the tie-ins.</li>
        </ul>
      </Card>
    </div>
  );
}

function Player({ scenario, onExit }) {
  const [mentorMode, setMentorMode] = useState(true);
  const [runState, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "RESET":
        return makeInitialRun(scenario);
      case "GOTO":
        return { ...state, stepId: action.stepId };
      case "CHOOSE":
        return applyChoice(state, action.stepId, action.option);
      default:
        return state;
    }
  }, null, () => makeInitialRun(scenario));

  const step = useMemo(
    () => scenario.steps.find((s) => s.id === runState.stepId),
    [scenario.steps, runState.stepId]
  );

  const total = weightedTotal(runState.scores, scenario.scoringWeights);

  if (!step) {
    return (
      <Card title="Error">
        Step not found: <b>{runState.stepId}</b>
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button style={styles.secondaryBtn} onClick={onExit}>
          ← Back to library
        </button>
        <button style={styles.secondaryBtn} onClick={() => setMentorMode((v) => !v)}>
          Mentor mode: {mentorMode ? "On" : "Off"}
        </button>
        <Pill>Weighted total: {total}</Pill>
      </div>

      {step.type === "brief" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <Card title={step.title}>
            <div style={{ opacity: 0.85 }}>{step.prompt}</div>

            <div style={{ marginTop: 14, ...styles.twoCol }}>
              <div style={styles.panel}>
                <div style={{ fontWeight: 900 }}>Program</div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>{scenario.context.siteProgram}</div>
              </div>
              <div style={styles.panel}>
                <div style={{ fontWeight: 900 }}>Jurisdiction</div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>{scenario.context.jurisdiction}</div>
              </div>
            </div>

            <div style={{ marginTop: 14, ...styles.twoCol }}>
              <div style={styles.panel}>
                <div style={{ fontWeight: 900 }}>Knowns</div>
                <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                  {scenario.context.knowns.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.panel}>
                <div style={{ fontWeight: 900 }}>Constraints</div>
                <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
                  {scenario.context.constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.primaryBtn} onClick={() => dispatch({ type: "GOTO", stepId: step.nextStepId })}>
                Start
              </button>
            </div>
          </Card>

          <Card title="Reference buckets (for mentors)">
            <div style={styles.twoCol}>
              {scenario.resources.map((r) => (
                <div key={r.label} style={styles.panel}>
                  <div style={{ fontWeight: 900 }}>{r.label}</div>
                  <div style={{ opacity: 0.8, marginTop: 6 }}>{r.hint}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {step.type === "decision" ? (
        <Card title={step.title}>
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
                    <div style={{ fontWeight: 900, marginBottom: 6 }}>Mentor rationale</div>
                    <div style={{ opacity: 0.85 }}>{opt.rationale}</div>
                    {opt.mentorNotes?.length ? (
                      <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, opacity: 0.85 }}>
                        {opt.mentorNotes.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8, opacity: 0.8 }}>Live score</div>
            <div style={styles.twoCol}>
              <ScoreBar label="Compliance" value={runState.scores.compliance} />
              <ScoreBar label="Constructability" value={runState.scores.constructability} />
              <ScoreBar label="Cost efficiency" value={runState.scores.cost} />
              <ScoreBar label="Risk reduction" value={runState.scores.risk} />
              <ScoreBar label="Schedule confidence" value={runState.scores.schedule} />
            </div>
          </div>
        </Card>
      ) : null}

      {step.type === "results" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.primaryBtn} onClick={() => dispatch({ type: "RESET" })}>
              Play again
            </button>
            <button style={styles.secondaryBtn} onClick={onExit}>
              Back to library
            </button>
          </div>
          <Results scenario={scenario} runState={runState} mentorMode={mentorMode} />
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState({ name: "home", scenarioId: null });

  const scenario = screen.scenarioId ? getScenarioById(screen.scenarioId) : null;

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <header style={{ marginBottom: 18 }}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.h1}>Site Civil Game</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>
                Scenario-based training for junior engineers (site-civil decision simulator).
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Pill>Repo: sitecivilgame</Pill>
              <Pill>Mode: Library</Pill>
            </div>
          </div>
        </header>

        {screen.name === "home" ? (
          <Home onPlay={(id) => setScreen({ name: "play", scenarioId: id })} />
        ) : null}

        {screen.name === "play" && scenario ? (
          <Player scenario={scenario} onExit={() => setScreen({ name: "home", scenarioId: null })} />
        ) : null}

        <footer style={{ marginTop: 28, opacity: 0.7, fontSize: 12 }}>
          <div style={styles.panel}>
            <div style={{ fontWeight: 900 }}>Next build step</div>
            <div style={{ marginTop: 6 }}>
              Add a second scenario JSON file and list it in <code>src/scenarios/index.js</code>.
              The app will automatically show it in the library.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
