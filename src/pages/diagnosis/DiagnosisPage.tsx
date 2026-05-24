import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, ChevronRight, AlertCircle, Home, Microscope } from "lucide-react";
import Footer from "../../components/layout/Footer";

interface DropdownProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onFocus?: () => void;
}

function CustomDropdown({ label, value, onChange, options, placeholder = "Select...",
  disabled = false, error, onFocus }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="space-y-1.5 relative">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (onFocus) onFocus(); if (!disabled) setOpen(!open); }}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-150 text-left
          ${error ? "border-red-400 bg-red-50" : open ? "border-cyan-500 ring-2 ring-cyan-100 bg-white" : "border-slate-300 bg-white hover:border-slate-400"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
      >
        <span className={value ? "text-slate-900 font-medium" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">No options available</div>
            ) : options.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                  ${value === opt.value ? "bg-[#1E3A5F] text-white font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

const DiagnosisPage: React.FC = () => {
  const [selectedCancer,     setSelectedCancer]     = useState("");
  const [selectedFeature,    setSelectedFeature]    = useState("");
  const [selectedDatasetKey, setSelectedDatasetKey] = useState("");
  const [cancerList,         setCancerList]         = useState<{ name: string; slug: string }[]>([]);
  const [rawOptions,         setRawOptions]         = useState<any[]>([]);
  const [cancerDetail,       setCancerDetail]       = useState<{ name: string; description: string } | null>(null);
  const [errors,             setErrors]             = useState({ cancer: "", feature: "", dataset: "" });

  const navigate = useNavigate();
  const baseUrl  = import.meta.env.VITE_AI_BACKEND_URL;

  useEffect(() => {
    fetch(`${baseUrl}/cancers/?ai_feature=diagnosis`)
      .then(r => r.json())
      .then(data => setCancerList(Array.isArray(data) ? data.map((i: any) => ({ name: i.name, slug: i.slug })) : []))
      .catch(() => setCancerList([]));
  }, [baseUrl]);

  useEffect(() => {
    if (!selectedCancer) { setRawOptions([]); setCancerDetail(null); return; }
    fetch(`${baseUrl}/cancers/${selectedCancer}/feature-options?ai_feature=diagnosis`)
      .then(r => r.json()).then(d => setRawOptions(Array.isArray(d) ? d : [])).catch(() => setRawOptions([]));
    fetch(`${baseUrl}/cancers/${selectedCancer}?ai_feature=diagnosis`)
      .then(r => r.json())
      .then(d => setCancerDetail(d?.description ? { name: d.name, description: d.description } : null))
      .catch(() => setCancerDetail(null));
  }, [selectedCancer, baseUrl]);

  const featureList = Array.from(new Set(rawOptions.map(o => o.ai_data_type)));
  const datasetList = rawOptions.filter(o => o.ai_data_type === selectedFeature).map(o => ({ key: o.key, label: o.label }));
  const cancerOpts  = cancerList.map(c => ({ value: c.slug, label: c.name }));
  const featureOpts = featureList.map(f => ({ value: f, label: f.toUpperCase() }));
  const datasetOpts = datasetList.map(d => ({ value: d.key, label: d.label }));

  const handleContinue = () => {
    const newErr = {
      cancer:  !selectedCancer     ? "Please select a cancer type."   : "",
      feature: !selectedFeature    ? "Please select an AI feature."   : "",
      dataset: !selectedDatasetKey ? "Please select a dataset type."  : "",
    };
    setErrors(newErr);
    if (Object.values(newErr).some(Boolean)) return;
    const cancerName = cancerList.find(c => c.slug === selectedCancer)?.name ||
      selectedCancer.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    navigate(`/upload/diagnosis/${selectedCancer}`, { state: { cancerName, datasetLabel: selectedDatasetKey } });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700 transition-colors">
              <Home size={12} /> Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-slate-800 font-medium">Diagnosis</span>
          </nav>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Microscope size={20} className="text-[#1E3A5F]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E3A5F]">Cancer Diagnosis</h1>
                <p className="text-xs text-slate-500">Configure your analysis parameters</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {["Parameters", "Upload", "Results"].map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${i === 0 ? "bg-[#1E3A5F] text-white" : "bg-slate-100 text-slate-400"}`}>{i + 1}</div>
                    <span className={`text-xs ${i === 0 ? "text-[#1E3A5F] font-medium" : "text-slate-400"}`}>{step}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-slate-200" />}
                </React.Fragment>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-5">
              <CustomDropdown label="Cancer Type" value={selectedCancer}
                onChange={v => { setSelectedCancer(v); setSelectedFeature(""); setSelectedDatasetKey(""); setErrors(e => ({ ...e, cancer: "" })); }}
                options={cancerOpts} placeholder="Select cancer type..." error={errors.cancer} />
              <CustomDropdown label="AI Feature" value={selectedFeature}
                onChange={v => { setSelectedFeature(v); setSelectedDatasetKey(""); setErrors(e => ({ ...e, feature: "" })); }}
                options={featureOpts} placeholder="Select AI feature..."
                disabled={!selectedCancer || featureList.length === 0} error={errors.feature}
                onFocus={() => { if (!selectedCancer) setErrors(e => ({ ...e, cancer: "Select cancer type first." })); }} />
              <CustomDropdown label="Dataset Type" value={selectedDatasetKey}
                onChange={v => { setSelectedDatasetKey(v); setErrors(e => ({ ...e, dataset: "" })); }}
                options={datasetOpts} placeholder="Select dataset type..."
                disabled={!selectedFeature || datasetList.length === 0} error={errors.dataset}
                onFocus={() => { if (!selectedFeature) setErrors(e => ({ ...e, feature: "Select AI feature first." })); }} />
            </div>

            {cancerDetail && (
              <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl animate-fadeIn">
                <p className="text-sm font-semibold text-[#1E3A5F] mb-1">{cancerDetail.name}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{cancerDetail.description}</p>
              </div>
            )}

            <button onClick={handleContinue}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg
                bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#1A3352] transition-colors duration-150">
              Continue to Upload <ChevronRight size={16} />
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            AI results must be validated by a licensed clinician.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DiagnosisPage;
