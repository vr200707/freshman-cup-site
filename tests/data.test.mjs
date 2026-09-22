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

test("records only the eleven supplied completed scores", () => {
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
  assert.equal(fixtures[10].score, null);
  assert.equal(fixtures.slice(12).every((fixture) => fixture.score === null), true);
});

test("lists only the supplied scorer record", () => {
  assert.deepEqual(scorers, []);
});

test("updates the six supplied scores", () => {
  const scores = matchdays.slice(1, 4).flatMap((matchday) => matchday.fixtures.map((fixture) => fixture.score));
  assert.deepEqual(scores, [
    { home: 6, away: 2 }, { home: 4, away: 3 },
    { home: 6, away: 0 }, { home: 0, away: 8 },
    { home: 2, away: 2 }, { home: 1, away: 7 },
  ]);
});

test("records the September 20 draws", () => {
  assert.deepEqual(matchdays[4].fixtures.map((fixture) => fixture.score), [
    { home: 3, away: 3 },
    { home: 0, away: 0 },
  ]);
});

test("fills the A group semifinal qualifiers", () => {
  assert.deepEqual(matchdays[6].fixtures.map(({ home, away }) => ({ home, away })), [
    { home: 3, away: "B组第2" },
    { home: "B组第1", away: 2 },
  ]);
});

test("records the final B group forfeit as a 3-0 result", () => {
  const finalRound = matchdays[5].fixtures;
  assert.deepEqual(finalRound[1], {
    home: 7,
    away: 8,
    time: "18:00",
    status: "forfeit",
    score: { home: 3, away: 0 },
  });
});

test("calculates separate A and B group standings", () => {
  assert.deepEqual(groupStandings.A.map(({ id, played, wins, draws, losses, goalsFor, goalsAgainst, points }) => ({ id, played, wins, draws, losses, goalsFor, goalsAgainst, points })), [
    { id: 3, played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 15, goalsAgainst: 5, points: 7 },
    { id: 2, played: 3, wins: 2, draws: 1, losses: 0, goalsFor: 12, goalsAgainst: 3, points: 7 },
    { id: 5, played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 2, goalsAgainst: 10, points: 1 },
    { id: 6, played: 3, wins: 0, draws: 1, losses: 2, goalsFor: 0, goalsAgainst: 11, points: 1 },
  ]);
  assert.equal(groupStandings.B[0].id, 4);
  assert.equal(groupStandings.B[0].points, 6);
  assert.equal(groupStandings.B[0].goalsFor, 11);
});
