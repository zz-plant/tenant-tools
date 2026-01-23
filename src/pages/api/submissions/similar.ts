import type { APIRoute } from "astro";
import { issueOptions, zoneOptions } from "../../../data/noticeData";

export const prerender = false;

const issueIds = new Set(issueOptions.map((issue) => issue.id));
const zoneIds = new Set(zoneOptions.map((zone) => zone.id));

const isValidDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf());
};

const daysBetween = (left: string, right: string) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  return Math.abs((leftDate.getTime() - rightDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const building = url.searchParams.get("building") || "";
  const issue = url.searchParams.get("issue") || "";
  const zone = url.searchParams.get("zone") || "";
  const startDate = url.searchParams.get("startDate") || "";
  const windowDays = 21;

  if (!building || !issue || !issueIds.has(issue) || (zone && !zoneIds.has(zone))) {
    return new Response(JSON.stringify({ matches: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const referenceDate = isValidDateString(startDate) ? startDate : "";
  const kv = locals.runtime?.env?.SUBMISSIONS_KV;
  if (!kv) {
    return new Response(JSON.stringify({ matches: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const matches: Array<{
    id: string;
    issueLabel: string;
    startDate: string;
    reportCount: number;
    zone?: string;
  }> = [];

  let cursor: string | undefined;
  do {
    const listResult = await kv.list({ prefix: "submission:", cursor, limit: 50 });
    cursor = listResult.list_complete ? undefined : listResult.cursor;

    for (const key of listResult.keys) {
      const record = (await kv.get(key.name, { type: "json" })) as
        | {
            id: string;
            building: string;
            issue: string;
            issueLabel: string;
            startDate: string;
            reportCount: number;
            zone?: string;
          }
        | null;
      if (!record) {
        continue;
      }
      if (record.building !== building || record.issue !== issue) {
        continue;
      }
      if (zone && record.zone !== zone) {
        continue;
      }
      if (referenceDate && record.startDate && isValidDateString(record.startDate)) {
        if (daysBetween(referenceDate, record.startDate) > windowDays) {
          continue;
        }
      }

      matches.push({
        id: record.id,
        issueLabel: record.issueLabel,
        startDate: record.startDate,
        reportCount: record.reportCount,
        zone: record.zone,
      });
    }
  } while (cursor && matches.length < 5);

  matches.sort((a, b) => a.startDate.localeCompare(b.startDate));

  return new Response(JSON.stringify({ matches }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
