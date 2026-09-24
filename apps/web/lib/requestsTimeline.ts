import type { RequestRow, RequestStatus } from '@/types/dashboard';

export type TimelineStageId =
  | 'submitted'
  | 'underReview'
  | 'documentsRequested'
  | 'approved'
  | 'rejected'
  | 'resolved';

export type TimelineEvent = {
  id: string;
  stage: TimelineStageId;
  /** ISO date. */
  at: string;
};

/** A per-row local override: the mock "Approve / Request documents / Reject" actions. */
export type RequestOverride = {
  status: RequestStatus;
  extraEvents: TimelineEvent[];
};

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash;
}

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Synthesises the history that led to a row's *original* status, using only
 * its id and submission date — so it's stable across re-renders and never
 * needs to be stored. Local actions append further events on top of this in
 * the page's override map; they never rewrite it.
 */
export function buildBaseTimeline(row: RequestRow): TimelineEvent[] {
  const seed = hashId(row.id);
  const events: TimelineEvent[] = [
    { id: `${row.id}-submitted`, stage: 'submitted', at: row.submittedAt },
  ];

  if (row.status === 'open') return events;

  const reviewDate = addDays(row.submittedAt, 1 + (seed % 3));
  events.push({ id: `${row.id}-review`, stage: 'underReview', at: reviewDate });

  if (row.status === 'in-progress') {
    if (seed % 3 === 0) {
      events.push({
        id: `${row.id}-docs`,
        stage: 'documentsRequested',
        at: addDays(reviewDate, 1),
      });
    }
    return events;
  }

  // resolved — most rows were approved, a fifth were rejected.
  const decisionDate = addDays(reviewDate, 2 + (seed % 3));
  if (seed % 5 === 0) {
    events.push({ id: `${row.id}-rejected`, stage: 'rejected', at: decisionDate });
  } else {
    events.push({ id: `${row.id}-approved`, stage: 'approved', at: decisionDate });
    events.push({
      id: `${row.id}-resolved`,
      stage: 'resolved',
      at: addDays(decisionDate, 1),
    });
  }
  return events;
}

const TODAY_ISO = '2026-09-21';

/** Builds the action events for the drawer's three buttons — all dated "today". */
export function actionEvent(id: string, stage: 'approved' | 'documentsRequested' | 'rejected'): TimelineEvent {
  return { id: `${id}-${stage}-${Date.now()}`, stage, at: TODAY_ISO };
}
