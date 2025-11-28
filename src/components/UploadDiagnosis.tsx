import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, ArrowLeft, Trash2 } from "lucide-react";
import Footer from "./Footer";

const UploadDiagnosis: React.FC = () => {
  const { cancerSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_AI_BACKEND_URL;

  const { cancerName, datasetLabel } = location.state || {};

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loadingTime, setLoadingTime] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // popup like DiagnosisSection
  const [showPopup, setShowPopup] = useState(false);

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
    setErrorMessage("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      handleFileChange(file);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setRawResponse("");

    if (!uploadedFile) {
      setErrorMessage("⚠️ Please upload a .csv file before continuing.");
      setShowPopup(true);
      return;
    }

    if (!cancerSlug || !datasetLabel) {
      setErrorMessage("❗ Missing required cancer or dataset info.");
      setShowPopup(true);
      return;
    }

    if (uploadedFile.type !== "text/csv") {
      setErrorMessage("❌ Invalid file type. Please upload a .csv file.");
      setShowPopup(true);
      return;
    }

    setIsLoading(true);
    setLoadingTime(0);
    setProgressPercent(0);

    const url = `${baseUrl}/cancers/${cancerSlug}/predict`;
    const formData = new FormData();
    formData.append("ai_feature", "diagnosis");
    formData.append("feature_key", datasetLabel);
    formData.append("file", uploadedFile);

    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLoadingTime(elapsed);
      setProgressPercent(Math.min(100, (elapsed / 10000) * 100));
    }, 500);

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const text = await res.text();
      clearInterval(timer);

      setProgressPercent(100);
      setIsLoading(false);
      setRawResponse(text);

      if (!res.ok) {
        if (text.includes("Invalid CSV") || text.toLowerCase().includes("format")) {
          setErrorMessage(
            "❌ Invalid dataset format. Please upload a valid .csv file with correct headers."
          );
        } else {
          setErrorMessage(text || "❌ Server error occurred.");
        }
        setShowPopup(true);
        return;
      }

      try {
        const result = JSON.parse(text);
        navigate("/result-diagnosis", {
          state: { predictionResult: result, cancerName, datasetLabel },
        });
      } catch {
        setErrorMessage("⚠️ Backend returned invalid JSON. Raw response shown below.");
        setShowPopup(true);
      }
    } catch (err: any) {
      clearInterval(timer);
      setErrorMessage(err.message || "❌ Failed to submit prediction");
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#f5f5f5] to-[#eaeefc]">

      {/* ANIMATED LOADING BAR */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#191757] to-[#2a2680] text-white text-sm py-4 px-6 shadow-2xl z-50"
          >
            <div className="flex justify-between items-center mb-2">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="font-semibold text-base"
              >
                ⏳ Generating diagnosis result...
              </motion.span>
              <span className="text-xs font-mono bg-white/20 px-3 py-1 rounded-full">
                {Math.floor(loadingTime / 1000)}s
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden backdrop-blur-sm">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full shadow-lg"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex flex-1 items-center justify-center py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-2xl shadow-2xl border border-[#d6d6f0] p-10 w-full max-w-5xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#191757] to-[#2a2680] text-center mb-4"
          >
            Upload Dataset
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-gray-600 mb-8 text-sm"
          >
            Upload input dataset file for diagnosis prediction
          </motion.p>

          <div className="space-y-6">
            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-sm text-gray-700 bg-gradient-to-br from-[#f0f4ff] to-[#e8f0ff] p-5 rounded-xl border border-[#cdd5f5] shadow-sm"
            >
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-[#191757]">Cancer Type:</span>
                  <span className="text-gray-800">{cancerName || "Unknown"}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-[#191757]">AI Feature:</span>
                  <span className="text-gray-800">Diagnosis</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-[#191757]">Dataset Key:</span>
                  <span className="text-gray-800">{datasetLabel || "No dataset added here"}</span>
                </p>
              </div>
            </motion.div>

            {/* Upload Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <label className="block font-semibold mb-3 text-[#191757] text-lg">
                Upload File (.csv)
              </label>

              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                  ? "border-[#191757] bg-blue-50 shadow-lg scale-105"
                  : uploadedFile
                    ? "border-green-400 bg-green-50"
                    : "border-[#b0b0d0] bg-gradient-to-br from-gray-50 to-blue-50 hover:border-[#191757] hover:shadow-md"
                  }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{
                        y: uploadedFile ? 0 : [0, -10, 0],
                        rotate: uploadedFile ? 0 : [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: uploadedFile ? 0 : Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {uploadedFile ? (
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                      ) : (
                        <Upload className="w-16 h-16 text-[#191757]" />
                      )}
                    </motion.div>

                    <div>
                      <p className="text-[#191757] font-semibold text-lg mb-1">
                        {uploadedFile ? "File uploaded successfully!" : "Click to browse or drag & drop"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Only .csv files are supported
                      </p>
                    </div>
                  </div>
                </label>

                {/* File Preview */}
                <AnimatePresence>
                  {uploadedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="mt-6 p-4 bg-white rounded-xl shadow-md border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-10 h-10 text-green-600" />
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-800">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            handleFileChange(null);
                          }}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-8 gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all ${isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#191757] hover:bg-[#2a2680] text-white"
                  }`}
              >
                {isLoading ? "Processing..." : "Continue"}
              </motion.button>
            </motion.div>

            {/* Raw Response */}
            <AnimatePresence>
              {rawResponse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 p-6 border-2 border-red-300 rounded-xl bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
                    <h3 className="font-bold mb-3 text-red-700 text-lg">Raw Server Response</h3>
                    <pre className="text-sm text-red-800 whitespace-pre-wrap bg-white/50 p-4 rounded-lg">
                      {rawResponse}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Error Popup with Animation */}
      <AnimatePresence>
        {showPopup && errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white border-l-4 border-red-600 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4"
            >
              <h3 className="text-xl font-bold text-red-700 mb-3">Error</h3>
              <p className="text-red-600 mb-6">{errorMessage}</p>
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md font-semibold"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UploadDiagnosis;
