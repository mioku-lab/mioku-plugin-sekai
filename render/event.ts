import type { CompactEvent } from "../types";
import { eventImageUrl } from "../data/sources";
import { EVENT_TYPE_NAME, badge, esc, fmtDate, head, htmlShell, panel, timeRange } from "./theme";
import { fillTemplate, loadUi } from "./ui";

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
  const timeline = [
    ["开始", event.startAt],
    ["排行公布", event.rankingAnnounceAt],
    ["结束", event.aggregateAt],
    ["奖励发放", event.distributionStartAt],
    ["奖励分发截止", event.distributionEndAt],
    ["活动关闭", event.closedAt],
  ] as const;

  const body = fillTemplate(loadUi("templates/event-detail.html"), {
    TITLE: esc(event.nameZh ?? event.name),
    JAPANESE: event.nameZh && event.nameZh !== event.name ? `<div class="event-japanese">${esc(event.name)}</div>` : "",
    TYPE_BADGE: badge(eventType(event), "rgba(113, 92, 211, .86)"),
    STATUS_BADGE: status(event, now),
    EVENT_ID: String(event.id),
    TIMELINE_ROWS: timeline.map(([key, value]) => `<div class="timeline-cell"><span>${esc(key)}</span><b>${value ? fmtDate(value) : "-"}</b></div>`).join(""),
    RANGE: esc(timeRange(event.startAt, event.distributionEndAt)),
    IMAGE: image,
    RANKING_PANEL: panel("排名奖励档位", `<p class="ranking-copy">${esc(ranges || "暂无排名奖励数据")}</p>`, "glass ranking-panel"),
    UNIT: esc(event.unit),
  });

  return htmlShell(body, {
    title: event.nameZh ?? event.name,
    kind: "landscape",
    ratio: 0.6,
    className: "event-detail-scene",
    renderWidth: 1600,
  });
}

export function renderEventList(events: CompactEvent[]): string {
  const items = events.map((event) => `
        <article class="event-list-item glass-soft">
          <div class="event-list-image">${event.assetbundleName ? `<img class="img-cover" src="${eventImageUrl(event.assetbundleName)}" alt="" onerror="this.style.opacity='.2'"/>` : ""}</div>
          <div class="event-list-copy"><h2>${esc(event.nameZh ?? event.name)}</h2><p>#${event.id} · ${esc(eventType(event))}</p></div>
          <div class="event-list-time"><b>${esc(fmtDate(event.startAt))}</b><span>✦</span><b>${esc(fmtDate(event.distributionEndAt))}</b></div>
        </article>`).join("");

  const body = fillTemplate(loadUi("templates/event-list.html"), {
    HEAD: head("最近活动", `${events.length} EVENTS`),
    ITEMS: items,
  });

  return htmlShell(body, { title: "最近活动", kind: "portrait", ratio: 1.27, renderWidth: 1111 });
}