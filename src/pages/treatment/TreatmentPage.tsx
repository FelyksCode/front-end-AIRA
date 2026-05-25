import { Link } from "react-router-dom";
import { ChevronRight, Home, Pill, Clock, Bell } from "lucide-react";
import Footer from "../../components/layout/Footer";

export default function TreatmentPage() {
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
            <span className="text-slate-800 font-medium">Treatment</span>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center animate-fadeIn">

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-violet-50 border border-violet-100
                flex items-center justify-center">
                <Pill size={40} className="text-violet-600" />
              </div>
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-100
                border-2 border-white flex items-center justify-center">
                <Clock size={13} className="text-amber-600" />
              </span>
            </div>
          </div>

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Under Development
          </span>

          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-3">
            Treatment Planning
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
            The AI treatment planning module is currently being developed and
            clinically validated. It will support personalised oncology
            treatment recommendations.
          </p>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-3 mb-10 text-left">
            {[
              { label: "AI Models", value: "8 Models", sub: "GENE · METHYL · MIRNA · RADIOMICS" },
              { label: "Cancer Types", value: "3 Types", sub: "Supported cancer categories" },
              { label: "Status", value: "In Progress", sub: "Expected Q3 2025" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm font-bold text-[#1E3A5F]">{value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/diagnosis"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                bg-[#1E3A5F] text-white text-sm font-semibold
                hover:bg-[#1A3352] transition-colors duration-150"
            >
              Try Diagnosis Instead
              <ChevronRight size={15} />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                border border-slate-300 text-slate-600 text-sm font-semibold
                hover:bg-slate-50 transition-colors duration-150"
            >
              <Bell size={14} />
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-slate-400 mt-8">
            AI results must be validated by a licensed clinician.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
