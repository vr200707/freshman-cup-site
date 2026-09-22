import { groupStandings, matchdays, scorers, teams } from "./data.js";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const teamName = (teamId) => teams[teamId]?.name ?? String(teamId);

export function renderBadge(teamId) {
  if (Number.isInteger(teamId) && teams[teamId]) {
    return `<span class="team-badge team-badge--number team-badge--${teamId}" aria-label="${teamId}队队徽">${teamId}</span>`;
  }
  return `<span class="team-badge team-badge--placeholder" aria-hidden="true">◆</span>`;
}

function renderTeam(teamId, score, side) {
  const scoreHtml = score === null ? "" : `<strong class="team-score team-score--${side}">${score}</strong>`;
  return `<div class="team-row">
    ${renderBadge(teamId)}
    <span class="team-name">${escapeHtml(teamName(teamId))}</span>
    ${scoreHtml}
  </div>`;
}

export function renderFixture(fixture) {
  const completed = ["completed", "forfeit"].includes(fixture.status) && fixture.score !== null;
  const scoreHtml = completed
    ? `<div class="fixture-score sr-only" aria-label="比分 ${fixture.score.home} 比 ${fixture.score.away}">
        <span>${fixture.score.home}</span><i class="score-separator">:</i><span>${fixture.score.away}</span>
      </div>`
    : "";

  return `<article class="fixture-card ${completed ? "is-completed" : "is-scheduled"}">
    <div class="fixture-teams">
      ${renderTeam(fixture.home, completed ? fixture.score.home : null, "home")}
      ${renderTeam(fixture.away, completed ? fixture.score.away : null, "away")}
    </div>
    ${scoreHtml}
    <div class="fixture-meta">
      <span class="fixture-status">${fixture.status === "forfeit" ? "弃赛" : completed ? "已结束" : "未开始"}</span>
      <time>${escapeHtml(fixture.time)}</time>
    </div>
  </article>`;
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `<span>${month}.${day}</span><small>${year}</small>`;
}

export function renderMatchday(matchday) {
  return `<section class="matchday">
    <header class="matchday-heading">
      <div class="matchday-date"><time datetime="${escapeHtml(matchday.date)}">${formatDate(matchday.date)}</time></div>
      <div><p>${escapeHtml(matchday.stage)}</p><h3>${escapeHtml(matchday.round)}</h3></div>
      <span class="matchday-time">18:00 开球</span>
    </header>
    <div class="fixture-grid">${matchday.fixtures.map(renderFixture).join("")}</div>
  </section>`;
}

export function renderScorerRow(scorer, index) {
  const rank = index + 1;
  return `<li class="scorer-row" aria-label="排名 ${rank}，${escapeHtml(scorer.name)}，${scorer.goals} 球">
    <span class="scorer-rank">${rank}</span>
    <span class="scorer-player"><span class="player-avatar" aria-hidden="true">${escapeHtml(scorer.name.slice(0, 1))}</span><strong>${escapeHtml(scorer.name)}</strong></span>
    <span class="goal-count"><strong>${scorer.goals}</strong> 球</span>
  </li>`;
}

export function renderScorerEmpty() {
  return `<li class="scorer-empty"><span class="empty-mark" aria-hidden="true">✦</span><strong>淘汰赛尚未开始</strong><small>淘汰赛开始后，进球数据会显示在这里。</small></li>`;
}

export function renderStandingsTable(group, rows) {
  return `<section class="standings-group">
    <div class="standings-group-heading"><span>小组 ${escapeHtml(group)}</span><small>积分榜</small></div>
    <div class="standings-head" aria-hidden="true"><span>排名</span><span>球队</span><span>赛</span><span>胜</span><span>平</span><span>负</span><span>进/失</span><span>积分</span></div>
    <ol class="standings-list">${rows.map((row, index) => {
      const goalDiff = row.goalsFor - row.goalsAgainst;
      return `<li class="standing-row ${index === 0 ? "is-qualified" : ""}">
        <span class="standing-rank">${index + 1}</span>
        <span class="standing-team">${renderBadge(row.id)}<strong>${escapeHtml(teamName(row.id))}</strong></span>
        <span>${row.played}</span><span>${row.wins}</span><span>${row.draws}</span><span>${row.losses}</span>
        <span>${row.goalsFor}/${row.goalsAgainst}<small class="goal-diff">${goalDiff > 0 ? "+" : ""}${goalDiff}</small></span>
        <strong class="standing-points">${row.points}</strong>
      </li>`;
    }).join("")}</ol>
  </section>`;
}

function initialize() {
  const scheduleList = document.querySelector("#schedule-list");
  const scorersList = document.querySelector("#scorers-list");
  const standingsList = document.querySelector("#standings-list");
  scheduleList.innerHTML = matchdays.map(renderMatchday).join("");
  scorersList.innerHTML = scorers.length ? scorers.map(renderScorerRow).join("") : renderScorerEmpty();
  standingsList.innerHTML = renderStandingsTable("A", groupStandings.A) + renderStandingsTable("B", groupStandings.B);

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const activateTab = (tab) => {
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      document.getElementById(candidate.dataset.panel).hidden = !selected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
}

if (typeof document !== "undefined") initialize();
