import type { CompactEvent } from "../types";
import { eventImageUrl } from "../data/sources";
import { EVENT_TYPE_NAME, badge, esc, fmtDate, head, htmlShell, panel, timeRange } from "./theme";

function status(event: CompactEvent, now: number): string {
  if (now < event.startAt) return badge("未开始", "rgba(127, 157, 221, .76)");
  if (now <= event.distributionEndAt) return badge("进行中", "rgba(30, 198, 173, .86)");
  return badge("已结束", "rgba(90, 111, 177, .74)");
}

function eventType(event: CompactEvent): string {
  return EVENT_TYPE_NAME[event.eventType] ?? event.eventType;
}

function rankingRanges(event: CompactEvent): string {
  return (event.eventRankingRewardRanges ?? [])
    .map((r) => `${r.fromRank}${r.fromRank !== r.toRank ? `~${r.toRank}` : ""}位`)
    .join("、");
}

export function renderEventDetail(event: CompactEvent, now = Date.now()): string {
  const image = event.assetbundleName ? eventImageUrl(event.assetbundleName) : "";
  const ranges = rankingRanges(event);
  const body = `
    <div class="event-detail-head"><div class="brand-mark">HATSUNE MIKU: COLORFUL STAGE!</div><span>EVENT #${event.id}</span></div>
    <div class="event-detail-layout">
      <section class="event-copy">
        <div class="eyebrow">${esc(eventType(event))}</div>
        <h1 class="event-title">${esc(event.nameZh ?? event.name)}</h1>
        ${event.nameZh && event.nameZh !== event.name ? `<div class="event-japanese">${esc(event.name)}</div>` : ""}
        <div class="event-badges">${badge(eventType(event), "rgba(113, 92, 211, .8)")} ${status(event, now)}</div>
        <div class="event-timeline glass-soft">
          <div class="timeline-title">时间</div>
          ${[
            ["开始", event.startAt],
            ["结算", event.aggregateAt],
            ["排行公布", event.rankingAnnounceAt],
            ["奖励发放", event.distributionStartAt],
            ["奖励截止", event.distributionEndAt],
            ["活动关闭", event.closedAt],
          ].map(([key, value]) => `<div class="timeline-row"><span>${esc(key as string)}</span><b>${value ? fmtDate(value as number) : "-"}</b></div>`).join("")}
          <div class="timeline-range">${esc(timeRange(event.startAt, event.distributionEndAt))}</div>
        </div>
      </section>
      <div class="event-visual glass"><img class="img-cover" src="${image}" alt="${esc(event.nameZh ?? event.name)}" onerror="this.style.opacity='.2'"/></div>
    </div>
    ${panel("排名奖励档位", `<p class="ranking-copy">${esc(ranges || "暂无排名奖励数据")}</p>`, "glass ranking-panel")}
    <div class="footer-note">✦ EVENT ARCHIVE · ${esc(event.unit)} ✦</div>`;

  return htmlShell(body, { title: event.nameZh ?? event.name, kind: "landscape", ratio: 0.6 });
}

export function renderEventList(events: CompactEvent[]): string {
  const body = `
    ${head("最近活动", `${events.length} EVENTS`)}
    <div class="event-list">
      ${events.map((event) => `
        <article class="event-list-item glass-soft">
          <div class="event-list-image">${event.assetbundleName ? `<img class="img-cover" src="${eventImageUrl(event.assetbundleName)}" alt="" onerror="this.style.opacity='.2'"/>` : ""}</div>
          <div class="event-list-copy"><h2>${esc(event.nameZh ?? event.name)}</h2><p>#${event.id} · ${esc(eventType(event))}</p></div>
          <div class="event-list-time"><b>${esc(fmtDate(event.startAt))}</b><span>✦</span><b>${esc(fmtDate(event.distributionEndAt))}</b></div>
        </article>`).join("")}
    </div>
    <div class="footer-note">✦ PROJECT SEKAI · EVENT ARCHIVE ✦</div>`;

  return htmlShell(body, { title: "最近活动", kind: "portrait", ratio: 1.27 });
}
