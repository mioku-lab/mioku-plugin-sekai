import type { CompactEvent } from "../types";
import {
  EVENT_TYPE_NAME,
  badge,
  esc,
  fmtDate,
  head,
  htmlShell,
  kv,
  panel,
  timeRange,
} from "./theme";

export function renderEventDetail(event: CompactEvent, now = Date.now()): string {
  const typeName = EVENT_TYPE_NAME[event.eventType] ?? event.eventType;
  const status =
    now < event.startAt
      ? badge("未开始", "#8fa3b8")
      : now <= event.distributionEndAt
        ? badge("进行中", "#42c6b6")
        : badge("已结束", "#6f768c");

  const body = `
    ${head(event.nameZh ?? event.name, `Event #${event.id}`)}
    ${event.nameZh && event.nameZh !== event.name ? `<div class="name-ja" style="margin-bottom:12px">${esc(event.name)}</div>` : ""}
    <div class="panel">
      <div class="row">
        ${badge(esc(typeName), "#7f9cf5")}
        ${status}
      </div>
    </div>
    <div class="panel">
      <h3>时间</h3>
      <div class="row">
        ${kv("开始", fmtDate(event.startAt))}
        ${kv("结算", fmtDate(event.aggregateAt))}
        ${kv("排行公布", fmtDate(event.rankingAnnounceAt))}
        ${kv("奖励分发截止", fmtDate(event.distributionEndAt))}
      </div>
      <div class="hr"></div>
      <div class="muted">${esc(timeRange(event.startAt, event.distributionEndAt))}</div>
    </div>`;

  return htmlShell(body);
}

export function renderEventList(events: CompactEvent[]): string {
  const body = `
    ${head("最近活动", `${events.length} 期`)}
    ${events
      .map(
        (e) => `
      <div class="panel" style="display:flex;align-items:center;gap:14px">
        <div style="flex:1">
          <div class="name-zh" style="font-size:16px">${esc(e.nameZh ?? e.name)}</div>
          ${e.nameZh && e.nameZh !== e.name ? `<div class="name-ja" style="font-size:12px">${esc(e.name)}</div>` : ""}
          <div class="muted" style="margin-top:4px">#${e.id} · ${esc(EVENT_TYPE_NAME[e.eventType] ?? e.eventType)}</div>
        </div>
        <div class="muted" style="text-align:right;font-size:12px;line-height:1.7">${esc(
          fmtDate(e.startAt),
        )}<br/>${esc(fmtDate(e.distributionEndAt))}</div>
      </div>`,
      )
      .join("")}`;

  return htmlShell(body);
}
