import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Footer from "./Footer";

// Custom Dropdown Component with Bouncy Animation
interface CustomDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onFocus?: () => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Choose",
  disabled = false,
  hasError = false,
  errorMessage = "",
  onFocus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (onFocus) onFocus();
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="font-semibold block mb-2 text-[#191757]">{label}</label>

      {/* Dropdown Button */}
      <motion.button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
        className={`w-full border rounded-lg p-3 bg-gradient-to-br from-white to-gray-50 text-left flex items-center justify-between transition-all duration-200 ${hasError
          ? "border-red-500 shadow-red-100"
          : isOpen
            ? "border-[#191757] shadow-lg shadow-blue-100"
            : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={value ? "text-black font-medium" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ChevronDown className={`w-5 h-5 ${hasError ? "text-red-500" : "text-gray-500"}`} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 20,
              mass: 0.6,
            }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-gray-400 text-sm">No options available</div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`px-4 py-3 cursor-pointer transition-all duration-200 ${value === option.value
                      ? "bg-[#191757] text-white font-semibold"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700"
                      }`}
                  >
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {hasError && errorMessage && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs mt-1"
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
};

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Prepare options for dropdowns
  const cancerOptions = cancerList.map((c) => ({ value: c.slug, label: c.name }));
  const featureOptions = featureList.map((f) => ({ value: f, label: f.toUpperCase() }));
  const datasetOptions = datasetList.map((d) => ({ value: d.key, label: d.label }));

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #191757;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #15144a;
        }
      `}</style>

      <main
        className="relative flex flex-col md:flex-row flex-1 overflow-hidden"
        style={{
          backgroundImage: `url('/picture1.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hidden md:block md:w-1/2" />

        <motion.div
          className="w-full md:w-[85%] aspect-[3/2] flex items-center justify-center bg-[#6592bf]/90 py-4 md:py-2 mx-auto"
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "easeIn" }}
        >
          <motion.div
            className="flex flex-col gap-6 bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[80%] md:max-w-md mx-auto backdrop-blur-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-center text-[#191757] mb-2"
            >
              Diagnosis
            </motion.h2>

            {/* Cancer Type Dropdown */}
            <motion.div variants={itemVariants}>
              <CustomDropdown
                label="Select Cancer Type"
                value={selectedCancer}
                onChange={(value) => {
                  setSelectedCancer(value);
                  setSelectedFeature("");
                  setSelectedDatasetKey("");
                  clearFieldError("cancer");
                }}
                options={cancerOptions}
                placeholder="Choose cancer type"
                hasError={!!fieldError.cancer}
                errorMessage={fieldError.cancer}
              />
            </motion.div>

            {/* AI Feature Dropdown */}
            <motion.div variants={itemVariants}>
              <CustomDropdown
                label="Select AI Feature"
                value={selectedFeature}
                onChange={(value) => {
                  setSelectedFeature(value);
                  setSelectedDatasetKey("");
                  clearFieldError("feature");
                }}
                options={featureOptions}
                placeholder="Choose AI feature"
                disabled={!selectedCancer || featureList.length === 0}
                hasError={!!fieldError.feature}
                errorMessage={fieldError.feature}
                onFocus={() => {
                  if (!selectedCancer) {
                    showError("⚠️ Select cancer type first.", "cancer");
                  }
                }}
              />
            </motion.div>

            {/* Dataset Type Dropdown */}
            <motion.div variants={itemVariants}>
              <CustomDropdown
                label="Select Dataset Type"
                value={selectedDatasetKey}
                onChange={(value) => {
                  setSelectedDatasetKey(value);
                  clearFieldError("dataset");
                }}
                options={datasetOptions}
                placeholder="Choose dataset type"
                disabled={!selectedFeature || datasetList.length === 0}
                hasError={!!fieldError.dataset}
                errorMessage={fieldError.dataset}
                onFocus={() => {
                  if (!selectedFeature) {
                    showError("⚠️ Select AI feature first.", "feature");
                  }
                }}
              />
            </motion.div>

            {/* Cancer Description */}
            <AnimatePresence>
              {cancerDetail && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-sm overflow-hidden"
                >
                  <h4 className="font-bold text-[#191757] mb-2">{cancerDetail.name}</h4>
                  <p className="font-light text-gray-700">{cancerDetail.description}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue Button */}
            <motion.button
              variants={itemVariants}
              onClick={handleContinue}
              whileHover={selectedCancer && selectedDatasetKey ? { scale: 1.02, y: -2 } : {}}
              whileTap={selectedCancer && selectedDatasetKey ? { scale: 0.98 } : {}}
              className={`w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg ${!selectedCancer || !selectedDatasetKey
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#191757] to-[#2a2680] hover:shadow-xl hover:from-[#15144a] hover:to-[#1f1c60]"
                }`}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      </main>

      <div className="bg-[#aaaaaa] text-white text-center py-6 px-4">
        <p className="text-lg font-semibold">Empowering early cancer detection with AI technology</p>
      </div>

      <Footer />

      {/* Error Popup */}
      <AnimatePresence>
        {showPopup && errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white border-l-4 border-red-600 rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-bold text-red-700 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
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

export default DiagnosisSection;
