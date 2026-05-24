import HeroSection from '../../components/home/HeroSection';
import SocietySection from '../../components/home/SocietySection';
import FeatureBox from '../../components/home/FeatureBox';
import DiagnosisCTA from '../../components/home/DiagnosisCTA';
import DiagnosisFeature from '../../components/home/DiagnosisFeature';
import PrognosisFeature from '../../components/home/PrognosisFeature';
import TreatmentFeature from '../../components/home/TreatmentFeature';
import Footer from '../../components/layout/Footer';

function HomePage() {
  return (
    <div className="min-h-screen bg-white w-full">
      <HeroSection />
      <SocietySection />
      <FeatureBox />
      <DiagnosisCTA />

      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <DiagnosisFeature />
            <PrognosisFeature />
            <TreatmentFeature />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;
