/**
 * Shared async-job sessionStorage utilities.
 *
 * Centralised here so AsyncJobPanel, UploadDiagnosis, and ResultDiagnosis
 * all operate on the same key — no magic-string duplication.
 *
 * Why sessionStorage and not state / context?
 * sessionStorage survives hard-refreshes (same tab) but is automatically
 * wiped when the tab is closed, so jobs never leak across sessions.
 */

export const ASYNC_JOB_KEY = "aira_async_job";

export interface StoredJob {
  jobId: string;
  cancerSlug: string;
  cancerName: string;
  datasetLabel: string;
  startedAt: number;
}

export function saveJob(data: StoredJob): void {
  try { sessionStorage.setItem(ASYNC_JOB_KEY, JSON.stringify(data)); } catch {}
}

export function clearJob(): void {
  try { sessionStorage.removeItem(ASYNC_JOB_KEY); } catch {}
}

/**
 * Returns the saved job if it matches cancerSlug and is within 24 h.
 * Automatically clears expired / mismatched entries.
 */
export function loadPendingJob(cancerSlug: string): StoredJob | null {
  try {
    const raw = sessionStorage.getItem(ASYNC_JOB_KEY);
    if (!raw) return null;
    const job: StoredJob = JSON.parse(raw);
    const ageMs = Date.now() - job.startedAt;
    if (job.cancerSlug !== cancerSlug || ageMs > 24 * 60 * 60 * 1000) {
      clearJob();
      return null;
    }
    return job;
  } catch {
    return null;
  }
}
