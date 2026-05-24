import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Home, Pill, ChevronRight, ArrowLeft, Clock } from "lucide-react";
import Footer from "../../components/layout/Footer";

const ResultTreatment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { predictionResult } = (location.state as { predictionResult?: any }) || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-700"><Home size={12}/> Home</Link>
            <ChevronRight size={12}/>
            <Link to="/treatment" className="hover:text-slate-700">Treatment</Link>
            <ChevronRight size={12}/>
            <span className="text-slate-800 font-medium">Results</span>
          </nav>
        </div>
      </div>
      <main className="flex-1 px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Pill size={20} className="text-violet-600"/>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1E3A5F]">AI Treatment Report</h1>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString("en-GB")}</p>
              </div>
            </div>
          </div>
          {predictionResult ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Prediction Result</h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap break-all">
                  {JSON.stringify(predictionResult, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-slate-400"/>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Result Pending</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No treatment data found. Please complete the upload step to generate a result.
              </p>
            </div>
          )}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            <strong>Clinical Note:</strong> AI treatment recommendations must be reviewed by a qualified
            oncologist and clinical pharmacologist before patient application.
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
              <ArrowLeft size={16}/> Back
            </button>
          </div>
        </div>
      </main>
      <Footer/>
    </div>
  );
};
export default ResultTreatment;
