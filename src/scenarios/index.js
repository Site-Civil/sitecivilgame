import pumpStation01 from "./pump-station-01.json";

export const scenarios = [
  pumpStation01
];

export function getScenarioById(id) {
  return scenarios.find((s) => s.id === id);
}
