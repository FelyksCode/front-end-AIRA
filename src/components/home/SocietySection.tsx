import { Target, Layers, Zap, Lock } from "lucide-react";

const stats = [
  { value: "4",        label: "Cancer Types Supported" },
  { value: "8",        label: "AI Models (GENE, METHYL, MIRNA, RADIOMICS)" },
  { value: "Real-time", label: "Processing & Analysis" },
];

const capabilities = [
  {
    icon: Target,
    title: "High-Accuracy Prediction",
    desc:  "Models trained on curated clinical datasets, validated against medical standards.",
  },
  {
    icon: Layers,
    title: "Multi-modal Analysis",
    desc:  "Integrates imaging (CT/MRI), genomic profiles, and tabular clinical data.",
  },
  {
    icon: Zap,
    title: "Rapid Turnaround",
    desc:  "Upload a dataset and receive structured AI insights within seconds.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    desc:  "Patient data is processed on-premise and never stored externally.",
  },
];

export default function SocietySection() {
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-3">
            Built for Clinical Excellence
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            AIRA is designed with clinicians in mind — precise, transparent, and reliable.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 text-center border border-slate-200 shadow-sm"
            >
              <p className="text-2xl font-extrabold text-[#1E3A5F] mb-1">{value}</p>
              <p className="text-xs text-slate-500 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* Capabilities grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1E3A5F]/8 flex items-center
                justify-center mb-4 bg-slate-100">
                <Icon size={20} className="text-[#1E3A5F]" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
