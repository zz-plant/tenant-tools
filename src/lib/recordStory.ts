import type { LineStop, LineStopState } from "./followUp";
import type { TaggedTimelineEntry } from "./submissionTimeline";

/*
 * A record's steps and dated facts on one line, for the record page. Before, the page drew the
 * stop line and then a separate "What happened" list, and a resident had to match dates between
 * the two. Here each fact sits in date order between the steps, and the steps still to come
 * follow at the end. No new data: it is the same stops and the same timeline entries.
 */

export type RecordStoryItem = {
  kind: "stop" | "fact";
  /** Stop label ("Notice") or fact label ("Management replied"). */
  label: string;
  /** A stop's state. Facts are always "fact". */
  state: LineStopState | "fact";
  date?: string;
  /** For a reached stop: the timeline entry it stands for, such as "Follow-up sent (by text)". */
  note?: string;
  /** A date counted from a rule, not something a resident reported. */
  counted?: boolean;
  /** A done step, or a fact dated today or earlier. The line is drawn in the problem's colour between two of these. */
  reached: boolean;
  /** The line from this item to the next one is drawn in the problem's colour. */
  joinsNext: boolean;
};

// On the same date: done steps, then facts, then undated done steps, then steps still to come.
const rank: Record<LineStopState | "fact", number> = { done: 0, fact: 1, open: 3, locked: 3, later: 4 };
const undatedDoneRank = 2;
const lastDate = "9999-12-31";

export const buildRecordStory = (line: LineStop[], entries: TaggedTimelineEntry[], today: string): RecordStoryItem[] => {
  const remaining = [...entries];

  const stops = line.map((stop, index) => {
    let note: string | undefined;
    if (stop.state === "done" && stop.date) {
      // The entry this stop stands for is shown once, as the stop's note, not again as a fact.
      const own = remaining.findIndex((entry) => entry.stop === stop.id && entry.date === stop.date);
      if (own >= 0) {
        note = remaining[own].label;
        remaining.splice(own, 1);
      }
    }
    // Done steps sit at their date. A done step without a date (a record marked resolved, a 311 number
    // with no date) sits at today, after today's facts. Open steps sit at today, locked steps at the
    // date they open, and later steps at the end.
    const sortDate =
      stop.state === "done"
        ? stop.date || today
        : stop.state === "later"
          ? lastDate
          : stop.state === "locked" && stop.date
            ? stop.date
            : today;
    const itemRank = stop.state === "done" && !stop.date ? undatedDoneRank : rank[stop.state];
    const item: RecordStoryItem = {
      kind: "stop",
      label: stop.label,
      state: stop.state,
      ...(stop.date ? { date: stop.date } : {}),
      ...(note ? { note } : {}),
      reached: stop.state === "done",
      joinsNext: false,
    };
    return { item, sortDate, rank: itemRank, order: index };
  });

  const facts = remaining.map((entry, index) => ({
    item: {
      kind: "fact" as const,
      label: entry.label,
      state: "fact" as const,
      date: entry.date,
      ...(entry.counted ? { counted: true } : {}),
      reached: entry.date <= today,
      joinsNext: false,
    },
    sortDate: entry.date,
    rank: rank.fact,
    order: line.length + index,
  }));

  const items = [...stops, ...facts]
    .sort((a, b) => a.sortDate.localeCompare(b.sortDate) || a.rank - b.rank || a.order - b.order)
    .map((entry) => entry.item);

  items.forEach((item, index) => {
    item.joinsNext = item.reached && Boolean(items[index + 1]?.reached);
  });
  return items;
};
