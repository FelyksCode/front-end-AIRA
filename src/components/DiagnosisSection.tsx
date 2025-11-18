import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const DiagnosisSection: React.FC = () => {
  const [selectedCancer, setSelectedCancer] = useState("");
  const [selectedFeature, setSelectedFeature] = useState("");
  const [selectedDatasetKey, setSelectedDatasetKey] = useState("");
  const [cancerList, setCancerList] = useState<{ name: string; slug: string }[]>([]);
  const [rawOptions, setRawOptions] = useState<any[]>([]);
  const [cancerDetail, setCancerDetail] = useState<{ name: string; description: string } | null>(null);

  // Error + Popup states
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [fieldError, setFieldError] = useState({ cancer: "", feature: "", dataset: "" });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  useEffect(() => {
    fetch(`${baseUrl}/cancers/?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => {
        const cancers = Array.isArray(data) ? data.map((item: any) => ({ name: item.name, slug: item.slug })) : [];
        setCancerList(cancers);
      })
      .catch((err) => {
        console.error("Failed to fetch cancer list:", err);
        setCancerList([]);
      });
  }, [baseUrl]);

  useEffect(() => {
    if (!selectedCancer) {
      setRawOptions([]);
      setCancerDetail(null);
      return;
    }

    fetch(`${baseUrl}/cancers/${selectedCancer}/feature-options?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => setRawOptions(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to fetch feature options:", err);
        setRawOptions([]);
      });

    fetch(`${baseUrl}/cancers/${selectedCancer}?ai_feature=diagnosis`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.description) setCancerDetail({ name: data.name, description: data.description });
        else setCancerDetail(null);
      })
      .catch((err) => {
        console.error("Failed to fetch cancer detail:", err);
        setCancerDetail(null);
      });
  }, [selectedCancer, baseUrl]);

  const featureList = Array.from(new Set(rawOptions.map((opt) => opt.ai_data_type)));
  const datasetList = rawOptions.filter((opt) => opt.ai_data_type === selectedFeature).map((opt) => ({ key: opt.key, label: opt.label }));

  // Helper to show error (popup + per-field red text)
  const showError = (msg: string, field?: "cancer" | "feature" | "dataset") => {
    setErrorMessage(msg);
    setShowPopup(true);
    setFieldError({
      cancer: field === "cancer" ? msg : "",
      feature: field === "feature" ? msg : "",
      dataset: field === "dataset" ? msg : "",
    });
  };

  // Clear errors for a specific field
  const clearFieldError = (field?: "cancer" | "feature" | "dataset") => {
    setErrorMessage("");
    setShowPopup(false);
    setFieldError((prev) => ({
      cancer: field === "cancer" ? "" : prev.cancer,
      feature: field === "feature" ? "" : prev.feature,
      dataset: field === "dataset" ? "" : prev.dataset,
    }));
  };

  const handleContinue = () => {
    // final validation when pressing continue
    if (!selectedCancer) {
      showError("⚠️ Please select a cancer type before continuing.", "cancer");
      return;
    }
    if (!selectedFeature) {
      showError("⚠️ Please select an AI feature before continuing.", "feature");
      return;
    }
    if (!selectedDatasetKey) {
      showError("⚠️ Please select a dataset type before continuing.", "dataset");
      return;
    }

    // clear errors and navigate
    clearFieldError();
    const selectedCancerName = cancerList.find((c) => c.slug === selectedCancer)?.name || selectedCancer.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    navigate(`/upload/diagnosis/${selectedCancer}`, {
      state: {
        cancerName: selectedCancerName,
        datasetLabel: selectedDatasetKey,
      },
    });
  };

  // Prevent native dropdown from opening if invalid; show error instead
  const onCancerMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
    // allow always
  };

  const onFeatureMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (!selectedCancer) {
      e.preventDefault(); // prevent opening
      showError("⚠️ Select cancer type first.", "cancer");
    } else {
      clearFieldError("feature");
    }
  };

  const onDatasetMouseDown = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (!selectedFeature) {
      e.preventDefault(); // prevent opening
      showError("⚠️ Select AI feature first.", "feature");
    } else {
      clearFieldError("dataset");
    }
  };

  const rotateIcon = (e: React.MouseEvent) => {
    const icon = (e.currentTarget as HTMLElement).parentElement?.querySelector(".drop-icon");
    icon?.classList.toggle("rotate-180");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main
        className="relative flex flex-col md:flex-row flex-1 overflow-hidden"
        style={{
          backgroundImage: `url('/picture3.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center left',
        }}
      >
        <div className="hidden md:block md:w-1/2" />

        <div className="w-full md:w-1/2 flex items-center justify-center bg-[#6592bf]/90 py-10 md:py-0">
          <div className="flex flex-col gap-6 bg-white rounded-lg shadow-lg p-6 sm:p-8 w-[90%] sm:w-[80%] md:max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#191757]">Diagnosis</h2>

            {/* Cancer Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Cancer Type</label>
              <div className="relative">
                <select
                  value={selectedCancer}
                  onChange={(e) => {
                    setSelectedCancer(e.target.value);
                    setSelectedFeature("");
                    setSelectedDatasetKey("");
                    clearFieldError("cancer");
                  }}
                  onMouseDown={onCancerMouseDown}
                  onClick={rotateIcon}
                  className={`w-full border rounded p-2 bg-white text-black appearance-none ${fieldError.cancer ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">-- Choose --</option>
                  {cancerList.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <svg className="drop-icon absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldError.cancer && <p className="text-red-600 text-xs mt-1">{fieldError.cancer}</p>}
            </div>

            {/* AI Feature */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select AI Feature</label>
              <div className="relative">
                <select
                  value={selectedFeature}
                  onChange={(e) => {
                    if (!selectedCancer) return; // safety (should be prevented by onMouseDown)
                    setSelectedFeature(e.target.value);
                    setSelectedDatasetKey("");
                    clearFieldError("feature");
                  }}
                  onMouseDown={onFeatureMouseDown}
                  onClick={rotateIcon}
                  disabled={featureList.length === 0}
                  className={`w-full border rounded p-2 bg-white text-black appearance-none ${fieldError.feature ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">-- Choose --</option>
                  {featureList.map((f) => (
                    <option key={f} value={f}>
                      {f.toUpperCase()}
                    </option>
                  ))}
                </select>

                <svg className="drop-icon absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldError.feature && <p className="text-red-600 text-xs mt-1">{fieldError.feature}</p>}
            </div>

            {/* Dataset Type */}
            <div>
              <label className="font-semibold block mb-2 text-[#191757]">Select Dataset Type</label>
              <div className="relative">
                <select
                  value={selectedDatasetKey}
                  onChange={(e) => {
                    if (!selectedFeature) return; // safety
                    setSelectedDatasetKey(e.target.value);
                    clearFieldError("dataset");
                  }}
                  onMouseDown={onDatasetMouseDown}
                  onClick={rotateIcon}
                  disabled={datasetList.length === 0}
                  className={`w-full border rounded p-2 bg-white text-black appearance-none ${fieldError.dataset ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">-- Choose --</option>
                  {datasetList.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>

                <svg className="drop-icon absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {fieldError.dataset && <p className="text-red-600 text-xs mt-1">{fieldError.dataset}</p>}
            </div>

            {/* Cancer description */}
            {cancerDetail && (
              <div className="bg-gray-100 border border-gray-300 rounded p-4 text-sm">
                <h4 className="font-bold text-[#191757] mb-2">{cancerDetail.name}</h4>
                <p className="font-light">{cancerDetail.description}</p>
              </div>
            )}

            {/* Error summary (kept for compatibility) */}
            {errorMessage && !showPopup && <div className="text-red-600 text-sm bg-red-50 border border-red-300 rounded p-3">{errorMessage}</div>}

            <button
              onClick={handleContinue}
              className={`w-full px-4 py-2 text-white font-semibold rounded transition ${!selectedCancer || !selectedDatasetKey ? "bg-gray-400 cursor-not-allowed" : "bg-[#191757] hover:bg-[#15144a]"}`}
            >
              Continue
            </button>
          </div>
        </div>
      </main>

      <div className="bg-[#aaaaaa] text-white text-center py-6 px-4">
        <p className="text-lg font-semibold">Empowering early cancer detection with AI technology</p>
      </div>

     
      <Footer />

      {/* Error Popup */}
      {showPopup && errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border-l-4 border-red-600 rounded p-6 shadow max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-red-700 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{errorMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowPopup(false);
                  // keep field errors shown but close popup
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisSection;
