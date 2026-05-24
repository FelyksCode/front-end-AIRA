import { useNavigate } from "react-router-dom";
import { Microscope, ArrowRight } from "lucide-react";

export default function DiagnosisFeature() {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/diagnosis")}
      className="group bg-white rounded-2xl border border-slate-200 shadow-sm
        hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="relative h-44 overflow-hidden">
        <img src="/picture1.jpg" alt="Diagnosis" className="w-full h-full object-cover
          group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/80 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            bg-white/15 backdrop-blur-sm text-white text-xs font-medium border border-white/20">
            <Microscope size={12} /> Diagnosis
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-1.5 group-hover:text-[#1E3A5F]
          transition-colors">
          Cancer Diagnosis
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          AI-assisted early cancer detection from clinical datasets.
          Supports image, genomic, and tabular data modalities.
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); navigate("/diagnosis"); }}
          className="inline-flex items-center gap-1.5 text-[#1E3A5F] text-xs font-semibold
            hover:gap-2.5 transition-all duration-150"
        >
          Start Analysis <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
