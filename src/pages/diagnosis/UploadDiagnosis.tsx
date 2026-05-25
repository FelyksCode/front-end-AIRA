import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Upload, FileText, CheckCircle2, ArrowLeft, Trash2,
  ChevronRight, Home, Microscope, AlertCircle, Zap, Activity,
} from "lucide-react";
import Footer from "../../components/layout/Footer";
import { submitDiagnosis } from "../../models/diagnosis-model";
import AsyncJobPanel from "../../components/diagnosis/AsyncJobPanel";
import { loadPendingJob } from "../../utils/async-job-store";
import type { PredictionResult } from "../../models/diagnosis-model";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ProcessingMode = "standard" | "async";

interface PendingAsyncJob {
  file:         File | null;
  resumeJobId?: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const UploadDiagnosis: React.FC = () => {
  const { cancerSlug } = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();
  const { cancerName, datasetLabel } = location.state || {};

  // ── Form state ──
  const [file,        setFile]        = useState<File | null>(null);
  const [error,       setError]       = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [dragging,    setDragging]    = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [elapsed,     setElapsed]     = useState(0);

  // ── Processing mode ──
  const [mode, setMode] = useState<ProcessingMode>("standard");

  // ── Async job — when set, shows AsyncJobPanel instead of form ──
  const [asyncJob, setAsyncJob] = useState<PendingAsyncJob | null>(null);

  // ── On mount: check sessionStorage for a pending async job ──
  useEffect(() => {
    if (!cancerSlug) return;
    const pending = loadPendingJob(cancerSlug);
    if (pending) {
      setMode("async");
      setAsyncJob({ file: null, resumeJobId: pending.jobId });
    }
  }, [cancerSlug]);

  // ── File helpers ──
  const handleFile = (f: File | null) => { setFile(f); setError(""); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.name.endsWith(".csv")) handleFile(f);
    else setError("Only .csv files are supported.");
  };

  // ── Standard mode submit ──
  const handleSubmit = async () => {
    setError(""); setRawResponse("");
    if (!file)                        { setError("Please upload a .csv file."); return; }
    if (!cancerSlug || !datasetLabel) { setError("Missing cancer or dataset info. Please go back."); return; }
    if (file.type !== "text/csv" && !file.name.endsWith(".csv"))
                                      { setError("Invalid file type. Please upload a .csv file."); return; }

    if (mode === "async") {
      setAsyncJob({ file });
      return;
    }

    setLoading(true); setProgress(0); setElapsed(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Date.now() - start;
      setElapsed(t);
      setProgress(Math.min(95, (t / 12000) * 100));
    }, 500);

    try {
      const result = await submitDiagnosis({ cancerSlug, datasetLabel, file });
      clearInterval(timer); setProgress(100); setLoading(false);

      if (result.success) {
        navigate("/result-diagnosis", {
          state: { predictionResult: result.data, cancerName, datasetLabel },
        });
      } else {
        setError(result.error);
        if (result.rawResponse) setRawResponse(result.rawResponse);
      }
    } catch (err: any) {
      clearInterval(timer); setLoading(false);
      setError(err.message || "Failed to submit prediction.");
    }
  };

  // ── AsyncJobPanel callbacks ──
  const handleAsyncCompleted = (
    result: PredictionResult,
    _meta: { totalTimeMs?: number; isCacheHit: boolean }
  ) => {
    // Use replace:true so the upload page is removed from the history stack.
    // Without this, pressing Back from /result-diagnosis would return to the
    // upload page, which would find the (stale) sessionStorage job and
    // immediately bounce back to /result-diagnosis — creating a back-loop.
    // With replace:true, Back from results goes directly to /diagnosis.
    navigate("/result-diagnosis", {
      state: { predictionResult: result, cancerName, datasetLabel },
      replace: true,
    });
  };

  const handleAsyncCancel = () => setAsyncJob(null);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Standard mode loading bar ── */}
      {loading && (
        <div className="fixed top-0 left-0 w-full z-50 bg-[#1E3A5F] text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-2 text-sm">
            <span className="font-medium animate-pulse-status">Processing dataset…</span>
            <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">
              {Math.floor(elapsed / 1000)}s
            </span>
          </div>
          <div className="max-w-7xl mx-auto h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} />
            <Link to="/diagnosis" className="hover:text-slate-700">Diagnosis</Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">Upload Dataset</span>
          </nav>
        </div>
      </div>

      {/* items-start prevents card from being pushed out of view when keyboard is open */}
      <main className="flex-1 flex items-start justify-center px-4 py-5 sm:py-10">
        <div className="w-full max-w-2xl animate-fadeIn">
          {/* p-5 sm:p-8 — tighter padding on mobile */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center
                justify-center shrink-0">
                <Microscope size={20} className="text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-[#1E3A5F]">Upload Dataset</h1>
                <p className="text-xs text-slate-500">Diagnosis — Step 2 of 3</p>
              </div>
            </div>

            {/* ── Step indicator ── */}
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              {["Parameters", "Upload", "Results"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center
                      text-xs font-bold shrink-0
                      ${i < 1
                        ? "bg-green-500 text-white"
                        : i === 1
                          ? "bg-[#1E3A5F] text-white"
                          : "bg-slate-100 text-slate-400"}`}>
                      {i < 1 ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    {/* Hidden on very small screens to prevent overflow */}
                    <span className={`text-xs hidden sm:block
                      ${i === 1
                        ? "text-[#1E3A5F] font-medium"
                        : i < 1 ? "text-green-600"
                        : "text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Session info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6
              p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
              {[
                { label: "Cancer Type", value: cancerName   || "—" },
                { label: "AI Feature",  value: "Diagnosis"          },
                { label: "Dataset Key", value: datasetLabel || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex sm:block items-center gap-2 sm:gap-0">
                  <p className="text-xs text-slate-400 font-medium mb-0 sm:mb-0.5 shrink-0 w-24 sm:w-auto">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* ════════════════════════════════════════════════════
                Async Job Panel — menggantikan form saat mode async aktif
            ════════════════════════════════════════════════════ */}
            {asyncJob ? (
              <AsyncJobPanel
                cancerSlug={cancerSlug!}
                datasetLabel={datasetLabel}
                cancerName={cancerName || cancerSlug || ""}
                file={asyncJob.file}
                resumeJobId={asyncJob.resumeJobId}
                onCompleted={handleAsyncCompleted}
                onCancel={handleAsyncCancel}
              />
            ) : (
              <>
                {/* ════════════════════════════════════════════════
                    Processing Mode Toggle
                ════════════════════════════════════════════════ */}
                <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-xl
                  border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase
                    tracking-wider mb-3">
                    Processing Mode
                  </p>
                  <div className="grid grid-cols-2 gap-2">

                    {/* Standard */}
                    <button
                      onClick={() => setMode("standard")}
                      className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3
                        rounded-xl border-2 text-left transition-all duration-150
                        ${mode === "standard"
                          ? "border-[#1E3A5F] bg-[#1E3A5F]/5"
                          : "border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50"}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center
                        justify-center shrink-0 transition-colors
                        ${mode === "standard" ? "border-[#1E3A5F]" : "border-slate-300"}`}>
                        {mode === "standard" && (
                          <div className="w-2 h-2 rounded-full bg-[#1E3A5F]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                          <Activity
                            size={12}
                            className={mode === "standard" ? "text-[#1E3A5F]" : "text-slate-400"}
                          />
                          <span className={`text-xs sm:text-sm font-semibold
                            ${mode === "standard" ? "text-[#1E3A5F]" : "text-slate-600"}`}>
                            Standard
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                          Wait for instant result
                        </p>
                      </div>
                    </button>

                    {/* Async */}
                    <button
                      onClick={() => setMode("async")}
                      className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3
                        rounded-xl border-2 text-left transition-all duration-150
                        ${mode === "async"
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300 active:bg-slate-50"}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center
                        justify-center shrink-0 transition-colors
                        ${mode === "async" ? "border-cyan-500" : "border-slate-300"}`}>
                        {mode === "async" && (
                          <div className="w-2 h-2 rounded-full bg-cyan-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 flex-wrap">
                          <Zap
                            size={12}
                            className={mode === "async" ? "text-cyan-600" : "text-slate-400"}
                          />
                          <span className={`text-xs sm:text-sm font-semibold
                            ${mode === "async" ? "text-cyan-700" : "text-slate-600"}`}>
                            Async
                          </span>
                          <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5
                            rounded-full bg-cyan-100 text-cyan-600 font-semibold
                            border border-cyan-200">
                            BETA
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                          Queue in background
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Async info banner */}
                  {mode === "async" && (
                    <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-cyan-50
                      border border-cyan-200 rounded-lg text-xs text-cyan-700 animate-fadeIn">
                      <Zap size={12} className="shrink-0 mt-0.5" />
                      <span>
                        Job is queued server-side using Redis. You'll see a live tracker
                        below — the page won't freeze. Results are cached for 7 days.
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Drop zone ── */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Upload File <span className="text-slate-400 font-normal">(.csv)</span>
                  </label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl
                      p-5 sm:p-8 text-center transition-all duration-200
                      ${dragging
                        ? "border-cyan-400 bg-cyan-50"
                        : file
                          ? "border-green-400 bg-green-50"
                          : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"}`}
                  >
                    <input
                      type="file" accept=".csv" id="fileUpload" className="hidden"
                      onChange={e => handleFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-3">
                        {file
                          ? <CheckCircle2 size={36} className="text-green-500" />
                          : <Upload size={36} className="text-slate-400" />
                        }
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {file
                              ? "File ready — tap to change"
                              /* Drag & drop is desktop-only; show tap hint on mobile */
                              : <span>
                                  <span className="sm:hidden">Tap to browse</span>
                                  <span className="hidden sm:inline">Click to browse or drag & drop</span>
                                </span>
                            }
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Only .csv files · Max 50MB
                          </p>
                        </div>
                      </div>
                    </label>

                    {file && (
                      <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-lg
                        border border-green-200 shadow-sm">
                        <FileText size={18} className="text-green-600 shrink-0" />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={e => { e.preventDefault(); handleFile(null); }}
                          className="p-2 rounded-lg bg-red-100 hover:bg-red-200
                            active:bg-red-300 text-red-600 transition-colors shrink-0"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Error ── */}
                {error && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border
                    border-red-200 rounded-lg text-sm text-red-700">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── Raw response ── */}
                {rawResponse && (
                  <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-2">
                      Raw Server Response
                    </p>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all
                      overflow-x-auto">
                      {rawResponse}
                    </pre>
                  </div>
                )}

                {/* ── Actions ── */}
                <div className="flex gap-3 mt-5 sm:mt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 min-h-[44px] rounded-lg
                      border border-slate-300 text-slate-700 text-sm font-medium
                      hover:bg-slate-50 active:bg-slate-100 transition-colors shrink-0"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 min-h-[44px]
                      py-2.5 px-4 rounded-lg text-white text-sm font-semibold transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${mode === "async"
                        ? "bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800"
                        : "bg-[#1E3A5F] hover:bg-[#1A3352] active:bg-[#162D49]"}`}
                  >
                    {loading ? "Processing…" : (
                      <>
                        {mode === "async" ? <Zap size={16} /> : <Upload size={16} />}
                        {mode === "async" ? "Queue Analysis" : "Run Analysis"}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadDiagnosis;
