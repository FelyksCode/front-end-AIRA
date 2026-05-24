import React, { useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Upload, FileText, CheckCircle2, ArrowLeft, Trash2, ChevronRight, Home, Microscope, AlertCircle } from "lucide-react";
import Footer from "../../components/layout/Footer";

const UploadDiagnosis: React.FC = () => {
  const { cancerSlug } = useParams();
  const location       = useLocation();
  const navigate       = useNavigate();
  const baseUrl        = import.meta.env.VITE_AI_BACKEND_URL;
  const { cancerName, datasetLabel } = location.state || {};

  const [file,         setFile]         = useState<File | null>(null);
  const [error,        setError]        = useState("");
  const [rawResponse,  setRawResponse]  = useState("");
  const [loading,      setLoading]      = useState(false);
  const [dragging,     setDragging]     = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [elapsed,      setElapsed]      = useState(0);

  const handleFile = (f: File | null) => { setFile(f); setError(""); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.name.endsWith(".csv")) handleFile(f);
    else setError("Only .csv files are supported.");
  };

  const handleSubmit = async () => {
    setError(""); setRawResponse("");
    if (!file)            { setError("Please upload a .csv file."); return; }
    if (!cancerSlug || !datasetLabel) { setError("Missing cancer or dataset info. Please go back."); return; }
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) { setError("Invalid file type. Please upload a .csv file."); return; }

    setLoading(true); setProgress(0); setElapsed(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const t = Date.now() - start;
      setElapsed(t);
      setProgress(Math.min(95, (t / 12000) * 100));
    }, 500);

    try {
      const fd = new FormData();
      fd.append("ai_feature",   "diagnosis");
      fd.append("feature_key",  datasetLabel);
      fd.append("file",         file);

      const res  = await fetch(`${baseUrl}/cancers/${cancerSlug}/predict`, { method: "POST", body: fd });
      const text = await res.text();
      clearInterval(timer); setProgress(100); setLoading(false);

      if (!res.ok) { setError(text.includes("Invalid CSV") ? "Invalid CSV format. Please check your file headers." : text || "Server error."); setRawResponse(text); return; }

      try {
        const result = JSON.parse(text);
        navigate("/result-diagnosis", { state: { predictionResult: result, cancerName, datasetLabel } });
      } catch {
        setError("Server returned invalid JSON. Raw response shown below.");
        setRawResponse(text);
      }
    } catch (err: any) {
      clearInterval(timer); setLoading(false);
      setError(err.message || "Failed to submit prediction.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Loading bar */}
      {loading && (
        <div className="fixed top-0 left-0 w-full z-50 bg-[#1E3A5F] text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-2 text-sm">
            <span className="font-medium animate-pulse-status">Processing dataset...</span>
            <span className="font-mono text-xs bg-white/20 px-2 py-0.5 rounded">
              {Math.floor(elapsed / 1000)}s
            </span>
          </div>
          <div className="max-w-7xl mx-auto h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12} /> Home</Link>
            <ChevronRight size={12} />
            <Link to="/diagnosis" className="hover:text-slate-700">Diagnosis</Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">Upload Dataset</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Microscope size={20} className="text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E3A5F]">Upload Dataset</h1>
                <p className="text-xs text-slate-500">Diagnosis — Step 2 of 3</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {["Parameters", "Upload", "Results"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${i < 1 ? "bg-green-500 text-white" : i === 1 ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-400"}`}>
                      {i < 1 ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={`text-xs ${i === 1 ? "text-[#1E3A5F] font-medium" : i < 1 ? "text-green-600" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* Session info */}
            <div className="grid sm:grid-cols-3 gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {[
                { label: "Cancer Type",  value: cancerName   || "—" },
                { label: "AI Feature",   value: "Diagnosis"          },
                { label: "Dataset Key",  value: datasetLabel || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* Drop zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Upload File <span className="text-slate-400 font-normal">(.csv)</span>
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                  ${dragging ? "border-cyan-400 bg-cyan-50"
                    : file    ? "border-green-400 bg-green-50"
                              : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"}`}
              >
                <input type="file" accept=".csv" id="fileUpload" className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] || null)} />
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    {file
                      ? <CheckCircle2 size={40} className="text-green-500" />
                      : <Upload size={40} className="text-slate-400" />
                    }
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {file ? "File ready — click to change" : "Click to browse or drag & drop"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Only .csv files · Max 50MB
                      </p>
                    </div>
                  </div>
                </label>

                {file && (
                  <div className="mt-5 flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 shadow-sm">
                    <FileText size={18} className="text-green-600 shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={e => { e.preventDefault(); handleFile(null); }}
                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                      title="Remove file">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
              </div>
            )}

            {/* Raw response */}
            {rawResponse && (
              <div className="mt-4 p-4 bg-slate-100 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Raw Server Response</p>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all">{rawResponse}</pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300
                  text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                  bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#1A3352]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? "Processing..." : <><Upload size={16} /> Run Analysis</>}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadDiagnosis;
