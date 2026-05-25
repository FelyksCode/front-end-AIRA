import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Brain, FlaskConical } from "lucide-react";

const badges = [
  { icon: ShieldCheck, text: "Clinically Validated" },
  { icon: Brain,       text: "Multi-modal AI" },
  { icon: FlaskConical,text: "3+ Cancer Types" },
];

export default function HeroSection() {
  return (
    <section className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Text */}
          <div className="space-y-8 animate-fadeIn">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                bg-cyan-50 text-cyan-700 text-xs font-semibold border border-cyan-200">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse-status" />
                AI Clinical Decision Support
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#1E3A5F]
                leading-[1.1] tracking-tight">
                Precision Cancer<br />
                <span className="text-cyan-600">Analysis</span> for<br />
                Clinical Practice
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                AIRA empowers clinicians with AI-assisted tools for cancer diagnosis,
                prognosis prediction, and treatment planning — powered by
                multi-modal machine learning.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/diagnosis"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                  bg-[#1E3A5F] text-white text-sm font-semibold
                  hover:bg-[#1A3352] transition-colors duration-150"
              >
                Start Diagnosis
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/news"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                  border border-slate-300 text-slate-700 text-sm font-semibold
                  hover:bg-slate-50 transition-colors duration-150"
              >
                Latest News
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {badges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-slate-500">
                  <Icon size={15} className="text-slate-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Visual */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/picture1.jpg"
                alt="Cancer Analysis Platform"
                className="w-full h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/70 via-transparent to-transparent" />

              {/* Floating result card */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      AI Analysis Result
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      bg-green-100 text-green-700 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Prediction", value: "Stage I–II" },
                      { label: "Confidence", value: "94.2%"     },
                      { label: "Model",      value: "CNN + GBM"  },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                        <p className="text-sm font-bold text-[#1E3A5F]">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative stat pill */}
            <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-2
              bg-white rounded-xl px-4 py-2.5 shadow-lg border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <Brain size={16} className="text-cyan-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">AI Models</p>
                <p className="text-sm font-bold text-slate-800">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
