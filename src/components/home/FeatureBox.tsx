import { MousePointerClick, SlidersHorizontal, Upload, FileBarChart2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MousePointerClick,
    title: "Select Cancer Type",
    desc:  "Choose from 50+ supported cancer types in our clinical database.",
    color: "text-[#1E3A5F]",
    bg:    "bg-blue-50",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Configure Parameters",
    desc:  "Select the AI feature type and matching dataset modality.",
    color: "text-cyan-700",
    bg:    "bg-cyan-50",
  },
  {
    number: "03",
    icon: Upload,
    title: "Upload Dataset",
    desc:  "Securely upload your clinical dataset — CSV, gene expression, or imaging.",
    color: "text-violet-700",
    bg:    "bg-violet-50",
  },
  {
    number: "04",
    icon: FileBarChart2,
    title: "Receive AI Report",
    desc:  "Get a structured clinical report with confidence scores and key biomarkers.",
    color: "text-green-700",
    bg:    "bg-green-50",
  },
];

export default function FeatureBox() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-3">How It Works</h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            From dataset to clinical insight in four straightforward steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-[2.75rem] left-[12.5%] right-[12.5%]
            h-px bg-slate-200 z-0" />

          {steps.map(({ number, icon: Icon, title, desc, color, bg }) => (
            <div key={number} className="relative z-10 text-center group">
              {/* Icon circle */}
              <div className="flex justify-center mb-4">
                <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center
                  ring-4 ring-white shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={22} className={color} />
                </div>
              </div>

              <span className={`text-xs font-bold ${color} tracking-widest`}>{number}</span>
              <h3 className="text-base font-semibold text-slate-900 mt-1.5 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed px-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
