import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// General
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import NewsSection from "./components/NewsSection";
import NewsDetail from "./components/NewsDetail";
import Footer from "./components/Footer";

// Diagnosis
import DiagnosisSection from "./components/DiagnosisSection";
import UploadDiagnosis from "./components/UploadDiagnosis";
import UploadDiagnosisMulti from "./components/UploadDiagnosisMulti";
import ResultDiagnosis from "./components/ResultDiagnosis";

// Prognosis
import PrognosisSection from "./components/PrognosisSection";
import UploadPrognosis from "./components/UploadPrognosis";
import UploadPrognosisMulti from "./components/UploadPrognosisMulti";
import ResultPrognosis from "./components/ResultPrognosis";

// Treatment
import TreatmentSection from "./components/TreatmentSection";
import UploadTreatment from "./components/UploadTreatment";
import UploadTreatmentMulti from "./components/UploadTreatmentMulti";
import ResultTreatment from "./components/ResultTreatment";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans overflow-x-hidden">
      <Router>
        {/* ✅ Navbar tetap di atas */}
        <Navbar />

        {/* ✅ Konten utama full tanpa margin/padding global */}
        <main className="flex-1 w-screen px-0 sm:px-2 md:px-4 lg:px-6 overflow-hidden">
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Diagnosis */}
            <Route path="/diagnosis" element={<DiagnosisSection />} />
            <Route path="/upload/diagnosis/:cancerSlug" element={<UploadDiagnosis />} />
            <Route path="/upload-diagnosis/:cancerSlug" element={<UploadDiagnosis />} />
            <Route path="/result-diagnosis" element={<ResultDiagnosis />} />

            {/* Prognosis */}
            <Route path="/prognosis" element={<PrognosisSection />} />
            <Route path="/upload/prognosis" element={<UploadPrognosis />} />
            <Route path="/upload/prognosis/multi" element={<UploadPrognosisMulti />} />
            <Route path="/result/prognosis" element={<ResultPrognosis />} />

            {/* Treatment */}
            <Route path="/treatment" element={<TreatmentSection />} />
            <Route path="/upload/treatment" element={<UploadTreatment />} />
            <Route path="/upload/treatment/multi" element={<UploadTreatmentMulti />} />
            <Route path="/result/treatment" element={<ResultTreatment />} />

            {/* News */}
            <Route path="/news" element={<NewsSection />} />
            <Route path="/news/:id" element={<NewsDetail />} />
          </Routes>
        </main>

        {/* ✅ Footer dipaksa full sampai kiri-kanan */}
      </Router>
    </div>
  );
}

export default App;
