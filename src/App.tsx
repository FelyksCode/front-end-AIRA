import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Layout
import Navbar from "./components/layout/Navbar";

// Home
import HomePage from "./pages/home/HomePage";

// Diagnosis
import DiagnosisPage from "./pages/diagnosis/DiagnosisPage";
import UploadDiagnosis from "./pages/diagnosis/UploadDiagnosis";
import ResultDiagnosis from "./pages/diagnosis/ResultDiagnosis";

// Prognosis
import PrognosisPage from "./pages/prognosis/PrognosisPage";
import UploadPrognosis from "./pages/prognosis/UploadPrognosis";
import UploadPrognosisMulti from "./pages/prognosis/UploadPrognosisMulti";
import ResultPrognosis from "./pages/prognosis/ResultPrognosis";

// Treatment
import TreatmentPage from "./pages/treatment/TreatmentPage";
import UploadTreatment from "./pages/treatment/UploadTreatment";
import UploadTreatmentMulti from "./pages/treatment/UploadTreatmentMulti";
import ResultTreatment from "./pages/treatment/ResultTreatment";

// News
import NewsPage from "./pages/news/NewsPage";
import NewsDetail from "./pages/news/NewsDetail";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans overflow-x-hidden">
      <Router>
        <Navbar />

        <main className="flex-1 w-full overflow-x-hidden">
          <Routes>
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Diagnosis */}
            <Route path="/diagnosis" element={<DiagnosisPage />} />
            <Route path="/upload/diagnosis/:cancerSlug" element={<UploadDiagnosis />} />
            <Route path="/upload-diagnosis/:cancerSlug" element={<UploadDiagnosis />} />
            <Route path="/result-diagnosis" element={<ResultDiagnosis />} />

            {/* Prognosis */}
            <Route path="/prognosis" element={<PrognosisPage />} />
            <Route path="/upload/prognosis" element={<UploadPrognosis />} />
            <Route path="/upload/prognosis/multi" element={<UploadPrognosisMulti />} />
            <Route path="/result/prognosis" element={<ResultPrognosis />} />

            {/* Treatment */}
            <Route path="/treatment" element={<TreatmentPage />} />
            <Route path="/upload/treatment" element={<UploadTreatment />} />
            <Route path="/upload/treatment/multi" element={<UploadTreatmentMulti />} />
            <Route path="/result/treatment" element={<ResultTreatment />} />

            {/* News */}
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetail />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
