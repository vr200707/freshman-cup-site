import test from "node:test";
import assert from "node:assert/strict";
import { renderBadge, renderFixture, renderScorerRow, renderStandingsTable } from "../app.js";
import { groupStandings } from "../data.js";

test("renders supplied scores only for completed fixtures", () => {
  const html = renderFixture({
    home: 2,
    away: 6,
    time: "18:00",
    status: "completed",
    score: { home: 3, away: 0 },
  });
  assert.match(html, /fixture-score/);
  assert.match(html, /fixture-score sr-only/);
  assert.match(html, />3</);
  assert.match(html, />0</);
  assert.match(html, /已结束/);
});

test("does not invent a score for scheduled fixtures", () => {
  const html = renderFixture({
    home: 1,
    away: 8,
    time: "18:00",
    status: "scheduled",
    score: null,
  });
  assert.doesNotMatch(html, /fixture-score/);
  assert.doesNotMatch(html, /score-separator/);
  assert.match(html, /未开始/);
});

test("renders numbered and placeholder badges differently", () => {
  assert.match(renderBadge(2), /team-badge--2[^>]*>2</);
  const placeholder = renderBadge("A组第1");
  assert.match(placeholder, /team-badge--placeholder/);
  assert.doesNotMatch(placeholder, /team-badge--number/);
});

test("renders scorer rank, name, and goal count", () => {
  const html = renderScorerRow({ name: "王相钧", goals: 1 }, 0);
  assert.match(html, /排名 1/);
  assert.match(html, /王相钧/);
  assert.match(html, /1 球/);
});

test("renders standings columns and sorted team rows", () => {
  const html = renderStandingsTable("A", groupStandings.A);
  assert.match(html, /小组 A/);
  assert.match(html, /赛/);
  assert.match(html, /进\/失/);
  assert.match(html, /积分/);
  assert.ok(html.indexOf("3队") < html.indexOf("2队"));
  assert.match(html, /12\/2/);
  assert.match(html, />6</);
});
