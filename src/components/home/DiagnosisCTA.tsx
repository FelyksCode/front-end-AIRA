import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Pill } from "lucide-react";

export default function DiagnosisCTA() {
  return (
    <section className="bg-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Left — Heading */}
          <div className="max-w-lg">
            <p className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">
              AI Research Group · UMN
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
              Ready to begin clinical pathway analysis?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              AIRA's AI models are ready to support disease clinical pathway analysis
              and prediction. Select a feature below to get started.
            </p>
          </div>

          {/* Right — Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
            <Link
              to="/diagnosis"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                bg-white text-[#1E3A5F] text-sm font-semibold
                hover:bg-slate-100 transition-colors duration-150"
            >
              Start Diagnosis <ArrowRight size={15} />
            </Link>

            <Link
              to="/prognosis"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                border border-white/60 text-white text-sm font-semibold
                hover:bg-white/10 hover:border-white transition-colors duration-150"
            >
              <TrendingUp size={15} />
              Prognosis
            </Link>

            <Link
              to="/treatment"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                border border-white/60 text-white text-sm font-semibold
                hover:bg-white/10 hover:border-white transition-colors duration-150"
            >
              <Pill size={15} />
              Treatment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
