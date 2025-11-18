import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type PredictionResult = {
  prediction: number; 
  probability?: number;
  top_features?: Array<{ name: string; importance: number }>;
};

const ResultDiagnosis: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    predictionResult,
    cancerName,
    datasetLabel,
  } = (location.state as {
    predictionResult?: PredictionResult;
    cancerName?: string;
    datasetLabel?: string;
  }) || {};

  if (!predictionResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f4ff] px-4">
        <p className="text-red-600 text-lg font-semibold">
          No prediction data found. Please upload a dataset first.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
        >
          Back
        </button>
      </div>
    );
  }

  const isAdvanced = predictionResult.prediction === 1;
  const stageLabel = isAdvanced
    ? 'Advanced stage (likely stage III–IV patterns)'
    : 'Early stage (likely stage I–II patterns)';

  const confidence =
    typeof predictionResult.probability === 'number'
      ? `${(predictionResult.probability * 100).toFixed(2)}%`
      : 'N/A';

  const summary = isAdvanced
    ? `AI suggests patterns consistent with *advanced* **${cancerName || 'cancer'}**: dataset features indicate increased tumor burden, potential *lymph node involvement*, and more complex molecular signatures.`
    : `AI indicates a pattern consistent with *early-stage* **${cancerName || 'cancer'}**, showing predominantly localized abnormalities with lower high-risk biomarker activity.`;

  const interpretation = isAdvanced
    ? `• Higher likelihood of *lymphatic spread* or *distant metastatic signals*.\n• Molecular profile suggests reduced suitability for local-only therapy.\n• Clinical implication: comprehensive staging and multidisciplinary evaluation recommended.`
    : `• Pattern aligns with lower tumor burden and localized disease.\n• Biomarker profile may support organ-preserving strategies.\n• Clinical implication: high chance of curative management if confirmed early.`;

  const recommendedAction = isAdvanced
    ? `Immediate oncologic evaluation: advanced imaging (CT / PET-CT), biopsy, pathology review, and tumor board assessment. AI confidence: **${confidence}**, but must be clinically validated.`
    : `Confirmatory diagnostics recommended: imaging, biopsy, and molecular testing if needed. Early-stage cases often qualify for curative interventions.`;

  // PDF Export
 const handleExportPDF = async () => {
  const input = document.getElementById("diagnosis-report");
  if (!input) return;

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#f4f7ff", // fallback solid color
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
    pdf.save(`${cancerName || "diagnosis"}-report.pdf`);
  } catch (err) {
    console.error("PDF Export Error:", err);
  }
};
  const renderTopFeatures = () => {
    if (!predictionResult.top_features?.length) return null;

    return (
      <div className="mt-4">
        <h5 className="font-semibold mb-2 text-[#162457]">Top Contributing Features</h5>
        <ul className="list-disc list-inside text-sm space-y-1">
          {predictionResult.top_features.map((f, i) => (
            <li key={i} className="text-gray-700">
              <span className="font-medium">{f.name}</span> — importance: {f.importance.toFixed(3)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      id="diagnosis-report"
      className="flex flex-col min-h-screen bg-gradient-to-br from-[#f4f7ff] via-[#eef2ff] to-[#fafbff]"
    >
      <main className="flex-1 container mx-auto px-5 py-10">
        
        {/* MAIN CONTAINER */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-[#dfe3fa] p-10 max-w-6xl mx-auto">

          <h1 className="text-3xl font-bold text-center text-[#162457] tracking-wide mb-2">
            AI-Assisted Diagnostic Report
          </h1>
          <p className="text-center text-gray-600 mb-8 text-sm">
            Powered by medical-grade machine learning analysis
          </p>

          {/* INFO BOX */}
          <div className="mb-8 p-5 rounded-xl bg-[#eef4ff] border border-[#d3dcff] shadow-sm">
            <p className="text-[#162457]"><strong>Cancer Type:</strong> {cancerName}</p>
            <p className="text-[#162457]"><strong>Dataset:</strong> {datasetLabel}</p>
            <p className="text-[#162457]">
              <strong>Predicted Stage:</strong>{' '}
              <span className={isAdvanced ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                {stageLabel}
              </span>
            </p>
            <p className="text-[#162457]"><strong>Model Confidence:</strong> {confidence}</p>
          </div>

          {/* GRID SECTION */}
          <section className="grid md:grid-cols-2 gap-8">

            {/* SUMMARY */}
            <article className="p-6 bg-white border border-[#e7e9fa] rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-[#162457] mb-3">Comprehensive Summary</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {summary}
              </p>

              <div className="mt-5">
                <h4 className="font-semibold text-[#162457] mb-1">Detailed Interpretation</h4>
                <pre className="text-sm whitespace-pre-line bg-[#f6f7ff] p-3 rounded-lg text-gray-700 border border-[#e1e3fc]">
                  {interpretation}
                </pre>
              </div>

              {renderTopFeatures()}
            </article>

            {/* CLINICAL PATHWAY */}
            <article className="p-6 bg-white border border-[#e7e9fa] rounded-2xl shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-[#162457] mb-3">Recommended Clinical Pathway</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                <li><strong>Biopsy Confirmation:</strong> pathology grading & verification.</li>
                <li><strong>Staging Imaging:</strong> CT / MRI / PET-CT for T/N/M mapping.</li>
                <li><strong>Molecular Testing:</strong> *NGS*, PCR, or targeted biomarker assays.</li>
                <li><strong>Tumor Board Review:</strong> multidisciplinary planning.</li>
                <li><strong>Supportive Assessment:</strong> organ function, psychosocial support.</li>
              </ol>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Note:</strong> AI supports clinical decision-making but does not replace physician judgment.
              </p>
            </article>
          </section>

          {/* CHECKLIST TABLE */}
          <section className="mt-10 p-6 bg-[#f8f9ff] border border-[#e2e4fb] rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-[#162457] mb-3">Diagnostic Checklist</h3>

            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm text-[#162457]">
                <thead className="bg-[#e8ecff]">
                  <tr>
                    <th className="p-2 border">Step</th>
                    <th className="p-2 border">Purpose</th>
                    <th className="p-2 border">Responsible</th>
                    <th className="p-2 border">Tests</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr>
                    <td className="p-2 border">Clinical Evaluation</td>
                    <td className="p-2 border">Initial assessment</td>
                    <td className="p-2 border">Oncologist</td>
                    <td className="p-2 border">Physical exam</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Tissue Diagnosis</td>
                    <td className="p-2 border">Confirm malignancy</td>
                    <td className="p-2 border">Pathologist</td>
                    <td className="p-2 border">Biopsy, IHC</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Staging Imaging</td>
                    <td className="p-2 border">Assess spread</td>
                    <td className="p-2 border">Radiologist</td>
                    <td className="p-2 border">CT, MRI, PET-CT</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Molecular Profiling</td>
                    <td className="p-2 border">Therapy guidance</td>
                    <td className="p-2 border">Molecular Lab</td>
                    <td className="p-2 border">NGS, PCR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTION BOX */}
          <div className="mt-8 p-6 bg-[#fff4f4] border border-[#ffdada] rounded-2xl shadow-sm">
            <h3 className="font-semibold text-[#b20000] mb-2">Most Recommended Action</h3>
            <p className="text-sm text-gray-700">{recommendedAction}</p>
            <p className="text-xs text-gray-500 mt-3">
              <strong>Reminder:</strong> Only licensed clinicians may confirm a cancer diagnosis.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
            >
              Back
            </button>
            <button
              onClick={handleExportPDF}
              className="px-5 py-2 bg-[#2b4eff] text-white rounded-lg hover:bg-[#1f38c7] transition shadow-md"
            >
              Export to PDF
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResultDiagnosis;
