/**
 * AsyncJobPanel
 *
 * Komponen yang mengelola seluruh lifecycle prediksi asynchronous:
 *   1. Submit file ke /predict-async (jika bukan resume)
 *   2. Polling adaptif dengan backoff: 2s → 5s → 10s → 20s
 *   3. Menampilkan job timeline, elapsed timer, dan cache hit badge
 *   4. Auto-navigate countdown (3s) saat completed
 *   5. Persist job_id ke sessionStorage agar refresh tidak kehilangan tracking
 *
 * Props:
 *   cancerSlug     — slug cancer untuk endpoint
 *   datasetLabel   — feature_key
 *   cancerName     — nama cancer untuk display
 *   file           — File CSV (null jika resume dari sessionStorage)
 *   resumeJobId    — jika set, skip submission dan langsung poll job ini
 *   onCompleted    — callback saat job selesai, terima result + metadata
 *   onCancel       — callback saat user klik "Cancel"
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle2, XCircle, Loader2, Clock, Zap, Copy,
  Check, AlertTriangle, X, ArrowRight, WifiOff,
} from "lucide-react";
import {
  submitDiagnosisAsync,
  pollPredictionJob,
  type PredictionResult,
} from "../../models/diagnosis-model";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "aira_async_job";
const TIMEOUT_MS  = 5 * 60 * 1000; // 5 menit
const MAX_CONSECUTIVE_ERRORS = 3;   // tolerate transient network errors

/** Adaptive polling interval berdasarkan elapsed time */
function getPollingInterval(elapsedMs: number): number {
  if (elapsedMs < 20_000)  return 2_000;
  if (elapsedMs < 60_000)  return 5_000;
  if (elapsedMs < 120_000) return 10_000;
  return 20_000;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type PhaseKind =
  | "submitting"   // kirim file ke predict-async
  | "polling"      // menunggu job selesai
  | "completed"    // job sukses
  | "failed"       // job gagal (AI error / not_found)
  | "unavailable"  // Redis disabled di backend
  | "timeout";     // lebih dari TIMEOUT_MS

type Phase =
  | { kind: "submitting" }
  | { kind: "polling";    jobId: string; note?: string; isCacheHit?: boolean }
  | { kind: "completed";  jobId: string; result: PredictionResult; isCacheHit: boolean; totalTimeMs?: number }
  | { kind: "failed";     jobId?: string; error: string }
  | { kind: "unavailable" }
  | { kind: "timeout";    jobId: string };

export interface AsyncJobPanelProps {
  cancerSlug:  string;
  datasetLabel: string;
  cancerName:  string;
  file:        File | null;           // null = resume dari sessionStorage
  resumeJobId?: string;               // set = skip submission
  onCompleted: (
    result: PredictionResult,
    meta: { totalTimeMs?: number; isCacheHit: boolean }
  ) => void;
  onCancel: () => void;
}

// ─────────────────────────────────────────────────────────────
// sessionStorage helpers
// ─────────────────────────────────────────────────────────────

interface StoredJob {
  jobId: string;
  cancerSlug: string;
  cancerName: string;
  datasetLabel: string;
  startedAt: number;
}

function saveJob(data: StoredJob) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function clearJob() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const AsyncJobPanel: React.FC<AsyncJobPanelProps> = ({
  cancerSlug,
  datasetLabel,
  cancerName,
  file,
  resumeJobId,
  onCompleted,
  onCancel,
}) => {
  const [phase,      setPhase]      = useState<Phase>({ kind: "submitting" });
  const [elapsedMs,  setElapsedMs]  = useState(0);
  const [countdown,  setCountdown]  = useState<number | null>(null);
  const [isCopied,   setIsCopied]   = useState(false);

  // Refs untuk mengelola timers tanpa stale closure
  const pollingTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef       = useRef<number>(Date.now());
  const errorCountRef      = useRef(0);
  const isMountedRef       = useRef(true);
  const phaseRef           = useRef<PhaseKind>("submitting");

  // Simpan phase kind ke ref supaya doPoll selalu punya nilai terkini
  useEffect(() => { phaseRef.current = phase.kind; }, [phase]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current)    clearTimeout(pollingTimerRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (countdownTimerRef.current)  clearInterval(countdownTimerRef.current);
    };
  }, []);

  // ── Elapsed timer — ticks every second independently dari polling ──
  const startElapsedTimer = useCallback(() => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    startedAtRef.current = Date.now();
    elapsedIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
    }, 1000);
  }, []);

  // ── Auto-navigate countdown ──
  const startCountdown = useCallback(
    (result: PredictionResult, isCacheHit: boolean, totalTimeMs?: number) => {
      setCountdown(3);
      let remaining = 3;
      countdownTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          onCompleted(result, { isCacheHit, totalTimeMs });
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    },
    [onCompleted]
  );

  // ── Core: single poll iteration ──
  // Menggunakan useRef agar bisa dipanggil dari setTimeout tanpa stale closure
  const doPollRef = useRef<((jobId: string) => Promise<void>) | null>(null);

  const scheduleNextPoll = useCallback((jobId: string) => {
    if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
    const elapsed = Date.now() - startedAtRef.current;
    const interval = getPollingInterval(elapsed);
    pollingTimerRef.current = setTimeout(() => {
      doPollRef.current?.(jobId);
    }, interval);
  }, []);

  doPollRef.current = async (jobId: string) => {
    if (!isMountedRef.current) return;

    const elapsed = Date.now() - startedAtRef.current;

    // Timeout check
    if (elapsed > TIMEOUT_MS) {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      clearJob();
      setPhase({ kind: "timeout", jobId });
      return;
    }

    try {
      const result = await pollPredictionJob(jobId);
      if (!isMountedRef.current) return;

      errorCountRef.current = 0; // reset error counter on success

      switch (result.status) {
        case "processing":
          // Masih berjalan — schedule poll berikutnya
          scheduleNextPoll(jobId);
          break;

        case "completed":
          if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
          clearJob();
          setPhase({
            kind: "completed",
            jobId,
            result: result.result,
            isCacheHit: result.is_cache_hit ?? false,
            totalTimeMs: result.total_time_ms,
          });
          startCountdown(result.result, result.is_cache_hit ?? false, result.total_time_ms);
          break;

        case "failed":
          if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
          clearJob();
          setPhase({ kind: "failed", jobId, error: result.error });
          break;

        case "not_found":
          if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
          clearJob();
          setPhase({ kind: "failed", jobId, error: "Job not found or has expired (>24h)." });
          break;

        case "unavailable":
          if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
          clearJob();
          setPhase({ kind: "unavailable" });
          break;
      }
    } catch {
      // Toleransi error jaringan sementara
      errorCountRef.current += 1;
      if (!isMountedRef.current) return;
      if (errorCountRef.current >= MAX_CONSECUTIVE_ERRORS) {
        if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
        clearJob();
        setPhase({ kind: "failed", jobId, error: "Connection lost. Unable to reach server." });
      } else {
        scheduleNextPoll(jobId);
      }
    }
  };

  // ── Start polling for a given jobId ──
  const startPolling = useCallback(
    (jobId: string, note?: string, isCacheHit?: boolean) => {
      setPhase({ kind: "polling", jobId, note, isCacheHit });
      startElapsedTimer();
      // Poll pertama setelah 2s
      pollingTimerRef.current = setTimeout(() => {
        doPollRef.current?.(jobId);
      }, 2_000);
    },
    [startElapsedTimer]
  );

  // ── Entry point: submit or resume ──
  useEffect(() => {
    if (resumeJobId) {
      // Restore: langsung poll tanpa submit ulang
      startPolling(resumeJobId);
      return;
    }

    if (!file) return; // seharusnya tidak terjadi

    // New submission
    (async () => {
      const result = await submitDiagnosisAsync({ cancerSlug, datasetLabel, file });
      if (!isMountedRef.current) return;

      if (!result.success) {
        if (result.unavailable) {
          setPhase({ kind: "unavailable" });
        } else {
          setPhase({ kind: "failed", error: result.error });
        }
        return;
      }

      // Persist ke sessionStorage
      saveJob({
        jobId: result.job_id,
        cancerSlug,
        cancerName,
        datasetLabel,
        startedAt: Date.now(),
      });

      startPolling(result.job_id, result.note, result.cached);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Copy job ID ──
  const handleCopy = useCallback((jobId: string) => {
    navigator.clipboard.writeText(jobId).catch(() => {});
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  // ── Derived display values ──
  const jobId = "jobId" in phase ? phase.jobId : undefined;

  const statusMessage = (() => {
    switch (phase.kind) {
      case "submitting": return "Uploading your dataset…";
      case "polling":
        if (elapsedMs < 20_000) return "Job queued — AI model is initializing…";
        if (elapsedMs < 60_000) return "Processing your dataset…";
        if (elapsedMs < 120_000) return "Running deep analysis — this may take a moment…";
        return "Analysis in progress — almost there…";
      case "completed": return "Analysis complete!";
      case "failed":    return "Job failed";
      case "unavailable": return "Async mode unavailable";
      case "timeout":   return "Job timed out";
    }
  })();

  // ── Timeline step states ──
  // Steps: Submitted · Queued · Processing · Done
  type StepStatus = "done" | "active" | "pending";
  const steps: { label: string; status: StepStatus }[] = (() => {
    const done:    StepStatus = "done";
    const active:  StepStatus = "active";
    const pending: StepStatus = "pending";

    if (phase.kind === "submitting") return [
      { label: "Submitted",  status: active },
      { label: "Queued",     status: pending },
      { label: "Processing", status: pending },
      { label: "Complete",   status: pending },
    ];
    if (phase.kind === "polling") return [
      { label: "Submitted",  status: done },
      { label: "Queued",     status: done },
      { label: "Processing", status: active },
      { label: "Complete",   status: pending },
    ];
    if (phase.kind === "completed") return [
      { label: "Submitted",  status: done },
      { label: "Queued",     status: done },
      { label: "Processing", status: done },
      { label: "Complete",   status: done },
    ];
    // failed / timeout / unavailable
    return [
      { label: "Submitted",  status: done },
      { label: "Queued",     status: done },
      { label: "Processing", status: "active" },
      { label: "Complete",   status: pending },
    ];
  })();

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-fadeIn">

      {/* ── Main card ── */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden
        ${phase.kind === "completed"
          ? "border-green-200 bg-green-50"
          : phase.kind === "failed" || phase.kind === "timeout"
            ? "border-red-200 bg-red-50"
            : phase.kind === "unavailable"
              ? "border-amber-200 bg-amber-50"
              : "border-slate-200 bg-white"}`}>

        {/* ── Header ── */}
        <div className={`px-6 py-4 border-b flex items-center justify-between
          ${phase.kind === "completed"   ? "border-green-200 bg-green-100/50"
          : phase.kind === "failed" || phase.kind === "timeout"
                                         ? "border-red-200 bg-red-100/50"
          : phase.kind === "unavailable" ? "border-amber-200 bg-amber-100/50"
                                         : "border-slate-100 bg-slate-50"}`}>

          <div className="flex items-center gap-3">
            {/* Status icon */}
            {phase.kind === "submitting" || phase.kind === "polling" ? (
              <div className="w-8 h-8 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center">
                <Loader2 size={16} className="text-[#1E3A5F] animate-spin" />
              </div>
            ) : phase.kind === "completed" ? (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
              </div>
            ) : phase.kind === "unavailable" ? (
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <WifiOff size={16} className="text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle size={16} className="text-white" />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-800">{statusMessage}</p>
              <p className="text-xs text-slate-500">
                {cancerName} · {datasetLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cache hit badge */}
            {(phase.kind === "polling" && phase.isCacheHit) ||
             (phase.kind === "completed" && phase.isCacheHit) ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-semibold">
                <Zap size={10} /> Cache Hit
              </span>
            ) : null}

            {/* Cancel / Close button */}
            {phase.kind !== "completed" && (
              <button
                onClick={onCancel}
                title="Cancel job tracking"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600
                  hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Timeline steps ── */}
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center
                    text-xs font-bold transition-all duration-500
                    ${step.status === "done"
                      ? "bg-green-500 text-white"
                      : step.status === "active" && (phase.kind === "failed" || phase.kind === "timeout")
                        ? "bg-red-400 text-white"
                        : step.status === "active"
                          ? "bg-[#1E3A5F] text-white ring-2 ring-[#1E3A5F]/30"
                          : "bg-slate-100 text-slate-400"}`}>
                    {step.status === "done" ? (
                      <CheckCircle2 size={14} />
                    ) : step.status === "active" && phase.kind !== "failed" && phase.kind !== "timeout" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap
                    ${step.status === "done" ? "text-green-600"
                    : step.status === "active" && (phase.kind !== "failed" && phase.kind !== "timeout") ? "text-[#1E3A5F]"
                    : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 transition-all duration-700
                    ${steps[i + 1].status !== "pending" ? "bg-green-300" : "bg-slate-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Job ID row ── */}
          {jobId && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-400 font-medium shrink-0">Job ID</span>
              <span className="text-xs font-mono text-slate-700 truncate flex-1">
                {jobId}
              </span>
              <button
                onClick={() => handleCopy(jobId)}
                title="Copy job ID"
                className="p-1 rounded hover:bg-slate-200 text-slate-400
                  hover:text-slate-600 transition-colors shrink-0"
              >
                {isCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
            </div>
          )}

          {/* ── Elapsed time (while polling) ── */}
          {(phase.kind === "polling" || phase.kind === "submitting") && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock size={14} className="text-slate-400" />
              <span>
                Elapsed: <span className="font-mono font-semibold text-slate-700">
                  {formatDuration(elapsedMs)}
                </span>
              </span>
              {elapsedMs > 120_000 && (
                <span className="text-xs text-amber-600 font-medium">
                  — taking longer than usual
                </span>
              )}
            </div>
          )}

          {/* ── Note from server (e.g. "Joined existing job") ── */}
          {phase.kind === "polling" && phase.note && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border
              border-blue-200 rounded-lg text-xs text-blue-700">
              <Zap size={12} className="shrink-0" />
              {phase.note}
            </div>
          )}

          {/* ── Animated progress bar (while polling) ── */}
          {(phase.kind === "polling" || phase.kind === "submitting") && (
            <div className="space-y-1.5">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#1E3A5F] to-cyan-400
                  rounded-full animate-progress-indeterminate" />
              </div>
              <p className="text-xs text-slate-400 text-center">
                {phase.kind === "submitting"
                  ? "Uploading…"
                  : `Polling every ${getPollingInterval(elapsedMs) / 1000}s`}
              </p>
            </div>
          )}

          {/* ── Completed state ── */}
          {phase.kind === "completed" && (
            <div className="space-y-4">
              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-green-200 text-center">
                  <p className="text-xs text-slate-400 mb-1">Total Time</p>
                  <p className="text-lg font-bold text-green-700">
                    {phase.totalTimeMs ? formatDuration(phase.totalTimeMs) : formatDuration(elapsedMs)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-green-200 text-center">
                  <p className="text-xs text-slate-400 mb-1">Source</p>
                  <p className={`text-sm font-bold flex items-center justify-center gap-1
                    ${phase.isCacheHit ? "text-yellow-600" : "text-[#1E3A5F]"}`}>
                    {phase.isCacheHit ? <><Zap size={14}/> Cache</> : <>AI Model</>}
                  </p>
                </div>
              </div>

              {/* Auto-navigate countdown */}
              {countdown !== null && (
                <p className="text-xs text-center text-slate-500">
                  Redirecting to results in{" "}
                  <span className="font-bold text-green-600">{countdown}s</span>…
                </p>
              )}

              {/* Manual navigate */}
              <button
                onClick={() => {
                  if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
                  onCompleted(phase.result, {
                    isCacheHit: phase.isCacheHit,
                    totalTimeMs: phase.totalTimeMs,
                  });
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  bg-green-600 text-white text-sm font-semibold hover:bg-green-700
                  transition-colors"
              >
                View Results <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── Failed state ── */}
          {phase.kind === "failed" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200
                rounded-lg text-sm text-red-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <p>{phase.error}</p>
              </div>
              <button
                onClick={onCancel}
                className="w-full py-2.5 rounded-lg border border-slate-300 text-slate-700
                  text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Back to Upload
              </button>
            </div>
          )}

          {/* ── Unavailable state ── */}
          {phase.kind === "unavailable" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200
                rounded-lg text-sm text-amber-800">
                <WifiOff size={15} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Async Mode Unavailable</p>
                  <p className="text-xs">
                    The background processing service (Redis) is currently disabled.
                    Please switch to Standard mode.
                  </p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="w-full py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm
                  font-semibold hover:bg-[#1A3352] transition-colors"
              >
                Switch to Standard Mode
              </button>
            </div>
          )}

          {/* ── Timeout state ── */}
          {phase.kind === "timeout" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200
                rounded-lg text-sm text-red-700">
                <Clock size={15} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Job Timed Out</p>
                  <p className="text-xs">
                    The job is taking more than 5 minutes. The job may still be running
                    on the server — you can retry polling or go back to upload.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setElapsedMs(0);
                    startPolling(phase.jobId);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                    border border-slate-300 text-slate-700 text-sm font-medium
                    hover:bg-slate-50 transition-colors"
                >
                  <Loader2 size={14} /> Resume Polling
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700
                    text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Back to Upload
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AsyncJobPanel;

// ─────────────────────────────────────────────────────────────
// Exported helper: load pending job from sessionStorage
// Dipanggil dari UploadDiagnosis saat mount untuk resume support
// ─────────────────────────────────────────────────────────────
export function loadPendingJob(cancerSlug: string): StoredJob | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const job: StoredJob = JSON.parse(raw);
    // Hanya restore jika cancer slug cocok dan tidak expired (24h)
    const AGE_MS = Date.now() - job.startedAt;
    if (job.cancerSlug !== cancerSlug || AGE_MS > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return job;
  } catch {
    return null;
  }
}
