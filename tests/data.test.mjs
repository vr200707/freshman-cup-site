import test from "node:test";
import assert from "node:assert/strict";
import { matchdays, scorers, teams, groupStandings } from "../data.js";

test("publishes eight numbered teams", () => {
  assert.deepEqual(Object.keys(teams), ["1", "2", "3", "4", "5", "6", "7", "8"]);
});

test("keeps the complete schedule at 18:00", () => {
  assert.equal(matchdays.length, 8);
  const fixtures = matchdays.flatMap((matchday) => matchday.fixtures);
  assert.equal(fixtures.length, 16);
  assert.equal(fixtures.every((fixture) => fixture.time === "18:00"), true);
});

test("records only the eight supplied completed scores", () => {
  const fixtures = matchdays.flatMap((matchday) => matchday.fixtures);
  assert.deepEqual(fixtures[0], {
    home: 2,
    away: 6,
    time: "18:00",
    status: "completed",
    score: { home: 3, away: 0 },
  });
  assert.deepEqual(fixtures[1], {
    home: 3,
    away: 5,
    time: "18:00",
    status: "completed",
    score: { home: 4, away: 2 },
  });
  assert.equal(fixtures.slice(8).every((fixture) => fixture.score === null), true);
});

test("lists only the supplied scorer record", () => {
  assert.deepEqual(scorers, [{ name: "王相钧", goals: 1 }]);
});

test("updates the six supplied scores", () => {
  const scores = matchdays.slice(1, 4).flatMap((matchday) => matchday.fixtures.map((fixture) => fixture.score));
  assert.deepEqual(scores, [
    { home: 5, away: 2 }, { home: 4, away: 3 },
    { home: 6, away: 0 }, { home: 0, away: 8 },
    { home: 2, away: 2 }, { home: 1, away: 7 },
  ]);
});

test("calculates separate A and B group standings", () => {
  assert.deepEqual(groupStandings.A.map(({ id, played, wins, draws, losses, goalsFor, goalsAgainst, points }) => ({ id, played, wins, draws, losses, goalsFor, goalsAgainst, points })), [
    { id: 3, played: 2, wins: 2, draws: 0, losses: 0, goalsFor: 12, goalsAgainst: 2, points: 6 },
    { id: 2, played: 2, wins: 2, draws: 0, losses: 0, goalsFor: 9, goalsAgainst: 0, points: 6 },
    { id: 5, played: 2, wins: 0, draws: 0, losses: 2, goalsFor: 2, goalsAgainst: 10, points: 0 },
    { id: 6, played: 2, wins: 0, draws: 0, losses: 2, goalsFor: 0, goalsAgainst: 11, points: 0 },
  ]);
  assert.equal(groupStandings.B[0].id, 4);
  assert.equal(groupStandings.B[0].points, 6);
  assert.equal(groupStandings.B[0].goalsFor, 11);
});
