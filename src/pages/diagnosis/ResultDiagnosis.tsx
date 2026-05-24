import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight, Home, Microscope, AlertTriangle, CheckCircle,
  Download, ArrowLeft, ChevronDown, ShieldCheck, Info, Loader2,
} from "lucide-react";
import Footer from "../../components/layout/Footer";
import jsPDF from "jspdf";

type PredictionResult = {
  prediction: number;
  probability?: number;
  top_features?: Array<{ name: string; importance: number }>;
};

/* ── helpers ──────────────────────────────────────────────── */
const DISCLAIMER =
  "The Analysis Summary, Clinical Recommendations, and Diagnostic Checklist shown below are " +
  "preliminary placeholder content generated for UI demonstration purposes only. " +
  "They do NOT reflect a validated clinical AI output. " +
  "Only the Predicted Stage, Model Confidence, and Cancer Type above are derived directly from the AI model.";

/* ── ASCII-safe text helper ───────────────────────────────── */
// jsPDF Helvetica only covers Latin-1. Strip every non-Latin-1 char
// (em-dash, en-dash, smart quotes, emoji, etc.) before passing to doc.text().
function safe(str: string): string {
  return str
    .replace(/–|—/g, "-")   // en-dash / em-dash  ->  hyphen
    .replace(/[‘’]/g, "'")  // smart single quotes -> apostrophe
    .replace(/[“”]/g, '"')  // smart double quotes -> straight quote
    .replace(/[^\x00-\xFF]/g, "");    // drop anything outside Latin-1
}

/* ── PDF generator (text-based, no screenshot) ───────────── */
function buildPDF(params: {
  cancerName: string;
  datasetLabel: string;
  stageLabel: string;
  confidence: string;
  isAdvanced: boolean;
  topFeatures: Array<{ name: string; importance: number }>;
}) {
  const { cancerName, datasetLabel, stageLabel, confidence, isAdvanced, topFeatures } = params;
  const doc = new jsPDF("p", "mm", "a4");
  const W   = doc.internal.pageSize.getWidth();   // 210 mm
  const DATE = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  // ── Navy header bar ──────────────────────────────────────
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AIRA - AI Diagnostic Report", 14, 12);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${DATE}`, 14, 20);
  doc.text(safe(`${cancerName}  |  ${datasetLabel}`), 14, 25);

  // ── Disclaimer banner ────────────────────────────────────
  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(217, 119, 6);
  doc.roundedRect(10, 33, W - 20, 22, 2, 2, "FD");
  doc.setTextColor(120, 60, 0);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("[!] PRELIMINARY DATA NOTICE", 14, 41);
  doc.setFont("helvetica", "normal");
  const disclaimerLines = doc.splitTextToSize(
    "Sections labelled [SIMULATED] contain placeholder content for demonstration only. " +
    "Only Predicted Stage, Confidence, and Cancer Type are live AI outputs.",
    W - 28
  );
  doc.text(disclaimerLines, 14, 47);

  // ── Verified AI Output section ───────────────────────────
  let y = 62;
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(10, y, W - 20, 32, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 95);
  doc.text("[VERIFIED] AI MODEL OUTPUT", 14, y + 7);

  // col 1 — stage
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Predicted Stage", 14, y + 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isAdvanced ? 185 : 22, isAdvanced ? 28 : 163, isAdvanced ? 28 : 74);
  doc.text(safe(stageLabel), 14, y + 23);

  // col 2 — confidence
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Model Confidence", 82, y + 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${confidence}%`, 82, y + 23);

  // col 3 — cancer type
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Cancer Type", 148, y + 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(safe(cancerName || "-"), 148, y + 23);

  y += 40;

  // ── Top biomarkers (if present) ──────────────────────────
  if (topFeatures.length > 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 95);
    doc.text("Top Contributing Biomarkers", 14, y);
    y += 7;
    topFeatures.slice(0, 5).forEach((f) => {
      const pct = Math.min(f.importance * 100, 100);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(safe(f.name), 14, y);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`${pct.toFixed(1)}%`, W - 14, y, { align: "right" });
      // bar track
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(14, y + 1.5, W - 28, 2.5, 1, 1, "F");
      // bar fill
      doc.setFillColor(30, 58, 95);
      doc.roundedRect(14, y + 1.5, ((W - 28) * pct) / 100, 2.5, 1, 1, "F");
      y += 10;
    });
    y += 4;
  }

  // ── Placeholder sections ─────────────────────────────────
  const placeholderSections = [
    {
      title: "Analysis Summary  [SIMULATED]",
      body: isAdvanced
        ? `AI analysis detected patterns consistent with advanced-stage ${cancerName || "cancer"}, including elevated biomarker activity and potential multi-site involvement. This text is a placeholder and does not represent a validated clinical finding.`
        : `AI analysis indicates patterns consistent with early-stage ${cancerName || "cancer"}, characterised by localised findings and lower high-risk biomarker expression. This text is a placeholder and does not represent a validated clinical finding.`,
    },
    {
      title: "Recommended Clinical Actions  [SIMULATED]",
      body: isAdvanced
        ? "1. Advanced staging imaging (PET-CT / CT)\n2. Tumor board multidisciplinary review\n3. Biopsy and molecular profiling\n4. Systemic therapy evaluation"
        : "1. Confirmatory biopsy and pathology review\n2. Standard staging imaging\n3. Molecular biomarker testing\n4. Early intervention planning",
    },
  ];

  placeholderSections.forEach(({ title, body }) => {
    if (y > 245) { doc.addPage(); y = 20; }
    // divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, W - 14, y);
    y += 7;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(safe(title), 14, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const lines = doc.splitTextToSize(safe(body), W - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 8;
  });

  // ── Footer bar ───────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 284, W, 13, "F");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.text("AIRA - AI Research & Analysis Platform | Universitas Multimedia Nusantara", 14, 291);
    doc.text("AI results must be validated by a licensed clinician.", W - 14, 291, { align: "right" });
  }

  return doc;
}

/* ── Component ────────────────────────────────────────────── */
const ResultDiagnosis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [exporting,  setExporting]  = useState(false);

  const { predictionResult, cancerName, datasetLabel } =
    (location.state as { predictionResult?: PredictionResult; cancerName?: string; datasetLabel?: string }) || {};

  if (!predictionResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-sm w-full">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">No Data Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            No prediction data available. Please upload a dataset first.
          </p>
          <button onClick={() => navigate(-1)}
            className="w-full py-2.5 rounded-lg bg-[#1E3A5F] text-white text-sm font-semibold
              hover:bg-[#1A3352] transition-colors">
            Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const isAdvanced  = predictionResult.prediction === 1;
  const confidence  = typeof predictionResult.probability === "number"
    ? (predictionResult.probability * 100).toFixed(1) : "N/A";
  const stageLabel  = isAdvanced ? "Advanced Stage (III–IV)" : "Early Stage (I–II)";
  const stageColor  = isAdvanced ? "text-red-600" : "text-green-600";
  const stageBg     = isAdvanced ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
  const stageBadge  = isAdvanced ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200";

  const summary = isAdvanced
    ? `AI analysis detected patterns consistent with advanced-stage ${cancerName || "cancer"}, including elevated biomarker activity and potential multi-site involvement.`
    : `AI analysis indicates patterns consistent with early-stage ${cancerName || "cancer"}, characterised by localised findings and lower high-risk biomarker expression.`;

  const clinicalActions = isAdvanced
    ? ["Advanced staging imaging (PET-CT / CT)", "Tumor board multidisciplinary review", "Biopsy and molecular profiling", "Systemic therapy evaluation"]
    : ["Confirmatory biopsy and pathology review", "Standard staging imaging", "Molecular biomarker testing", "Early intervention planning"];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = buildPDF({
        cancerName:   cancerName  || "Unknown",
        datasetLabel: datasetLabel || "Unknown",
        stageLabel,
        confidence,
        isAdvanced,
        topFeatures:  predictionResult.top_features || [],
      });
      doc.save(`AIRA-${(cancerName || "diagnosis").replace(/\s+/g, "-")}-report.pdf`);
    } finally {
      setExporting(false);
    }
  };

  /* ── Placeholder section badge ──────────────────────────── */
  const PlaceholderBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
      bg-amber-100 text-amber-700 text-[10px] font-semibold border border-amber-200">
      <Info size={9} /> Simulated Data
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12} /> Home</Link>
            <ChevronRight size={12} />
            <Link to="/diagnosis" className="hover:text-slate-700">Diagnosis</Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">Results</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-5 animate-fadeIn">

          {/* ── Global disclaimer banner ──────────────────── */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl
            bg-amber-50 border border-amber-200 text-amber-800">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs leading-relaxed">
              <strong className="font-semibold">Preliminary Data Notice — </strong>
              {DISCLAIMER}
            </p>
          </div>

          {/* ── Header card ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Microscope size={20} className="text-[#1E3A5F]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1E3A5F]">AI Diagnostic Report</h1>
                  <p className="text-xs text-slate-500">
                    {cancerName} · {datasetLabel} · {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${stageBadge}`}>
                {isAdvanced ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                {stageLabel}
              </span>
            </div>
          </div>

          {/* ── Key metrics — VERIFIED AI OUTPUT ──────────── */}
          <div className={`rounded-2xl border p-6 ${stageBg}`}>
            {/* Verified badge */}
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={14} className="text-[#1E3A5F]" />
              <span className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider">
                Verified AI Model Output
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Predicted Stage</p>
                <p className={`text-2xl font-bold ${stageColor}`}>{stageLabel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Model Confidence</p>
                <p className="text-2xl font-bold text-slate-900">{confidence}%</p>
                <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isAdvanced ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Cancer Type</p>
                <p className="text-lg font-bold text-slate-900">{cancerName || "—"}</p>
                <p className="text-xs text-slate-500">{datasetLabel}</p>
              </div>
            </div>
          </div>

          {/* ── Main grid — SIMULATED sections ────────────── */}
          <div className="grid lg:grid-cols-2 gap-5">

            {/* Analysis Summary */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Analysis Summary
                </h2>
                <PlaceholderBadge />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 leading-relaxed">
                <strong>Note:</strong> The text below is a static placeholder. It does not represent
                live clinical AI output.
              </div>

              <p className="text-sm text-slate-500 leading-relaxed italic">{summary}</p>

              {/* Interpretation accordion */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === "interp" ? null : "interp")}
                  className="w-full flex items-center justify-between p-4 text-sm font-semibold
                    text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Detailed Interpretation
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded === "interp" ? "rotate-180" : ""}`} />
                </button>
                {expanded === "interp" && (
                  <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-100 italic">
                    {isAdvanced
                      ? "Biomarker profile suggests reduced suitability for local-only therapy. Molecular signatures indicate elevated tumour burden. Multidisciplinary evaluation recommended."
                      : "Biomarker profile may support organ-preserving strategies. Localised disease pattern with lower high-risk activity. High probability of curative intervention if confirmed."}
                  </div>
                )}
              </div>

              {/* Top features */}
              {predictionResult.top_features && predictionResult.top_features.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Top Contributing Biomarkers
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                      <ShieldCheck size={9} /> From Model
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {predictionResult.top_features.slice(0, 5).map((f, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700">{f.name}</span>
                          <span className="text-slate-400">{(f.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1E3A5F] rounded-full"
                            style={{ width: `${Math.min(f.importance * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Actions */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recommended Clinical Actions
                </h2>
                <PlaceholderBadge />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 leading-relaxed">
                <strong>Note:</strong> These recommendations are static placeholders, not validated AI
                clinical guidance.
              </div>

              <ol className="space-y-3">
                {clinicalActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-600 text-xs font-bold
                      flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-500 italic">{action}</span>
                  </li>
                ))}
              </ol>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <strong>Clinical Note:</strong> AI findings support clinical decision-making but do not
                replace physician judgment or pathological confirmation.
              </div>
            </div>
          </div>

          {/* ── Checklist table — SIMULATED ───────────────── */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Diagnostic Checklist
              </h2>
              <PlaceholderBadge />
            </div>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <strong>Note:</strong> This checklist is a generic static template and does not reflect AI-generated
              recommendations for this specific case.
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {["Step", "Purpose", "Responsible", "Method"].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Clinical Evaluation", "Initial assessment",  "Oncologist",    "Physical exam"],
                    ["Tissue Diagnosis",    "Confirm malignancy",  "Pathologist",   "Biopsy, IHC"],
                    ["Staging Imaging",     "Assess spread",       "Radiologist",   "CT, MRI, PET-CT"],
                    ["Molecular Profiling", "Therapy guidance",    "Molecular Lab", "NGS, PCR"],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className={`py-3 px-3 text-slate-500 italic ${j === 0 ? "font-medium" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Action buttons ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300
                text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3A5F]
                text-white text-sm font-semibold hover:bg-[#1A3352] transition-colors ml-auto
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exporting
                ? <><Loader2 size={16} className="animate-spin" /> Generating PDF…</>
                : <><Download size={16} /> Export PDF Report</>}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResultDiagnosis;
