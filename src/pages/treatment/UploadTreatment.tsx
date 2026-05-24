import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, FileText, CheckCircle2, ArrowLeft, Trash2, ChevronRight, Home, TrendingUp, AlertCircle } from "lucide-react";
import Footer from "../../components/layout/Footer";

const UploadTreatment: React.FC = () => {
  const navigate = useNavigate();
  const baseUrl  = import.meta.env.VITE_AI_BACKEND_URL;
  const [geneFile,  setGeneFile]  = useState<File | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [dragging,  setDragging]  = useState(false);

  const handleSubmit = async () => {
    if (!geneFile) { setError("Please upload a Gene Expression / Clinical File."); return; }
    setError(""); setLoading(true);
    const fd = new FormData();
    fd.append("gene_file", geneFile);
    try {
      const res    = await fetch(`${baseUrl}/predict/treatment`, { method: "POST", body: fd });
      const result = await res.json();
      navigate("/result/treatment", { state: { predictionResult: result } });
    } catch {
      setError("Failed to submit. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12}/> Home</Link>
            <ChevronRight size={12}/>
            <Link to="/treatment" className="hover:text-slate-700">Treatment</Link>
            <ChevronRight size={12}/>
            <span className="text-slate-800 font-medium">Upload</span>
          </nav>
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Pill size={20} className="text-violet-600"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E3A5F]">Upload Dataset</h1>
                <p className="text-xs text-slate-500">Treatment — Step 2 of 3</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-8">
              {["Parameters", "Upload", "Results"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 1 ? "bg-green-500 text-white" : i === 1 ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-400"}`}>
                      {i < 1 ? <CheckCircle2 size={14}/> : i + 1}
                    </div>
                    <span className={`text-xs ${i === 1 ? "text-[#1E3A5F] font-medium" : i < 1 ? "text-green-600" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200"/>}
                </React.Fragment>
              ))}
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Gene Expression / Clinical File
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setGeneFile(f); }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                ${dragging ? "border-cyan-400 bg-cyan-50" : geneFile ? "border-green-400 bg-green-50" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"}`}>
              <input type="file" id="geneFile" className="hidden" onChange={e => { setGeneFile(e.target.files?.[0] || null); setError(""); }}/>
              <label htmlFor="geneFile" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-3">
                  {geneFile ? <CheckCircle2 size={36} className="text-green-500"/> : <Upload size={36} className="text-slate-400"/>}
                  <p className="text-sm font-medium text-slate-700">{geneFile ? "File ready — click to change" : "Click to browse or drag & drop"}</p>
                  <p className="text-xs text-slate-400">Gene Expression / Clinical File</p>
                </div>
              </label>
              {geneFile && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <FileText size={16} className="text-green-600 shrink-0"/>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{geneFile.name}</p>
                    <p className="text-xs text-slate-400">{(geneFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={e => { e.preventDefault(); setGeneFile(null); }}
                    className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              )}
            </div>
            {error && <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"><AlertCircle size={15} className="shrink-0 mt-0.5"/>{error}</div>}
            <div className="flex gap-3 mt-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                <ArrowLeft size={16}/> Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#1A3352] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? "Processing..." : <><Upload size={16}/> Run Analysis</>}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};
export default UploadTreatment;
