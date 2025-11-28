import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const {
    predictionResult,
    cancerName,
    datasetLabel,
  } = (location.state as {
    predictionResult?: PredictionResult;
    cancerName?: string;
    datasetLabel?: string;
  }) || {};

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!predictionResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="animate-fade-in bg-white backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-200">
          <p className="text-red-600 text-lg font-semibold mb-4">
            ⚠️ No prediction data found. Please upload a dataset first.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
          >
            ← Back to Upload
          </button>
        </div>
      </div>
    );
  }

  const isAdvanced = predictionResult.prediction === 1;
  const stageLabel = isAdvanced
    ? 'Advanced stage (likely stage III–IV patterns)'
    : 'Early stage (likely stage I–II patterns)';

  const confidenceValue =
    typeof predictionResult.probability === 'number'
      ? predictionResult.probability * 100
      : 0;

  const confidence = `${confidenceValue.toFixed(2)}%`;

  const summary = isAdvanced
    ? `AI suggests patterns consistent with advanced ${cancerName || 'cancer'}: dataset features indicate increased tumor burden, potential lymph node involvement, and more complex molecular signatures.`
    : `AI indicates a pattern consistent with early-stage ${cancerName || 'cancer'}, showing predominantly localized abnormalities with lower high-risk biomarker activity.`;

  const interpretation = isAdvanced
    ? `• Higher likelihood of lymphatic spread or distant metastatic signals.\n• Molecular profile suggests reduced suitability for local-only therapy.\n• Clinical implication: comprehensive staging and multidisciplinary evaluation recommended.`
    : `• Pattern aligns with lower tumor burden and localized disease.\n• Biomarker profile may support organ-preserving strategies.\n• Clinical implication: high chance of curative management if confirmed early.`;

  const recommendedAction = isAdvanced
    ? `Immediate oncologic evaluation: advanced imaging (CT / PET-CT), biopsy, pathology review, and tumor board assessment. AI confidence: ${confidence}, but must be clinically validated.`
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
        backgroundColor: "#f0f4ff",
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
      <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🔬</span>
          Top Contributing Features
        </h5>
        <div className="space-y-2">
          {predictionResult.top_features.map((f, i) => (
            <div
              key={i}
              className="bg-blue-50 rounded-lg p-3 border border-blue-200 hover:bg-blue-100 transition-all transform hover:scale-[1.02]"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">{f.name}</span>
                <span className="text-sm text-gray-600">
                  Importance: {f.importance.toFixed(3)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(f.importance * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      id="diagnosis-report"
      className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* MAIN CONTAINER */}
        <div
          className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-10 max-w-6xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4">
              <div className="text-6xl animate-bounce-slow">🏥</div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              AI-Assisted Diagnostic Report
            </h1>
            <p className="text-gray-600 text-sm sm:text-base flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Powered by medical-grade machine learning analysis
            </p>
          </div>

          {/* Status Card */}
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200 shadow-xl backdrop-blur-md animate-slide-up">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔬</span>
                  <div>
                    <p className="text-gray-600 text-sm">Cancer Type</p>
                    <p className="text-gray-900 font-bold text-lg">{cancerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="text-gray-600 text-sm">Dataset</p>
                    <p className="text-gray-900 font-semibold">{datasetLabel}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{isAdvanced ? '⚠️' : '✅'}</span>
                  <div>
                    <p className="text-gray-600 text-sm">Predicted Stage</p>
                    <p className={`font-bold text-lg ${isAdvanced ? 'text-red-600' : 'text-green-600'}`}>
                      {stageLabel}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-2">Model Confidence</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 animate-pulse-slow"
                          style={{ width: `${confidenceValue}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-bold text-lg">{confidence}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID SECTION */}
          <section className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* SUMMARY */}
            <article className="group p-6 bg-white border border-blue-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02] animate-slide-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📋</span>
                <h3 className="text-xl font-bold text-gray-900">Comprehensive Summary</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {summary}
              </p>

              <div className="mt-5">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'interpretation' ? null : 'interpretation')}
                  className="flex items-center justify-between w-full font-semibold text-blue-600 mb-2 hover:text-blue-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🔍</span>
                    Detailed Interpretation
                  </span>
                  <span className={`transform transition-transform ${expandedSection === 'interpretation' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${expandedSection === 'interpretation' ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <pre className="text-sm whitespace-pre-line bg-blue-50 p-4 rounded-lg text-gray-700 border border-blue-200">
                    {interpretation}
                  </pre>
                </div>
              </div>

              {renderTopFeatures()}
            </article>

            {/* CLINICAL PATHWAY */}
            <article className="group p-6 bg-white border border-blue-100 rounded-2xl shadow-lg hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:scale-[1.02] animate-slide-right">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🗺️</span>
                <h3 className="text-xl font-bold text-gray-900">Clinical Pathway</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { icon: '🔬', title: 'Biopsy Confirmation', desc: 'Pathology grading & verification' },
                  { icon: '📸', title: 'Staging Imaging', desc: 'CT / MRI / PET-CT for T/N/M mapping' },
                  { icon: '🧬', title: 'Molecular Testing', desc: 'NGS, PCR, or targeted biomarker assays' },
                  { icon: '👥', title: 'Tumor Board Review', desc: 'Multidisciplinary planning' },
                  { icon: '❤️', title: 'Supportive Assessment', desc: 'Organ function, psychosocial support' },
                ].map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all transform hover:translate-x-2"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <span className="text-2xl flex-shrink-0">{step.icon}</span>
                    <div>
                      <strong className="text-blue-700 block">{step.title}</strong>
                      <span className="text-sm text-gray-600">{step.desc}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-gray-600 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <strong className="text-yellow-700">⚠️ Note:</strong> AI supports clinical decision-making but does not replace physician judgment.
              </p>
            </article>
          </section>

          {/* CHECKLIST TABLE */}
          <section className="mb-8 p-6 bg-white border border-blue-100 rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✅</span>
              <h3 className="text-xl font-bold text-gray-900">Diagnostic Checklist</h3>
            </div>

            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="p-3 border border-blue-200 text-left text-blue-800 font-semibold">Step</th>
                    <th className="p-3 border border-blue-200 text-left text-blue-800 font-semibold">Purpose</th>
                    <th className="p-3 border border-blue-200 text-left text-blue-800 font-semibold">Responsible</th>
                    <th className="p-3 border border-blue-200 text-left text-blue-800 font-semibold">Tests</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {[
                    ['Clinical Evaluation', 'Initial assessment', 'Oncologist', 'Physical exam'],
                    ['Tissue Diagnosis', 'Confirm malignancy', 'Pathologist', 'Biopsy, IHC'],
                    ['Staging Imaging', 'Assess spread', 'Radiologist', 'CT, MRI, PET-CT'],
                    ['Molecular Profiling', 'Therapy guidance', 'Molecular Lab', 'NGS, PCR'],
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50 transition-colors">
                      <td className="p-3 border border-blue-200 text-gray-900 font-medium">{row[0]}</td>
                      <td className="p-3 border border-blue-200 text-gray-700">{row[1]}</td>
                      <td className="p-3 border border-blue-200 text-gray-700">{row[2]}</td>
                      <td className="p-3 border border-blue-200 text-gray-700">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ACTION BOX */}
          <div className="mb-8 p-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl shadow-lg animate-pulse-slow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎯</span>
              <h3 className="font-bold text-red-700 text-lg">Recommended Action</h3>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{recommendedAction}</p>
            <p className="text-xs text-gray-600 mt-3 p-3 bg-white/50 rounded-lg border border-orange-200">
              <strong className="text-orange-700">⚠️ Reminder:</strong> Only licensed clinicians may confirm a cancer diagnosis.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
            <button
              onClick={() => navigate(-1)}
              className="group px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-medium"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              Back
            </button>
            <button
              onClick={handleExportPDF}
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 font-semibold"
            >
              <span className="text-xl">📄</span>
              Export to PDF
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-slide-left {
          animation: slide-left 0.8s ease-out forwards;
        }
        .animate-slide-right {
          animation: slide-right 0.8s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ResultDiagnosis;
