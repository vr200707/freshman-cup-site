export const teams = Object.freeze({
  1: { id: 1, name: "1队" },
  2: { id: 2, name: "2队" },
  3: { id: 3, name: "3队" },
  4: { id: 4, name: "4队" },
  5: { id: 5, name: "5队" },
  6: { id: 6, name: "6队" },
  7: { id: 7, name: "7队" },
  8: { id: 8, name: "8队" },
});

const scheduled = (home, away) => ({
  home,
  away,
  time: "18:00",
  status: "scheduled",
  score: null,
});

const completed = (home, away, homeScore, awayScore) => ({
  home,
  away,
  time: "18:00",
  status: "completed",
  score: { home: homeScore, away: awayScore },
});

export const matchdays = Object.freeze([
  {
    date: "2026-09-12",
    stage: "小组赛 · A组",
    round: "第 1 轮",
    fixtures: [
      { home: 2, away: 6, time: "18:00", status: "completed", score: { home: 3, away: 0 } },
      { home: 3, away: 5, time: "18:00", status: "completed", score: { home: 4, away: 2 } },
    ],
  },
  {
    date: "2026-09-15",
    stage: "小组赛 · B组",
    round: "第 1 轮",
    fixtures: [completed(1, 8, 5, 2), completed(4, 7, 4, 3)],
  },
  {
    date: "2026-09-17",
    stage: "小组赛 · A组",
    round: "第 2 轮",
    fixtures: [completed(2, 5, 6, 0), completed(6, 3, 0, 8)],
  },
  {
    date: "2026-09-19",
    stage: "小组赛 · B组",
    round: "第 2 轮",
    fixtures: [completed(1, 7, 2, 3), completed(8, 4, 1, 7)],
  },
  {
    date: "2026-09-20",
    stage: "小组赛 · A组",
    round: "第 3 轮",
    fixtures: [scheduled(2, 3), scheduled(5, 6)],
  },
  {
    date: "2026-09-22",
    stage: "小组赛 · B组",
    round: "第 3 轮",
    fixtures: [scheduled(1, 4), scheduled(7, 8)],
  },
  {
    date: "2026-09-24",
    stage: "淘汰赛",
    round: "半决赛",
    fixtures: [scheduled("A组第1", "B组第2"), scheduled("B组第1", "A组第2")],
  },
  {
    date: "2026-10-08",
    stage: "决赛日",
    round: "最终排名赛",
    fixtures: [scheduled("半决赛负者", "半决赛负者"), scheduled("半决赛胜者", "半决赛胜者")],
  },
]);

export const scorers = Object.freeze([{ name: "王相钧", goals: 1 }]);

function createStanding(id) {
  return { id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
}

function calculateGroup(groupLetter) {
  const table = Object.fromEntries(Object.keys(teams).map((id) => [id, createStanding(Number(id))]));
  matchdays
    .filter((matchday) => matchday.stage === `小组赛 · ${groupLetter}组`)
    .flatMap((matchday) => matchday.fixtures)
    .filter((fixture) => fixture.status === "completed" && fixture.score)
    .forEach(({ home, away, score }) => {
      const homeRow = table[home];
      const awayRow = table[away];
      homeRow.played += 1; awayRow.played += 1;
      homeRow.goalsFor += score.home; homeRow.goalsAgainst += score.away;
      awayRow.goalsFor += score.away; awayRow.goalsAgainst += score.home;
      if (score.home > score.away) {
        homeRow.wins += 1; homeRow.points += 3; awayRow.losses += 1;
      } else if (score.home < score.away) {
        awayRow.wins += 1; awayRow.points += 3; homeRow.losses += 1;
      } else {
        homeRow.draws += 1; awayRow.draws += 1; homeRow.points += 1; awayRow.points += 1;
      }
    });
  return Object.values(table)
    .filter((row) => row.played > 0)
    .sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor || a.id - b.id);
}

export const groupStandings = Object.freeze({ A: calculateGroup("A"), B: calculateGroup("B") });
